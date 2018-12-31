import { Room as PRoom, Prisma } from '../../generated/prisma-client';
import { ResTo, AFunResTo } from '../types';
import { IRwUser, IBakedRwUser, pUserToRwUser } from './RwUser';
import {
  IRwRoomMessage,
  IBakedRwRoomMessage,
  pSimpleUserRoomMessageToRwRoomMessage,
} from './RwRoomMessage';
import { fieldGetter } from '../util';

export interface IRwRoom {
  id: ResTo<string>;
  owner: ResTo<IRwUser>;
  occupants: ResTo<IRwUser[]>;
  messages: ResTo<IRwRoomMessage[]>;
}

// tslint:disable-next-line: variable-name
export const RwRoom = {
  id: fieldGetter('id'),
  owner: fieldGetter('owner'),
  occupants: fieldGetter('occupants'),
  messages: fieldGetter('messages'),
};

export interface IBakedRwRoom extends IRwRoom {
  id: string;
  name: string;
  active: boolean;
  owner: AFunResTo<IBakedRwUser>;
  occupants: AFunResTo<IBakedRwUser[]>;
  messages: AFunResTo<IBakedRwRoomMessage[]>;
}

export function pRoomToRwRoom(pRoom: PRoom, prisma: Prisma): IBakedRwRoom {
  return {
    id: pRoom.id,
    name: pRoom.name,
    active: pRoom.active,
    owner: async () => pUserToRwUser(
      await prisma.room({ id: pRoom.id }).owner(),
      prisma,
    ),
    occupants: async () => (
      await prisma.room({ id: pRoom.id }).occupants()
    ).map((pUser) => pUserToRwUser(pUser, prisma)),
    messages: async () => (
      await prisma.room({ id: pRoom.id }).messages()
    ).map((pRoomMessage) => pSimpleUserRoomMessageToRwRoomMessage(pRoomMessage, prisma)),
  };
}
