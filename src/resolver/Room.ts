import { GraphQLFieldResolver } from 'graphql';

const room: GraphQLFieldResolver<any, any> = async (
  parent,
  _,
  { db },
) => {
  return {};
};

const roomCreate: GraphQLFieldResolver<any, any> = async (
  parent,
  { owner },
  { db },
) => {
  return {};
};

const roomAddOccupant: GraphQLFieldResolver<any, any> = async (
  parent,
  // tslint:disable-next-line no-shadowed-variable
  { room, occupant },
  { db },
) => {
  return {};
};

const roomAddMessage: GraphQLFieldResolver<any, any> = async (
  parent,
  // tslint:disable-next-line no-shadowed-variable
  { room, messageContent },
  { db },
) => {
  return {};
};

const newRoomMessage: GraphQLFieldResolver<any, any> = async (
  parent,
  // tslint:disable-next-line no-shadowed-variable
  { room },
  { db },
) => {
  return {};
};

export const roomQuery = {
  room,
};

export const roomMutation = {
  roomCreate, roomAddOccupant, roomAddMessage,
};

export const roomSubscription = {
  newRoomMessage,
};
