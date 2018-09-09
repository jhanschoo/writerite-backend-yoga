import { GraphQLFieldResolver } from "graphql";

export const login: GraphQLFieldResolver<any, any> = async (
  parent: any,
  { email, password }: any,
  { db }: any,
) => {
  return {};
};

export const signup: GraphQLFieldResolver<any, any> = async (
  parent: any,
  args: any,
  { db }: any,
) => {
  return {};
};
