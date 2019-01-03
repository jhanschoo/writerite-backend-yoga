import { IFieldResolver } from 'graphql-tools';

import { IRwContext, MutationType } from '../../types';

import { pCardToRwCard, IBakedRwCard } from '../RwCard';
import {
  rwCardTopicFromRwDeck,
  IBakedRwCardUpdatedPayload,
  IBakedRwCardCreatedPayload,
  IBakedRwCardDeletedPayload,
} from '../Subscription/RwCard';

// Mutation resolvers

const rwCardSave: IFieldResolver<any, IRwContext, {
  id?: string, front: string, back: string, deckId: string,
}> = async (
  _parent,
  { id, front, back, deckId },
  { prisma, sub, pubsub },
): Promise<IBakedRwCard | null> => {
  if (!sub) {
    return null;
  }
  if (id) {
    if (await prisma.$exists.pSimpleCard({ id, deck: { id: deckId, owner: { id: sub.id } } })) {
      const pCard = await prisma.updatePSimpleCard({ data: { front, back }, where: { id } });
      if (pCard) {
        const rwCard = pCardToRwCard(pCard, prisma);
        const rwCardUpdate: IBakedRwCardUpdatedPayload = {
          rwCardUpdatesOfDeck: {
            mutation: MutationType.UPDATED,
            new: rwCard,
            oldId: null,
          },
        };
        pubsub.publish(rwCardTopicFromRwDeck(deckId), rwCardUpdate);
        return pCardToRwCard(pCard, prisma);
      }
    }
    return null;
  } else if (await prisma.$exists.pDeck({ id: deckId, owner: { id: sub.id } })) {
    const pDeck = await prisma.pDeck({ id: deckId });
    const pCard = await prisma.createPSimpleCard({
      front, back, deck: { connect: { id: pDeck.id } },
    });
    if (!pCard) {
      return null;
    }
    const rwCard = pCardToRwCard(pCard, prisma);
    const rwCardUpdate: IBakedRwCardCreatedPayload = {
      rwCardUpdatesOfDeck: {
        mutation: MutationType.CREATED,
        new: rwCard,
        oldId: null,
      },
    };
    pubsub.publish(rwCardTopicFromRwDeck(deckId), rwCardUpdate);
    return rwCard;
  }
  return null;
};

const rwCardDelete: IFieldResolver<any, IRwContext, { id: string }> = async (
  _parent, { id }, { prisma, sub, pubsub },
): Promise<string | null> => {
  if (!sub) {
    return null;
  }
  const pDecks = await prisma.pDecks({
    where: { cards_some: { id }, owner: { id: sub.id } },
  });
  if (pDecks.length !== 1) {
    return null;
  }
  const pCard = await prisma.deletePSimpleCard({ id });
  if (!pCard) {
    return null;
  }
  const rwCardUpdate: IBakedRwCardDeletedPayload = {
    rwCardUpdatesOfDeck: {
      mutation: MutationType.DELETED,
      new: null,
      oldId: pCard.id,
    },
  };
  pubsub.publish(rwCardTopicFromRwDeck(pDecks[0].id), rwCardUpdate);
  return pCard.id;
};

export const rwCardMutation = {
  rwCardSave, rwCardDelete,
};
