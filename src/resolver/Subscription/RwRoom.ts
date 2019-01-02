import { IFieldResolver } from 'graphql-tools';

import { IUpdate, IRwContext, MutationType } from '../../types';

import { IBakedRwRoom } from '../RwRoom';

interface IBakedActiveRwRoomUpdatesPayload {
  activeRwRoomUpdates: IUpdate<IBakedRwRoom, MutationType>;
}

interface IBakedRwRoomUpdatesPayload {
  rwRoomUpdates: IUpdate<IBakedRwRoom, MutationType>;
}

export type IBakedRwRoomPayload =
  | IBakedActiveRwRoomUpdatesPayload
  | IBakedRwRoomUpdatesPayload;

export function activeRwRoomTopic() {
  return 'room:active';
}

export function rwRoomTopicFromRwUser(id: string) {
  return `room:user:${id}`;
}

const rwRoomUpdates: IFieldResolver<any, IRwContext, {}> = async (
  _parent, _args, { pubsub, sub },
): Promise<AsyncIterator<IBakedRwRoomPayload> | null> => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IBakedRwRoomPayload>(rwRoomTopicFromRwUser(sub.id));
};

const activeRwRoomUpdates: IFieldResolver<any, IRwContext, {}> = async (
  _parent, _args, { pubsub },
): Promise<AsyncIterator<IBakedRwRoomPayload> | null> => {
  return pubsub.asyncIterator<IBakedRwRoomPayload>(activeRwRoomTopic());
};

export const roomSubscription = {
  activeRwRoomUpdates: {
    subscribe: activeRwRoomUpdates,
  },
  rwRoomUpdates: {
    subscribe: rwRoomUpdates,
  },
};
