import { rwCardQuery } from './RwCard';
import { rwDeckQuery } from './RwDeck';
import { rwRoomQuery } from './RwRoom';
import { rwUserQuery } from './RwUser';

// tslint:disable-next-line: variable-name
const Query = {
  ...rwCardQuery,
  ...rwDeckQuery,
  ...rwRoomQuery,
  ...rwUserQuery,
};

export default Query;
