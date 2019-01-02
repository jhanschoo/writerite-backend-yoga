import { IFieldResolver } from 'graphql-tools';

import { MutationType, IRwContext } from '../../types';

import { IBakedRwRoomMessage, pSimpleUserRoomMessageToRwRoomMessage } from '../RwRoomMessage';
import { IBakedRwRoomMessagePayload, rwRoomMessageTopicFromRwRoom } from '../Subscription/RwRoomMessage';

const rwRoomMessageCreate: IFieldResolver<any, IRwContext, {
  roomId: string, messageContent: string,
}> = async (
  _parent, { roomId, messageContent }, { sub, prisma, pubsub },
): Promise<IBakedRwRoomMessage | null> => {
  if (!sub) {
    return null;
  }
  const pRoom = await prisma.pRoom({ id: roomId });
  if (!pRoom) {
    return null;
  }
  if (await prisma.pRoom({id: roomId}).owner().id() !== sub.id) {
    // workaround for OR not working properly in prisma client
    // c.f. https://github.com/prisma/prisma/issues/3763
    if (!(await prisma.pRoom({ id: roomId }).occupants())
      .map((user) => user.id).includes(sub.id)) {
      return null;
    }
  }
  const pRoomMessage = await prisma.createPSimpleUserRoomMessage({
    content: messageContent,
    room: { connect: { id: roomId } },
    sender: { connect: { id: sub.id } },
  });
  if (!pRoomMessage) {
    return null;
  }
  const roomMessageObj = pSimpleUserRoomMessageToRwRoomMessage(pRoomMessage, prisma);
  const roomMessageUpdate: IBakedRwRoomMessagePayload = {
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
