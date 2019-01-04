import { IFieldResolver } from 'graphql-tools';

import { IRwContext } from '../../types';

import { IBakedRwDeck, pDeckToRwDeck } from '../RwDeck';

const rwDeck: IFieldResolver<any, IRwContext, { id: string }> = async (
  _parent,
  { id },
  { prisma },
): Promise<IBakedRwDeck | null> => {
  const pDeck = await prisma.pDeck({ id });
  if (!pDeck) {
    return null;
  }
  return pDeckToRwDeck(pDeck, prisma);
};

const rwDecks: IFieldResolver<any, IRwContext, {}> = async (
  _parent: any,
  _args: any,
  { prisma, sub }: IRwContext,
): Promise<IBakedRwDeck[] | null> => {
  if (!sub) {
    return null;
  }
  const pDecks = await prisma.pDecks({
    where: { owner: { id: sub.id } },
  });
  if (!pDecks) {
    return null;
  }
  return pDecks.map((pDeck) => pDeckToRwDeck(pDeck, prisma));
};

export const rwDeckQuery = {
  rwDeck, rwDecks,
};
