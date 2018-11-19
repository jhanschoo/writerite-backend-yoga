import { IFieldResolver } from 'graphql-tools';

import { prisma, User as prismaUser } from '../generated/prisma-client';
import { ICurrentUser, Roles, ResolvesTo, IWrContext } from '../types';
import { IDeck, IBakedDeck, deckNodeToIDeck } from './Deck';
import { fieldGetter } from '../util';

export interface IUser {
  id: ResolvesTo<string>;
  email: ResolvesTo<string>;
  roles: ResolvesTo<string[]>;
  decks: ResolvesTo<IDeck[]>;
}

export interface IBakedUser extends IUser {
  id: string;
  email: string;
  roles: string[];
  decks: ResolvesTo<IBakedDeck[]>;
}

export const User: ResolvesTo<IUser> = {
  id: fieldGetter('id'),
  email: fieldGetter('email'),
  roles: fieldGetter('roles'),
  decks: fieldGetter('decks'),
};

export function userNodeToIUser(userNode: prismaUser): IBakedUser {
  return {
    id: userNode.id,
    email: userNode.email,
    roles: userNode.defaultRoles,
    decks: async () => (
      await prisma.user({ id: userNode.id }).decks()
    ).map(deckNodeToIDeck),
  };
}

const users: IFieldResolver<any, IWrContext, any> = async (
  parent: any, args: any, { sub }: IWrContext
): Promise<IUser[] | null> => {
  if (!sub) {
    return null;
  }
  if (sub.roles.includes(Roles.admin)) {
    const userNodes = await prisma.users();
    if (userNodes) {
      return userNodes.map(userNodeToIUser);
    }
  }
  return null;
}

const user: IFieldResolver<any, any, { id: string }> = async (
  parent, { id }
): Promise<IUser | null> => {
  const userNode = await prisma.user({ id });
  if (userNode) {
    return userNodeToIUser(userNode);
  }
  return null;
}

export const userQuery = {
  user, users,
};
