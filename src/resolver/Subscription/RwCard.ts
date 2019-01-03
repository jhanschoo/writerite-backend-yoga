import { IFieldResolver } from 'graphql-tools';

import {
  IRwContext, IUpdate, ICreatedUpdate, IUpdatedUpdate, IDeletedUpdate,
} from '../../types';

import { IBakedRwCard } from '../RwCard';

export interface IBakedRwCardCreatedPayload {
  rwCardUpdatesOfDeck: ICreatedUpdate<IBakedRwCard>;
}
export interface IBakedRwCardUpdatedPayload {
  rwCardUpdatesOfDeck: IUpdatedUpdate<IBakedRwCard>;
}
export interface IBakedRwCardDeletedPayload {
  rwCardUpdatesOfDeck: IDeletedUpdate<IBakedRwCard>;
}
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
  if (!await prisma.$exists.pDeck({ id: deckId })) {
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
