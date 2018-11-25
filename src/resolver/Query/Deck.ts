import { IFieldResolver } from 'graphql-tools';

import { IWrContext } from '../../types';

import { IDeck, IBakedDeck, pDeckToIDeck } from '../Deck';

const userDecks: IFieldResolver<any, IWrContext, any> = async (
  _parent: any,
  _args: any,
  { prisma, sub }: IWrContext,
): Promise<IDeck[] | null> => {
  if (!sub) {
    return null;
  }
  const pDecks = await prisma.decks({
    where: { owner: { id: sub.id } },
  });
  if (!pDecks) {
    return null;
  }
  return pDecks.map((pDeck) => pDeckToIDeck(pDeck, prisma));
};

const deck: IFieldResolver<any, IWrContext, { id: string }> = async (
  _parent,
  { id },
  { prisma },
): Promise<IBakedDeck | null> => {
  const pDeck = await prisma.deck({ id });
  if (!pDeck) {
    return null;
  }
  return pDeckToIDeck(pDeck, prisma);
};

export const deckQuery = {
  deck, userDecks,
};
