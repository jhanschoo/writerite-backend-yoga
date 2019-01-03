import { IFieldResolver } from 'graphql-tools';

import {
  IUpdate, IRwContext, ICreatedUpdate, IUpdatedUpdate, IDeletedUpdate,
} from '../../types';

import { IBakedRwRoomMessage } from '../RwRoomMessage';

export function rwRoomMessageTopicFromRwRoom(id: string) {
  return `room-message:${id}`;
}

export interface IBakedRwRoomMessageCreatedPayload {
  rwRoomMessageUpdatesOfRoom: ICreatedUpdate<IBakedRwRoomMessage>;
}

export interface IBakedRwRoomMessageUpdatedPayload {
  rwRoomMessageUpdatesOfRoom: IUpdatedUpdate<IBakedRwRoomMessage>;
}

export interface IBakedRwRoomMessageDeletedPayload {
  rwRoomMessageUpdatesOfRoom: IDeletedUpdate<IBakedRwRoomMessage>;
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
