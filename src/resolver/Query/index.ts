import { cardQuery } from './Card';
import { deckQuery } from './Deck';
import { roomQuery } from './Room';
import { userQuery } from './User';

// tslint:disable-next-line: variable-name
const Query = {
  ...cardQuery,
  ...deckQuery,
  ...roomQuery,
  ...userQuery,
};

export default Query;
