import { IFieldResolver } from 'graphql-tools';

import { MutationType, IRwContext, Roles, ICreatedUpdate } from '../../types';

import { IBakedRwRoomMessage, pRoomMessageToRwRoomMessage } from '../RwRoomMessage';
import {
  rwRoomMessageTopicFromRwRoom,
} from '../Subscription/RwRoomMessage.subscription';
import { PRoomMessage } from '../../../generated/prisma-client';
import { throwIfDevel, wrAuthenticationError, wrNotFoundError, wrGuardPrismaNullError } from '../../util';

const rwRoomMessageCreate: IFieldResolver<any, IRwContext, {
  roomId: string, content: string,
}> = async (
  _parent, { roomId, content }, { sub, prisma, pubsub, redisClient },
): Promise<IBakedRwRoomMessage | null> => {
  try {
    if (!sub) {
      throw wrAuthenticationError();
    }
    const isAcolyte = sub.roles.includes(Roles.acolyte);
    if (!isAcolyte && await prisma.pRoom({ id: roomId }).owner().id() !== sub.id) {
      // workaround for OR not working properly in prisma client
      // c.f. https://github.com/prisma/prisma/issues/3763
      if (!(await prisma.pRoom({ id: roomId }).occupants() || [])
        .map((user) => user.id).includes(sub.id)) {
        throw wrNotFoundError('room');
      }
    }
    const pRoomMessage = await prisma.createPRoomMessage({
      content,
      room: { connect: { id: roomId } },
      sender: (isAcolyte) ? undefined : { connect: { id: sub.id } },
    });
    wrGuardPrismaNullError(pRoomMessage);
    const pRoomMessageUpdate: ICreatedUpdate<PRoomMessage> = {
      mutation: MutationType.CREATED,
      new: pRoomMessage,
      oldId: null,
    };
    pubsub.publish(rwRoomMessageTopicFromRwRoom(roomId), pRoomMessageUpdate);
    if (!isAcolyte) {
      redisClient.publish(`writerite:room::${roomId}`, `${sub.id}:${content}`);
    }
    return pRoomMessageToRwRoomMessage(pRoomMessage, prisma);
  } catch (e) {
    return throwIfDevel(e);
  }
};

export const rwRoomMessageMutation = {
  rwRoomMessageCreate,
};
