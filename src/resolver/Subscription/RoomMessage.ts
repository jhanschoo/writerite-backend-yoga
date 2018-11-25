import { IFieldResolver } from 'graphql-tools';

import { IUpdate, IWrContext } from '../../types';

import { IRoomMessage } from '../RoomMessage';

export function roomMessageTopicFromRoom(id: string) {
  return `room-message:${id}`;
}

export interface IRoomMessagePayload {
  roomMessageUpdatesOfRoom: IUpdate<IRoomMessage>;
}

const roomMessageUpdatesOfRoom: IFieldResolver<any, IWrContext, {
  id: string,
}> = async (
  _parent, { id }, { prisma, pubsub },
): Promise<AsyncIterator<IRoomMessagePayload> | null> => {
  if (!await prisma.$exists.room({ id })) {
    return null;
  }
  return pubsub.asyncIterator<IRoomMessagePayload>(roomMessageTopicFromRoom(id));
};

export const roomMessageSubscription = {
  roomMessageUpdatesOfRoom: {
    subscribe: roomMessageUpdatesOfRoom,
  },
};
