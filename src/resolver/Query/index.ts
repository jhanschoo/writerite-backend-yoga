import { rwCardQuery } from './RwCard';
import { rwDeckQuery } from './RwDeck';
import { rwRoomQuery } from './RwRoom';
import { rwUserQuery } from './RwUser';
import { rwRoomMessageQuery } from './RwRoomMessage';

// tslint:disable-next-line: variable-name
const Query = {
  ...rwCardQuery,
  ...rwDeckQuery,
  ...rwRoomQuery,
  ...rwRoomMessageQuery,
  ...rwUserQuery,
};

export default Query;
