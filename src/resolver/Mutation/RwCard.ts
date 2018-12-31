import { IFieldResolver } from 'graphql-tools';

import { IWrContext } from '../../types';

import { IRwCard, pCardToRwCard } from '../RwCard';

// Mutation resolvers

const rwCardSave: IFieldResolver<any, IWrContext, {
  id?: string, front: string, back: string, deckId: string,
}> = async (
  _parent,
  { id, front, back, deckId },
  { prisma, sub },
): Promise<IRwCard | null> => {
  if (!sub) {
    return null;
  }
  if (id) {
    if (await prisma.$exists.simpleCard({ id, deck: { id: (deckId as string), owner: { id: sub.id } } })) {
      const pCard = await prisma.updateSimpleCard({ data: { front, back }, where: { id } });
      if (pCard) {
        return pCardToRwCard(pCard, prisma);
      }
    }
    return null;
  } else if (await prisma.$exists.deck({ id: deckId, owner: { id: sub.id } })) {
    const pDeck = await prisma.deck({ id: deckId });
    const pCard = await prisma.createSimpleCard({
      front, back, deck: { connect: { id: pDeck.id } },
    });
    if (!pCard) {
      return null;
    }
    return pCardToRwCard(pCard, prisma);
  }
  return null;
};

const rwCardDelete: IFieldResolver<any, IWrContext, { id: string }> = async (
  _parent, { id }, { prisma, sub },
): Promise<IRwCard | null> => {
  if (!sub) {
    return null;
  }
  if (!await prisma.$exists.simpleCard({ id, deck: { owner: { id: sub.id } } })) {
    return null;
  }
  const pCard = await prisma.deleteSimpleCard({ id });
  if (!pCard) {
    return null;
  }
  return pCardToRwCard(pCard, prisma);
};

export const rwCardMutation = {
  rwCardSave, rwCardDelete,
};
