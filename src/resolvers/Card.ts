import { GraphQLFieldResolver } from 'graphql';

const card: GraphQLFieldResolver<any, any> = async (
  parent,
  _,
  { db },
) => {
  return {};
};

const cardsFromDeck: GraphQLFieldResolver<any, any> = async (
  parent,
  { id },
  { db },
) => {
  return {};
};

const cardSave: GraphQLFieldResolver<any, any> = async (
  parent,
  { id, front, back, deck },
  { db },
) => {
  return {};
};

const cardDelete: GraphQLFieldResolver<any, any> = async (
  parent,
  { id },
  { db },
) => {
  return {};
};

export const cardQuery = {
  card, cardsFromDeck,
};

export const cardMutation = {
  cardSave, cardDelete,
};
