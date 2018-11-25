import { IFieldResolver } from 'graphql-tools';

import { IWrContext, IUpdate } from '../../types';

import { IDeck } from '../Deck';

export interface IDeckUserPayload {
  deckUpdatesOfUser: IUpdate<IDeck>;
}

export function deckTopicFromUser(id: string) {
  return `user-deck:${id}`;
}

const deckUpdatesOfUser: IFieldResolver<any, IWrContext, any> = (
  _parent, _args, { sub, pubsub },
): AsyncIterator<IDeckUserPayload> | null => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IDeckUserPayload>(
    deckTopicFromUser(sub.id),
  );
};

export const deckSubscription = {
  deckUpdatesOfUser: {
    subscribe: deckUpdatesOfUser,
  },
};
