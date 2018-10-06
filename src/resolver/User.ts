import { GraphQLFieldResolver } from 'graphql';
import { prisma } from '../generated/prisma-client';

import { ICurrentUser, Roles } from '../interface/ICurrentUser';

async function users(parent: any, args: any, ctx: any) {
  if (!(ctx && ctx.sub && ctx.sub.id)) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  if (sub.roles.includes(Roles.admin)) {
    return await prisma.users();
  }
}

async function user(parent: any, { id }: any) {
  return await prisma.user({ id });
}

export const userQuery = {
  user, users,
};
