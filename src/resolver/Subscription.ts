// tslint:disable-next-line:no-submodule-imports
import { IResolverOptions } from 'graphql-yoga/dist/types';
import { roomMessageSubscription } from './RoomMessage';
import { deckSubscription } from './Deck';

const Subscription: IResolverOptions = {
  ...deckSubscription,
  ...roomMessageSubscription,
} as IResolverOptions;

export default Subscription;
