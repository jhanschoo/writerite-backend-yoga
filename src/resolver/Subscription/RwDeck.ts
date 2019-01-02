import { IFieldResolver } from 'graphql-tools';

import { IRwContext, IUpdate } from '../../types';

import { IRwDeck } from '../RwDeck';

export interface IRwDeckPayload {
  rwDeckUpdates: IUpdate<IRwDeck>;
}

export function rwDeckTopicFromRwUser(id: string) {
  return `deck:owner:${id}`;
}

const rwDeckUpdates: IFieldResolver<any, IRwContext, any> = (
  _parent, _args, { sub, pubsub },
): AsyncIterator<IRwDeckPayload> | null => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IRwDeckPayload>(
    rwDeckTopicFromRwUser(sub.id),
  );
};

export const rwDeckSubscription = {
  rwDeckUpdates: {
    subscribe: rwDeckUpdates,
  },
};
