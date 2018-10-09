// tslint:disable-next-line:no-submodule-imports
import { IResolverObject } from 'graphql-yoga/dist/types';
import { cardQuery } from './Card';
import { deckQuery } from './Deck';
import { roomQuery } from './Room';
import { userQuery } from './User';

const Query: IResolverObject = {
  ...cardQuery,
  ...deckQuery,
  ...roomQuery,
  ...userQuery,
} as IResolverObject;

export default Query;
