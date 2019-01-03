import { IFieldResolver } from 'graphql-tools';

import {
  IUpdate, IRwContext, ICreatedUpdate, IUpdatedUpdate, IDeletedUpdate,
} from '../../types';

import { IBakedRwRoom } from '../RwRoom';

export interface IBakedActiveRwRoomCreatedPayload {
  activeRwRoomUpdates: ICreatedUpdate<IBakedRwRoom>;
}
export interface IBakedActiveRwRoomUpdatedPayload {
  activeRwRoomUpdates: IUpdatedUpdate<IBakedRwRoom>;
}
export interface IBakedActiveRwRoomDeletedPayload {
  activeRwRoomUpdates: IDeletedUpdate<IBakedRwRoom>;
}
export interface IBakedActiveRwRoomPayload {
  activeRwRoomUpdates: IUpdate<IBakedRwRoom>;
}

export interface IBakedRwRoomCreatedPayload {
  rwRoomUpdates: ICreatedUpdate<IBakedRwRoom>;
}
export interface IBakedRwRoomUpdatedPayload {
  rwRoomUpdates: IUpdatedUpdate<IBakedRwRoom>;
}
export interface IBakedRwRoomDeletedPayload {
  rwRoomUpdates: IDeletedUpdate<IBakedRwRoom>;
}
export interface IBakedRwRoomPayload {
  rwRoomUpdates: IUpdate<IBakedRwRoom>;
}

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
): Promise<AsyncIterator<IBakedActiveRwRoomPayload> | null> => {
  return pubsub.asyncIterator<IBakedActiveRwRoomPayload>(activeRwRoomTopic());
};

export const rwRoomSubscription = {
  activeRwRoomUpdates: {
    subscribe: activeRwRoomUpdates,
  },
  rwRoomUpdates: {
    subscribe: rwRoomUpdates,
  },
};
