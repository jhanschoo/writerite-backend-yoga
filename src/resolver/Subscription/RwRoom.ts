import { IFieldResolver } from 'graphql-tools';

import { IUpdate, IRwContext, MutationType } from '../../types';

import { IRwRoom } from '../RwRoom';

interface IActiveRwRoomUpdatesPayload {
  activeRwRoomUpdates: IUpdate<IRwRoom, MutationType>;
}

interface IRwRoomUpdatesPayload {
  rwRoomUpdates: IUpdate<IRwRoom, MutationType>;
}

export type IRwRoomPayload =
  | IActiveRwRoomUpdatesPayload
  | IRwRoomUpdatesPayload;

export function activeRwRoomTopic() {
  return 'room:active';
}

export function rwRoomTopicFromRwUser(id: string) {
  return `room:user:${id}`;
}

const rwRoomUpdates: IFieldResolver<any, IRwContext, any> = async (
  _parent, _args, { pubsub, sub },
): Promise<AsyncIterator<IRwRoomPayload> | null> => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IRwRoomPayload>(rwRoomTopicFromRwUser(sub.id));
};

const activeRwRoomUpdates: IFieldResolver<any, IRwContext, any> = async (
  _parent, _args, { pubsub },
): Promise<AsyncIterator<IRwRoomPayload> | null> => {
  return pubsub.asyncIterator<IRwRoomPayload>(activeRwRoomTopic());
};

export const roomSubscription = {
  activeRwRoomUpdates: {
    subscribe: activeRwRoomUpdates,
  },
  rwRoomUpdates: {
    subscribe: rwRoomUpdates,
  },
};
