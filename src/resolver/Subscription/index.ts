// tslint:disable-next-line:no-submodule-imports
import { rwDeckSubscription as rwDeckSubscription } from './RwDeck';
import { roomSubscription as rwRoomSubscription } from './RwRoom';
import { rwRoomMessageSubscription as rwRoomMessageSubscription } from './RwRoomMessage';

// tslint:disable-next-line: variable-name
const Subscription = {
  ...rwDeckSubscription,
  ...rwRoomSubscription,
  ...rwRoomMessageSubscription,
};

export default Subscription;
