import { IFieldResolver } from 'graphql-tools';

import { MutationType, IWrContext } from '../../types';

import { IBakedRwRoomMessage, pSimpleUserRoomMessageToRwRoomMessage } from '../RwRoomMessage';
import { IRwRoomMessagePayload, rwRoomMessageTopicFromRwRoom } from '../Subscription/RwRoomMessage';

const rwRoomMessageCreate: IFieldResolver<any, IWrContext, {
  roomId: string, messageContent: string,
}> = async (
  _parent, { roomId, messageContent }, { sub, prisma, pubsub },
): Promise<IBakedRwRoomMessage | null> => {
  if (!sub) {
    return null;
  }
  const pRoom = await prisma.room({ id: roomId });
  if (!pRoom) {
    return null;
  }
  if (await prisma.room({id: roomId}).owner().id() !== sub.id) {
    // workaround for OR not working properly in prisma client
    // c.f. https://github.com/prisma/prisma/issues/3763
    if (!(await prisma.room({ id: roomId }).occupants())
      .map((user) => user.id).includes(sub.id)) {
      return null;
    }
  }
  const pRoomMessage = await prisma.createSimpleUserRoomMessage({
    content: messageContent,
    room: { connect: { id: roomId } },
    sender: { connect: { id: sub.id } },
  });
  if (!pRoomMessage) {
    return null;
  }
  const roomMessageObj = pSimpleUserRoomMessageToRwRoomMessage(pRoomMessage, prisma);
  const roomMessageUpdate: IRwRoomMessagePayload = {
    rwRoomMessageUpdatesOfRoom: {
      mutation: MutationType.CREATED,
      new: roomMessageObj,
      oldId: null,
    },
  };
  pubsub.publish(rwRoomMessageTopicFromRwRoom(roomId), roomMessageUpdate);
  return roomMessageObj;
};

export const rwRoomMessageMutation = {
  rwRoomMessageCreate,
};
