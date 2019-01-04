import { IFieldResolver } from 'graphql-tools';

import {
  IRwContext, IUpdate, ICreatedUpdate, IUpdatedUpdate, IDeletedUpdate,
} from '../../types';

import { IBakedRwDeck, pDeckToRwDeck } from '../RwDeck';
import { PDeck } from '../../../generated/prisma-client';
import { subscriptionResolver } from '../../util';

export interface IPDeckCreatedPayload {
  rwDeckUpdates: ICreatedUpdate<PDeck>;
}
export interface IPDeckUpdatedPayload {
  rwDeckUpdates: IUpdatedUpdate<PDeck>;
}
export interface IPDeckDeletedPayload {
  rwDeckUpdates: IDeletedUpdate<PDeck>;
}
export interface IPDeckPayload {
  rwDeckUpdates: IUpdate<PDeck>;
}

export function rwDeckTopicFromRwUser(id: string) {
  return `deck:owner:${id}`;
}

const rwDeckUpdatesSubscribe: IFieldResolver<any, IRwContext, {}> = (
  _parent, _args, { sub, pubsub },
): AsyncIterator<IPDeckPayload> | null => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IPDeckPayload>(
    rwDeckTopicFromRwUser(sub.id),
  );
};

export const rwDeckSubscription = {
  rwDeckUpdates: {
    resolve: subscriptionResolver(pDeckToRwDeck),
    subscribe: rwDeckUpdatesSubscribe,
  },
};
