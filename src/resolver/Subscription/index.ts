// tslint:disable-next-line:no-submodule-imports
import { rwDeckSubscription } from './RwDeck';
import { rwCardSubscription } from './RwCard';
import { rwRoomSubscription } from './RwRoom';
import { rwRoomMessageSubscription } from './RwRoomMessage';

// tslint:disable-next-line: variable-name
const Subscription = {
  ...rwDeckSubscription,
  ...rwCardSubscription,
  ...rwRoomSubscription,
  ...rwRoomMessageSubscription,
};

export default Subscription;
