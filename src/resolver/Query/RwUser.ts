import { IFieldResolver } from 'graphql-tools';

import { Roles, IWrContext } from '../../types';

import { IRwUser, pUserToRwUser } from '../RwUser';

const rwUsers: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { prisma, sub },
): Promise<IRwUser[] | null> => {
  if (!sub) {
    return null;
  }
  if (sub.roles.includes(Roles.admin)) {
    const pUsers = await prisma.users();
    if (!pUsers) {
      return null;
    }
    return pUsers.map((pUser) => pUserToRwUser(pUser, prisma));
  }
  return null;
};

const rwUser: IFieldResolver<any, any, { id: string }> = async (
  _parent, { id }, { prisma },
): Promise<IRwUser | null> => {
  const pUser = await prisma.user({ id });
  if (!pUser) {
    return null;
  }
  return pUserToRwUser(pUser, prisma);
};

export const rwUserQuery = {
  rwUser, rwUsers,
};
