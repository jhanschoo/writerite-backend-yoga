import { IFieldResolver } from 'graphql-tools';

import {
  IUpdate, IRwContext, ICreatedUpdate, IUpdatedUpdate, IDeletedUpdate,
} from '../../types';

import { PRoom } from '../../../generated/prisma-client';

export interface IPRoomCreatedPayload {
  rwRoomUpdates: ICreatedUpdate<PRoom>;
}
export interface IPRoomUpdatedPayload {
  rwRoomUpdates: IUpdatedUpdate<PRoom>;
}
export interface IPRoomDeletedPayload {
  rwRoomUpdates: IDeletedUpdate<PRoom>;
}
export interface IPRoomPayload {
  rwRoomUpdates: IUpdate<PRoom>;
}

export function rwRoomTopicFromRwUser(id: string) {
  return `room:user:${id}`;
}

const rwRoomUpdatesSubscribe: IFieldResolver<any, IRwContext, {}> = async (
  _parent, _args, { pubsub, sub },
): Promise<AsyncIterator<IPRoomPayload> | null> => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IPRoomPayload>(rwRoomTopicFromRwUser(sub.id));
};

export const rwRoomSubscription = {
  rwRoomUpdates: {
    subscribe: rwRoomUpdatesSubscribe,
  },
};
