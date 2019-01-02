import { IFieldResolver } from 'graphql-tools';

import { IRwContext } from '../../types';

import { pCardToRwCard, IBakedRwCard } from '../RwCard';

// Mutation resolvers

const rwCardSave: IFieldResolver<any, IRwContext, {
  id?: string, front: string, back: string, deckId: string,
}> = async (
  _parent,
  { id, front, back, deckId },
  { prisma, sub },
): Promise<IBakedRwCard | null> => {
  if (!sub) {
    return null;
  }
  if (id) {
    if (await prisma.$exists.pSimpleCard({ id, deck: { id: (deckId as string), owner: { id: sub.id } } })) {
      const pCard = await prisma.updatePSimpleCard({ data: { front, back }, where: { id } });
      if (pCard) {
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
    return pCardToRwCard(pCard, prisma);
  }
  return null;
};

const rwCardDelete: IFieldResolver<any, IRwContext, { id: string }> = async (
  _parent, { id }, { prisma, sub },
): Promise<IBakedRwCard | null> => {
  if (!sub) {
    return null;
  }
  if (!await prisma.$exists.pSimpleCard({ id, deck: { owner: { id: sub.id } } })) {
    return null;
  }
  const pCard = await prisma.deletePSimpleCard({ id });
  if (!pCard) {
    return null;
  }
  return pCardToRwCard(pCard, prisma);
};

export const rwCardMutation = {
  rwCardSave, rwCardDelete,
};
