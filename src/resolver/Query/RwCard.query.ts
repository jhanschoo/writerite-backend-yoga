import { IFieldResolver } from 'graphql-tools';

import { pCardToRwCard, IBakedRwCard } from '../RwCard';

import { IRwContext } from '../../types';

// Query resolvers

const rwCard: IFieldResolver<any, IRwContext, { id: string }> = async (
  _parent,
  { id },
  { prisma },
): Promise<IBakedRwCard | null> => {
  const pSimpleCard = await prisma.pSimpleCard({ id });
  if (!pSimpleCard) {
    return null;
  }
  return pCardToRwCard(pSimpleCard, prisma);
};

const rwCardsOfDeck: IFieldResolver<any, IRwContext, { deckId: string }> = async (
  _parent,
  { deckId },
  { prisma },
): Promise<IBakedRwCard[] | null> => {
  if (!await prisma.$exists.pDeck({ id: deckId })) {
    return null;
  }
  const pCards = await prisma.pSimpleCards({ where: { deck: { id: deckId } } });
  if (!pCards) {
    return null;
  }
  return (pCards).map((pCard) => pCardToRwCard(pCard, prisma));
};

export const rwCardQuery = {
  rwCard, rwCardsOfDeck,
};
