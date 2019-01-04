import { PRoom, Prisma } from '../../generated/prisma-client';
import { ResTo, AFunResTo } from '../types';
import { IRwUser, IBakedRwUser, pUserToRwUser } from './RwUser';
import {
  IRwRoomMessage, IBakedRwRoomMessage, pRoomMessageToRwRoomMessage,
} from './RwRoomMessage';
import { fieldGetter } from '../util';
import { IRwDeck, IBakedRwDeck, pDeckToRwDeck } from './RwDeck';

export interface IRwRoom {
  id: ResTo<string>;
  owner: ResTo<IRwUser>;
  occupants: ResTo<IRwUser[]>;
  deck: ResTo<IRwDeck>;
  messages: ResTo<IRwRoomMessage[]>;
}

// tslint:disable-next-line: variable-name
export const RwRoom = {
  id: fieldGetter('id'),
  owner: fieldGetter('owner'),
  occupants: fieldGetter('occupants'),
  deck: fieldGetter('deck'),
  messages: fieldGetter('messages'),
};

export interface IBakedRwRoom extends IRwRoom {
  id: string;
  name: string;
  active: boolean;
  owner: AFunResTo<IBakedRwUser>;
  occupants: AFunResTo<IBakedRwUser[]>;
  deck: AFunResTo<IBakedRwDeck>;
  messages: AFunResTo<IBakedRwRoomMessage[]>;
}

export function pRoomToRwRoom(pRoom: PRoom, prisma: Prisma): IBakedRwRoom {
  return {
    id: pRoom.id,
    name: pRoom.name,
    active: pRoom.active,
    owner: async () => pUserToRwUser(
      await prisma.pRoom({ id: pRoom.id }).owner(),
      prisma,
    ),
    occupants: async () => (
      await prisma.pRoom({ id: pRoom.id }).occupants()
    ).map((pUser) => pUserToRwUser(pUser, prisma)),
    deck: async () => pDeckToRwDeck(
      await prisma.pRoom({ id: pRoom.id }).deck(),
      prisma,
    ),
    messages: async () => (
      await prisma.pRoom({ id: pRoom.id }).messages()
    ).map((pRoomMessage) => pRoomMessageToRwRoomMessage(pRoomMessage, prisma)),
  };
}
