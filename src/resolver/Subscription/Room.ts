import { IFieldResolver } from 'graphql-tools';

import { IUpdate, IWrContext, MutationType } from '../../types';

import { IRoom } from '../Room';

interface IActiveRoomUpdatesPayload {
  activeRoomUpdates: IUpdate<IRoom, MutationType>;
}

interface IRoomUpdatesPayload {
  roomUpdates: IUpdate<IRoom, MutationType>;
}

export type IRoomPayload =
  | IActiveRoomUpdatesPayload
  | IRoomUpdatesPayload;

export function activeRoomTopic() {
  return 'room:active';
}

export function roomTopicFromUser(id: string) {
  return `room:user:${id}`;
}

const roomUpdates: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { pubsub, sub },
): Promise<AsyncIterator<IRoomPayload> | null> => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IRoomPayload>(roomTopicFromUser(sub.id));
};

const activeRoomUpdates: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { pubsub },
): Promise<AsyncIterator<IRoomPayload> | null> => {
  return pubsub.asyncIterator<IRoomPayload>(activeRoomTopic());
};

export const roomSubscription = {
  activeRoomUpdates: {
    subscribe: activeRoomUpdates,
  },
  roomUpdates: {
    subscribe: roomUpdates,
  },
};
