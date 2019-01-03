import { IFieldResolver } from 'graphql-tools';

import { IRwContext, IUpdate } from '../../types';

import { IBakedRwCard } from '../RwCard';

export interface IBakedRwCardPayload {
  rwCardUpdatesOfDeck: IUpdate<IBakedRwCard>;
}

export function rwCardTopicFromRwDeck(id: string) {
  return `card:deck:${id}`;
}

const rwCardUpdatesOfDeck: IFieldResolver<any, IRwContext, {
  deckId: string,
}> = async (
  _parent, { deckId }, { prisma, pubsub },
): Promise<AsyncIterator<IBakedRwCardPayload> | null> => {
  if (!await prisma.$exists.pRoom({ id: deckId })) {
    return null;
  }
  return pubsub.asyncIterator<IBakedRwCardPayload>(
    rwCardTopicFromRwDeck(deckId),
  );
};

export const rwCardSubscription = {
  rwCardUpdatesOfDeck: {
    subscribe: rwCardUpdatesOfDeck,
  },
};
