import { IFieldResolver } from 'graphql-tools';

import { ICard, pCardToICard } from '../Card';

import { IWrContext } from '../../types';

// Query resolvers

const card: IFieldResolver<any, IWrContext, { id: string }> = async (
  _parent,
  { id },
  { prisma },
): Promise<ICard | null> => {
  const pSimpleCard = await prisma.simpleCard({ id });
  if (!pSimpleCard) {
    return null;
  }
  return pCardToICard(pSimpleCard, prisma);
};

const cardsFromDeck: IFieldResolver<any, IWrContext, { id: string }> = async (
  _parent,
  { id },
  { prisma },
): Promise<ICard[] | null> => {
  if (!await prisma.$exists.deck({ id })) {
    return null;
  }
  const pCards = await prisma.deck({ id }).cards();
  if (!pCards) {
    return null;
  }
  return (pCards).map((pCard) => pCardToICard(pCard, prisma));
};

export const cardQuery = {
  card, cardsFromDeck,
};
