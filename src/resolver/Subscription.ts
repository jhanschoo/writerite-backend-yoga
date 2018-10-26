// tslint:disable-next-line:no-submodule-imports
import { IResolverOptions } from 'graphql-yoga/dist/types';
import { deckSubscription } from './Deck';
import { roomSubscription } from './Room';
import { roomMessageSubscription } from './RoomMessage';

const Subscription: IResolverOptions = {
  ...deckSubscription,
  ...roomSubscription,
  ...roomMessageSubscription,
} as IResolverOptions;

export default Subscription;
