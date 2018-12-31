import { IFieldResolver } from 'graphql-tools';

import { IWrContext } from '../../types';

import { IRwDeck, IBakedRwDeck, pDeckToRwDeck } from '../RwDeck';

const rwDecks: IFieldResolver<any, IWrContext, any> = async (
  _parent: any,
  _args: any,
  { prisma, sub }: IWrContext,
): Promise<IRwDeck[] | null> => {
  if (!sub) {
    return null;
  }
  const pDecks = await prisma.decks({
    where: { owner: { id: sub.id } },
  });
  if (!pDecks) {
    return null;
  }
  return pDecks.map((pDeck) => pDeckToRwDeck(pDeck, prisma));
};

const rwDeck: IFieldResolver<any, IWrContext, { id: string }> = async (
  _parent,
  { id },
  { prisma },
): Promise<IBakedRwDeck | null> => {
  const pDeck = await prisma.deck({ id });
  if (!pDeck) {
    return null;
  }
  return pDeckToRwDeck(pDeck, prisma);
};

export const rwDeckQuery = {
  rwDeck, rwDecks,
};
