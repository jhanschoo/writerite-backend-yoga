// tslint:disable-next-line:no-submodule-imports
import { cardQuery } from './Card';
import { deckQuery } from './Deck';
import { roomQuery } from './Room';
import { userQuery } from './User';

const Query = {
  ...cardQuery,
  ...deckQuery,
  ...roomQuery,
  ...userQuery,
};

export default Query;
