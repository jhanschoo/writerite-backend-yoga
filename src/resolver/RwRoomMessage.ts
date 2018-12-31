import { IRwUser, IBakedRwUser, pUserToRwUser } from './RwUser';
import { ResTo, AFunResTo } from '../types';
import { SimpleUserRoomMessage as PSimpleUserRoomMessage, Prisma } from '../../generated/prisma-client';
import { fieldGetter } from '../util';

export interface IRwRoomMessage {
  id: ResTo<string>;
  content: ResTo<string>;
  sender: ResTo<IRwUser>;
}

// tslint:disable-next-line: variable-name
export const RwRoomMessage: IRwRoomMessage = {
  id: fieldGetter('id'),
  content: fieldGetter('content'),
  sender: fieldGetter('sender'),
};

export interface IBakedRwRoomMessage extends IRwRoomMessage {
  id: string;
  content: string;
  sender: AFunResTo<IBakedRwUser>;
}

export function pSimpleUserRoomMessageToRwRoomMessage(
  simpleUserRoomMessageNode: PSimpleUserRoomMessage,
  prisma: Prisma,
): IBakedRwRoomMessage {
  return {
    id: simpleUserRoomMessageNode.id,
    content: simpleUserRoomMessageNode.content,
    sender: async () => {
      return pUserToRwUser(
        await prisma.simpleUserRoomMessage({
          id: simpleUserRoomMessageNode.id,
        }).sender(),
        prisma,
      );
    },
  };
}
