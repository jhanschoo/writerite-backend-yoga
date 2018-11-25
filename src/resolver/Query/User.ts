import { IFieldResolver } from 'graphql-tools';

import { Roles, IWrContext } from '../../types';

import { IUser, pUserToIUser } from '../User';

const users: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { prisma, sub },
): Promise<IUser[] | null> => {
  if (!sub) {
    return null;
  }
  if (sub.roles.includes(Roles.admin)) {
    const pUsers = await prisma.users();
    if (!pUsers) {
      return null;
    }
    return pUsers.map((pUser) => pUserToIUser(pUser, prisma));
  }
  return null;
};

const user: IFieldResolver<any, any, { id: string }> = async (
  _parent, { id }, { prisma },
): Promise<IUser | null> => {
  const pUser = await prisma.user({ id });
  if (!pUser) {
    return null;
  }
  return pUserToIUser(pUser, prisma);
};

export const userQuery = {
  user, users,
};
