import { Prisma, User as PUser } from '../../generated/prisma-client';
import { ResTo, AFunResTo } from '../types';
import { fieldGetter } from '../util';

import { IDeck, IBakedDeck, pDeckToIDeck } from './Deck';

export interface IUser {
  id: ResTo<string>;
  email: ResTo<string>;
  roles: ResTo<string[]>;
  decks: ResTo<IDeck[]>;
}

export interface IBakedUser extends IUser {
  id: string;
  email: string;
  roles: string[];
  decks: AFunResTo<IBakedDeck[]>;
}

// tslint:disable-next-line: variable-name
export const User: ResTo<IUser> = {
  id: fieldGetter('id'),
  email: fieldGetter('email'),
  roles: fieldGetter('roles'),
  decks: fieldGetter('decks'),
};

export function pUserToIUser(pUser: PUser, prisma: Prisma): IBakedUser {
  return {
    id: pUser.id,
    email: pUser.email,
    roles: pUser.defaultRoles,
    decks: async () => (
      await prisma.user({ id: pUser.id }).decks()
    ).map((pDeck) => pDeckToIDeck(pDeck, prisma)),
  };
}
