import { IResolvers } from 'graphql-tools';

import Query from './Query';
import Mutation from './Mutation';
import Subscription from './Subscription';
import { RwCard } from './RwCard';
import { RwDeck } from './RwDeck';
import { RwRoom } from './RwRoom';
import { RwRoomMessage } from './RwRoomMessage';
import { RwUser } from './RwUser';

const resolvers: IResolvers = {
  Query,
  Mutation,
  Subscription,
  Card: RwCard,
  Deck: RwDeck,
  Room: RwRoom,
  RoomMessage: RwRoomMessage,
  User: RwUser,
} as IResolvers;

export default resolvers;
