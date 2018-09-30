import { GraphQLFieldResolver } from "graphql";

const signup: GraphQLFieldResolver<any, any> = async (
  parent,
  { email, token, authorizer, identifier, persist },
  { db },
) => {
  return {};
};

export const authorizationMutation = {
  signup,
};
