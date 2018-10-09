import { prisma, RoomNode } from '../generated/prisma-client';
import { ICurrentUser, ResolvesTo } from '../types';
import { IUser, IBakedUser, userNodeToIUser } from './User';
import { IRoomMessage, IBakedRoomMessage, simpleUserRoomMessageNodeToIRoomMessage } from './RoomMessage';
import { fieldGetter } from '../util';

export interface IRoom {
  id: ResolvesTo<string>;
  owner: ResolvesTo<IUser>;
  occupants: ResolvesTo<IUser[]>;
  messages: ResolvesTo<IRoomMessage[]>;
}

export const Room = {
  id: fieldGetter('id'),
  owner: fieldGetter('owner'),
  occupants: fieldGetter('occupants'),
  messages: fieldGetter('messages'),
};

export interface IBakedRoom extends IRoom {
  id: string;
  owner: ResolvesTo<IBakedUser>;
  occupants: ResolvesTo<IBakedUser[]>;
  messages: ResolvesTo<IBakedRoomMessage[]>;
}

export function roomNodeToIRoom(roomNode: RoomNode): IBakedRoom {
  return {
    id: roomNode.id,
    owner: async () => userNodeToIUser(
      await prisma.room({ id: roomNode.id }).owner()),
    occupants: async () => (await prisma.room({ id: roomNode.id }).occupants()).map(userNodeToIUser),
    messages: async () => (
      await prisma.room({ id: roomNode.id }).messages()).map(simpleUserRoomMessageNodeToIRoomMessage),
  };
}

async function room(parent: any, { id }: any) {
  const roomNode = await prisma.room({ id });
  if (roomNode) {
    return roomNodeToIRoom(roomNode);
  }
}

async function roomCreate(parent: any, args: any, ctx: any) {
  if (!ctx || !ctx.sub || !ctx.sub.id) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  const roomNode = await prisma.createRoom({ active: true, owner: { connect: { id: sub.id } } });
  if (roomNode) {
    return roomNodeToIRoom(roomNode);
  }
}

// TODO: access control: owner or self only
async function roomAddOccupant(parent: any, { id, occupantId }: any) {
  if (!await prisma.$exists.room({ id })) {
    return null;
  } else if (!await prisma.$exists.user({ id: occupantId })) {
    return null;
  } else {
    const occupantNodes = await prisma.room({ id }).occupants();
    if (!occupantNodes.map((user) => user.id).includes(occupantId)) {
      const roomNode = await prisma.updateRoom({
        data: { occupants: {
          connect: { id: occupantId },
        } },
        where: { id },
      });
      if (roomNode) {
        return roomNodeToIRoom(roomNode);
      }
    } else {
      const roomNode = await prisma.room({ id });
      return roomNodeToIRoom(roomNode);
    }
  }
  return null;
}

export const roomQuery = {
  room,
};

export const roomMutation = {
  roomCreate, roomAddOccupant,
};
