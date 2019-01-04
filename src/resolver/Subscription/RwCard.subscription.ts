import { IFieldResolver } from 'graphql-tools';

import {
  IRwContext, IUpdate, ICreatedUpdate, IUpdatedUpdate, IDeletedUpdate,
} from '../../types';

import { IBakedRwCard, pCardToRwCard } from '../RwCard';
import { PSimpleCard } from '../../../generated/prisma-client';
import { subscriptionResolver } from '../../util';

export interface IPSimpleCardCreatedPayload {
  rwCardUpdatesOfDeck: ICreatedUpdate<PSimpleCard>;
}
export interface IPSimpleCardUpdatedPayload {
  rwCardUpdatesOfDeck: IUpdatedUpdate<PSimpleCard>;
}
export interface IPSimpleCardDeletedPayload {
  rwCardUpdatesOfDeck: IDeletedUpdate<PSimpleCard>;
}
export interface IPSimpleCardPayload {
  rwCardUpdatesOfDeck: IUpdate<PSimpleCard>;
}

export function rwCardTopicFromRwDeck(id: string) {
  return `card:deck:${id}`;
}

const rwCardUpdatesOfDeckSubscribe: IFieldResolver<any, IRwContext, {
  deckId: string,
}> = async (
  _parent, { deckId }, { prisma, pubsub },
): Promise<AsyncIterator<IPSimpleCardPayload> | null> => {
  if (!await prisma.$exists.pDeck({ id: deckId })) {
    return null;
  }
  return pubsub.asyncIterator<IPSimpleCardPayload>(
    rwCardTopicFromRwDeck(deckId),
  );
};

export const rwCardSubscription = {
  rwCardUpdatesOfDeck: {
    resolve: subscriptionResolver(pCardToRwCard),
    subscribe: rwCardUpdatesOfDeckSubscribe,
  },
};
