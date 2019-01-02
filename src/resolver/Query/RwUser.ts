import { IFieldResolver } from 'graphql-tools';

import { Roles, IRwContext } from '../../types';

import { IRwUser, pUserToRwUser } from '../RwUser';

const rwUsers: IFieldResolver<any, IRwContext, {}> = async (
  _parent, _args, { prisma, sub },
): Promise<IRwUser[] | null> => {
  if (!sub) {
    return null;
  }
  if (sub.roles.includes(Roles.admin)) {
    const pUsers = await prisma.pUsers();
    if (!pUsers) {
      return null;
    }
    return pUsers.map((pUser) => pUserToRwUser(pUser, prisma));
  }
  return null;
};

const rwUser: IFieldResolver<any, IRwContext, { id: string }> = async (
  _parent, { id }, { prisma },
): Promise<IRwUser | null> => {
  const pUser = await prisma.pUser({ id });
  if (!pUser) {
    return null;
  }
  return pUserToRwUser(pUser, prisma);
};

export const rwUserQuery = {
  rwUser, rwUsers,
};
