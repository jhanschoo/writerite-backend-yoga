import { Room as PRoom, Prisma } from '../../generated/prisma-client';
import { ResTo, AFunResTo } from '../types';
import { IUser, IBakedUser, pUserToIUser } from './User';
import {
  IRoomMessage,
  IBakedRoomMessage,
  pSimpleUserRoomMessageToIRoomMessage,
} from './RoomMessage';
import { fieldGetter } from '../util';

export interface IRoom {
  id: ResTo<string>;
  owner: ResTo<IUser>;
  occupants: ResTo<IUser[]>;
  messages: ResTo<IRoomMessage[]>;
}

// tslint:disable-next-line: variable-name
export const Room = {
  id: fieldGetter('id'),
  owner: fieldGetter('owner'),
  occupants: fieldGetter('occupants'),
  messages: fieldGetter('messages'),
};

export interface IBakedRoom extends IRoom {
  id: string;
  name: string;
  active: boolean;
  owner: AFunResTo<IBakedUser>;
  occupants: AFunResTo<IBakedUser[]>;
  messages: AFunResTo<IBakedRoomMessage[]>;
}

export function pRoomToIRoom(pRoom: PRoom, prisma: Prisma): IBakedRoom {
  return {
    id: pRoom.id,
    name: pRoom.name,
    active: pRoom.active,
    owner: async () => pUserToIUser(
      await prisma.room({ id: pRoom.id }).owner(),
      prisma,
    ),
    occupants: async () => (
      await prisma.room({ id: pRoom.id }).occupants()
    ).map((pUser) => pUserToIUser(pUser, prisma)),
    messages: async () => (
      await prisma.room({ id: pRoom.id }).messages()
    ).map((pRoomMessage) => pSimpleUserRoomMessageToIRoomMessage(pRoomMessage, prisma)),
  };
}
