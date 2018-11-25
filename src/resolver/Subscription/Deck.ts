import { IFieldResolver } from 'graphql-tools';

import { IWrContext, IUpdate } from '../../types';

import { IDeck } from '../Deck';

export interface IDeckPayload {
  deckUpdates: IUpdate<IDeck>;
}

export function deckTopicFromUser(id: string) {
  return `deck:owner:${id}`;
}

const deckUpdates: IFieldResolver<any, IWrContext, any> = (
  _parent, _args, { sub, pubsub },
): AsyncIterator<IDeckPayload> | null => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IDeckPayload>(
    deckTopicFromUser(sub.id),
  );
};

export const deckSubscription = {
  deckUpdates: {
    subscribe: deckUpdates,
  },
};
