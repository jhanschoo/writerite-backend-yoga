import { authorizationMutation } from './Authorization';
import { cardMutation } from './Card';
import { deckMutation } from './Deck';
import { roomMutation } from './Room';
import { roomMessageMutation } from './RoomMessage';

// tslint:disable-next-line: variable-name
const Mutation = {
  ...authorizationMutation,
  ...cardMutation,
  ...deckMutation,
  ...roomMutation,
  ...roomMessageMutation,
};

export default Mutation;
