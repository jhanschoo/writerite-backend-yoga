import { IFieldResolver } from 'graphql-tools';

import { IRwCard, pCardToRwCard } from '../RwCard';

import { IWrContext } from '../../types';

// Query resolvers

const rwCard: IFieldResolver<any, IWrContext, { id: string }> = async (
  _parent,
  { id },
  { prisma },
): Promise<IRwCard | null> => {
  const pSimpleCard = await prisma.simpleCard({ id });
  if (!pSimpleCard) {
    return null;
  }
  return pCardToRwCard(pSimpleCard, prisma);
};

const rwCardsOfDeck: IFieldResolver<any, IWrContext, { deckId: string }> = async (
  _parent,
  { deckId },
  { prisma },
): Promise<IRwCard[] | null> => {
  if (!await prisma.$exists.deck({ id: deckId })) {
    return null;
  }
  const pCards = await prisma.deck({ id: deckId }).cards();
  if (!pCards) {
    return null;
  }
  return (pCards).map((pCard) => pCardToRwCard(pCard, prisma));
};

export const rwCardQuery = {
  rwCard, rwCardsOfDeck,
};
