import { GraphQLFieldResolver } from 'graphql';

const users: GraphQLFieldResolver<any, any> = async (
  parent,
  _,
  { db },
) => {
  return {};
};

const user: GraphQLFieldResolver<any, any> = async (
  parent,
  { id },
  { db },
) => {
  return {};
};

export const userQuery = {
  user, users,
};
