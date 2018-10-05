// tslint:disable-next-line:no-submodule-imports
import { IResolverObject } from 'graphql-yoga/dist/types';
import { authorizationMutation } from './Authorization';
import { cardMutation } from './Card';
import { deckMutation } from './Deck';
import { roomMutation } from './Room';

const Mutation: IResolverObject = {
  ...authorizationMutation,
  //...cardMutation,
  //...deckMutation,
  //...roomMutation,
};

export default Mutation;
