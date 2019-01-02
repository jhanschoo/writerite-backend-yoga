import { authorizationMutation } from './authorization';
import { rwCardMutation } from './RwCard';
import { rwDeckMutation } from './RwDeck';
import { rwRoomMutation } from './RwRoom';
import { rwRoomMessageMutation } from './RwRoomMessage';

// tslint:disable-next-line: variable-name
const Mutation = {
  ...authorizationMutation,
  ...rwCardMutation,
  ...rwDeckMutation,
  ...rwRoomMutation,
  ...rwRoomMessageMutation,
};

export default Mutation;
