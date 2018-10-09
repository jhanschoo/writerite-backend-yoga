import Query from './Query';
import Mutation from './Mutation';
import Subscription from './Subscription';
import { Card } from './Card';
import { Deck } from './Deck';
import { Room } from './Room';
import { RoomMessage } from './RoomMessage';
import { User } from './User';

const resolvers: any = {
  Query,
  Mutation,
  Subscription,
  Card,
  Deck,
  Room,
  RoomMessage,
  User,
};

export default resolvers;
