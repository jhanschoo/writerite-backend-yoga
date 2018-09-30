import { GraphQLFieldResolver } from 'graphql';

const userDecks: GraphQLFieldResolver<any, any> = async (
  parent,
  _,
  { db },
) => {
  return {};
};

const deck: GraphQLFieldResolver<any, any> = async (
  parent,
  { id },
  { db },
) => {
  return {};
};

const deckSave: GraphQLFieldResolver<any, any> = async (
  parent,
  { id, name },
  { db },
) => {
  return {};
};

const deckDelete: GraphQLFieldResolver<any, any> = async (
  parent,
  { id },
  { db },
) => {
  return {};
};

export const deckQuery = {
  deck, userDecks,
};

export const deckMutation = {
  deckSave, deckDelete,
};
