import { IFieldResolver } from 'graphql-tools';

import { IRwContext, IUpdate } from '../../types';

import { IBakedRwDeck } from '../RwDeck';

export interface IBakedRwDeckPayload {
  rwDeckUpdates: IUpdate<IBakedRwDeck>;
}

export function rwDeckTopicFromRwUser(id: string) {
  return `deck:owner:${id}`;
}

const rwDeckUpdates: IFieldResolver<any, IRwContext, {}> = (
  _parent, _args, { sub, pubsub },
): AsyncIterator<IBakedRwDeckPayload> | null => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IBakedRwDeckPayload>(
    rwDeckTopicFromRwUser(sub.id),
  );
};

export const rwDeckSubscription = {
  rwDeckUpdates: {
    subscribe: rwDeckUpdates,
  },
};
