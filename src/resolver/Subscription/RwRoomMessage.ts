import { IFieldResolver } from 'graphql-tools';

import { IUpdate, IRwContext } from '../../types';

import { IRwRoomMessage } from '../RwRoomMessage';

export function rwRoomMessageTopicFromRwRoom(id: string) {
  return `room-message:${id}`;
}

export interface IRwRoomMessagePayload {
  rwRoomMessageUpdatesOfRoom: IUpdate<IRwRoomMessage>;
}

const rwRoomMessageUpdatesOfRoom: IFieldResolver<any, IRwContext, {
  roomId: string,
}> = async (
  _parent, { roomId }, { prisma, pubsub },
): Promise<AsyncIterator<IRwRoomMessagePayload> | null> => {
  if (!await prisma.$exists.pRoom({ id: roomId })) {
    return null;
  }
  return pubsub.asyncIterator<IRwRoomMessagePayload>(rwRoomMessageTopicFromRwRoom(roomId));
};

export const rwRoomMessageSubscription = {
  rwRoomMessageUpdatesOfRoom: {
    subscribe: rwRoomMessageUpdatesOfRoom,
  },
};
