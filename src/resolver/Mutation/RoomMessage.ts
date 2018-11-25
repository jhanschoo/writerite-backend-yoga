import { IFieldResolver } from 'graphql-tools';

import { MutationType, IWrContext } from '../../types';

import { IBakedRoomMessage, pSimpleUserRoomMessageToIRoomMessage } from '../RoomMessage';
import { IRoomMessagePayload, roomMessageTopicFromRoom } from '../Subscription/RoomMessage';

const roomMessageCreate: IFieldResolver<any, IWrContext, {
  roomId: string, messageContent: string,
}> = async (
  _parent, { roomId, messageContent }, { sub, prisma, pubsub },
): Promise<IBakedRoomMessage | null> => {
  if (!sub) {
    return null;
  }
  if (!(await prisma.$exists.room({ id: roomId }))
    || (!(await prisma.room({ id: roomId }).occupants())
      .map((user) => user.id).includes(sub.id))) {
    return null;
  }
  const pRoomMessage = await prisma.createSimpleUserRoomMessage({
    content: messageContent,
    room: { connect: { id: roomId } },
    sender: { connect: { id: sub.id } },
  });
  if (!pRoomMessage) {
    return null;
  }
  const roomMessageObj = pSimpleUserRoomMessageToIRoomMessage(pRoomMessage, prisma);
  const roomMessageUpdate: IRoomMessagePayload = {
    roomMessageUpdatesOfRoom: {
      mutation: MutationType.CREATED,
      new: roomMessageObj,
      oldId: null,
    },
  };
  pubsub.publish(roomMessageTopicFromRoom(roomId), roomMessageUpdate);
  return roomMessageObj;
};

export const roomMessageMutation = {
  roomMessageCreate,
};
