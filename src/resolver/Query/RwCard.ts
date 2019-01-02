import { IFieldResolver } from 'graphql-tools';

import { IRwCard, pCardToRwCard } from '../RwCard';

import { IRwContext } from '../../types';

// Query resolvers

const rwCard: IFieldResolver<any, IRwContext, { id: string }> = async (
  _parent,
  { id },
  { prisma },
): Promise<IRwCard | null> => {
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
): Promise<IRwCard[] | null> => {
  if (!await prisma.$exists.pDeck({ id: deckId })) {
    return null;
  }
  const pCards = await prisma.pDeck({ id: deckId }).cards();
  if (!pCards) {
    return null;
  }
  return (pCards).map((pCard) => pCardToRwCard(pCard, prisma));
};

export const rwCardQuery = {
  rwCard, rwCardsOfDeck,
};
