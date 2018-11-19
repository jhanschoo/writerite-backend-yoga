import { authorizationMutation } from './Authorization';
import { cardMutation } from './Card';
import { deckMutation } from './Deck';
import { roomMutation } from './Room';
import { roomMessageMutation } from './RoomMessage';

const Mutation = {
  ...authorizationMutation,
  ...cardMutation,
  ...deckMutation,
  ...roomMutation,
  ...roomMessageMutation,
};

export default Mutation;
