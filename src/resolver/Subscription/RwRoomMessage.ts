import { IFieldResolver } from 'graphql-tools';

import { IUpdate, IRwContext } from '../../types';

import { IBakedRwRoomMessage } from '../RwRoomMessage';

export function rwRoomMessageTopicFromRwRoom(id: string) {
  return `room-message:${id}`;
}

export interface IBakedRwRoomMessagePayload {
  rwRoomMessageUpdatesOfRoom: IUpdate<IBakedRwRoomMessage>;
}

const rwRoomMessageUpdatesOfRoom: IFieldResolver<any, IRwContext, {
  roomId: string,
}> = async (
  _parent, { roomId }, { prisma, pubsub },
): Promise<AsyncIterator<IBakedRwRoomMessagePayload> | null> => {
  if (!await prisma.$exists.pRoom({ id: roomId })) {
    return null;
  }
  return pubsub.asyncIterator<IBakedRwRoomMessagePayload>(rwRoomMessageTopicFromRwRoom(roomId));
};

export const rwRoomMessageSubscription = {
  rwRoomMessageUpdatesOfRoom: {
    subscribe: rwRoomMessageUpdatesOfRoom,
  },
};
