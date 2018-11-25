import { IUser, IBakedUser, pUserToIUser } from './User';
import { ResTo, AFunResTo } from '../types';
import { SimpleUserRoomMessage as PSimpleUserRoomMessage, Prisma } from '../../generated/prisma-client';
import { fieldGetter } from '../util';

export interface IRoomMessage {
  id: ResTo<string>;
  content: ResTo<string>;
  sender: ResTo<IUser>;
}

// tslint:disable-next-line: variable-name
export const RoomMessage: IRoomMessage = {
  id: fieldGetter('id'),
  content: fieldGetter('content'),
  sender: fieldGetter('sender'),
};

export interface IBakedRoomMessage extends IRoomMessage {
  id: string;
  content: string;
  sender: AFunResTo<IBakedUser>;
}

export function pSimpleUserRoomMessageToIRoomMessage(
  simpleUserRoomMessageNode: PSimpleUserRoomMessage,
  prisma: Prisma,
): IBakedRoomMessage {
  return {
    id: simpleUserRoomMessageNode.id,
    content: simpleUserRoomMessageNode.content,
    sender: async () => {
      return pUserToIUser(
        await prisma.simpleUserRoomMessage({
          id: simpleUserRoomMessageNode.id,
        }).sender(),
        prisma,
      );
    },
  };
}
