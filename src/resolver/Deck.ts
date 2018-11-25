import { Deck as PDeck, Prisma } from '../../generated/prisma-client';
import { ResTo, AFunResTo } from '../types';
import { fieldGetter } from '../util';

import { IUser, IBakedUser, pUserToIUser } from './User';
import { ICard, IBakedCard, pCardToICard } from './Card';

export interface IDeck {
  id: ResTo<string>;
  name: ResTo<string>;
  owner: ResTo<IUser>;
  cards: ResTo<ICard[]>;
}

// tslint:disable-next-line: variable-name
export const Deck: ResTo<IDeck> = {
  id: fieldGetter('id'),
  name: fieldGetter('name'),
  owner: fieldGetter('owner'),
  cards: fieldGetter('cards'),
};

export interface IBakedDeck extends IDeck {
  id: string;
  name: string;
  owner: AFunResTo<IBakedUser>;
  cards: AFunResTo<IBakedCard[]>;
}

export function pDeckToIDeck(pDeck: PDeck, prisma: Prisma): IBakedDeck {
  return {
    id: pDeck.id,
    name: pDeck.name,
    owner: async () => pUserToIUser(
      await prisma.deck({ id: pDeck.id }).owner(),
      prisma,
    ),
    cards: async () => (
      await prisma.deck({ id: pDeck.id }).cards()
    ).map((pCard) => pCardToICard(pCard, prisma)),
  };
}
