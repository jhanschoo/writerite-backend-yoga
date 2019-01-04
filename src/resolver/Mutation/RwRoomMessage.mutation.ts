import { IFieldResolver } from 'graphql-tools';

import { MutationType, IRwContext, Roles } from '../../types';

import { IBakedRwRoomMessage, pRoomMessageToRwRoomMessage } from '../RwRoomMessage';
import {
  rwRoomMessageTopicFromRwRoom,
  IBakedRwRoomMessageCreatedPayload,
} from '../Subscription/RwRoomMessage.subscription';

const rwRoomMessageCreate: IFieldResolver<any, IRwContext, {
  roomId: string, content: string,
}> = async (
  _parent, { roomId, content }, { sub, prisma, pubsub, redisClient },
): Promise<IBakedRwRoomMessage | null> => {
  if (!sub) {
    return null;
  }
  const pRoom = await prisma.pRoom({ id: roomId });
  if (!pRoom) {
    return null;
  }
  const isAcolyte = sub.roles.includes(Roles.acolyte);
  if (!isAcolyte && await prisma.pRoom({id: roomId}).owner().id() !== sub.id) {
    // workaround for OR not working properly in prisma client
    // c.f. https://github.com/prisma/prisma/issues/3763
    if (!(await prisma.pRoom({ id: roomId }).occupants())
      .map((user) => user.id).includes(sub.id)) {
      return null;
    }
  }
  const pRoomMessage = await prisma.createPRoomMessage({
    content,
    room: { connect: { id: roomId } },
    sender: (isAcolyte) ? undefined : { connect: { id: sub.id } },
  });
  if (!pRoomMessage) {
    return null;
  }
  const rwRoomMessage = pRoomMessageToRwRoomMessage(pRoomMessage, prisma);
  const rwRoomMessageUpdate: IBakedRwRoomMessageCreatedPayload = {
    rwRoomMessageUpdatesOfRoom: {
      mutation: MutationType.CREATED,
      new: rwRoomMessage,
      oldId: null,
    },
  };
  pubsub.publish(rwRoomMessageTopicFromRwRoom(roomId), rwRoomMessageUpdate);
  if (!isAcolyte) {
    redisClient.publish(`writerite:room::${roomId}`, `${sub.id}:${content}`);
  }
  return rwRoomMessage;
};

export const rwRoomMessageMutation = {
  rwRoomMessageCreate,
};
