// tslint:disable-next-line:no-submodule-imports
import { deckSubscription } from './Deck';
import { roomSubscription } from './Room';
import { roomMessageSubscription } from './RoomMessage';

// tslint:disable-next-line: variable-name
const Subscription = {
  ...deckSubscription,
  ...roomSubscription,
  ...roomMessageSubscription,
};

export default Subscription;
