// tslint:disable-next-line:no-submodule-imports
import { IResolverObject } from 'graphql-yoga/dist/types';
import { authorizationMutation } from './Authorization';
import { cardMutation } from './Card';
import { deckMutation } from './Deck';
import { roomMutation } from './Room';
import { roomMessageMutation } from './RoomMessage';

const Mutation: IResolverObject = {
  ...authorizationMutation,
  ...cardMutation,
  ...deckMutation,
  ...roomMutation,
  ...roomMessageMutation,
} as IResolverObject;

export default Mutation;
