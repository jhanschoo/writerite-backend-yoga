import { IFieldResolver } from 'graphql-tools';

import { IRwContext, IUpdate } from '../../types';

import { pDeckToRwDeck } from '../RwDeck';
import { PDeck } from '../../../generated/prisma-client';
import { updateMapFactory } from '../../util';

export function rwDeckTopicFromRwUser(id: string) {
  return `deck:owner:${id}`;
}

const rwDeckUpdatesSubscribe: IFieldResolver<any, IRwContext, {}> = (
  _parent, _args, { sub, pubsub },
): AsyncIterator<IUpdate<PDeck>> | null => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IUpdate<PDeck>>(
    rwDeckTopicFromRwUser(sub.id),
  );
};

export const rwDeckSubscription = {
  rwDeckUpdates: {
    resolve: updateMapFactory(pDeckToRwDeck),
    subscribe: rwDeckUpdatesSubscribe,
  },
};
