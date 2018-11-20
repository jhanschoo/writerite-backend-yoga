import { PubSub } from 'graphql-yoga';
import { IFieldResolver } from 'graphql-tools';
import { printIntrospectionSchema } from 'graphql';
import randomWords from 'random-words';

import { prisma, Room as prismaRoom } from '../generated/prisma-client';
import { ICurrentUser, ResolvesTo, IUpdate, IWrContext } from '../types';
import { IUser, IBakedUser, userNodeToIUser } from './User';
import {
  IRoomMessage,
  IBakedRoomMessage,
  simpleUserRoomMessageNodeToIRoomMessage,
} from './RoomMessage';
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
  name: string;
  active: boolean;
  owner: ResolvesTo<IBakedUser>;
  occupants: ResolvesTo<IBakedUser[]>;
  messages: ResolvesTo<IBakedRoomMessage[]>;
}

interface IRoomPayload {
  [field: string]: IUpdate<IRoom>;
}

export function pRoomToIRoom(pRoom: prismaRoom): IBakedRoom {
  return {
    id: pRoom.id,
    name: pRoom.name,
    active: pRoom.active,
    owner: async () => userNodeToIUser(
      await prisma.room({ id: pRoom.id }).owner()),
    occupants: async () => (
      await prisma.room({ id: pRoom.id }).occupants()
    ).map(userNodeToIUser),
    messages: async () => (
      await prisma.room({ id: pRoom.id }).messages()
    ).map(simpleUserRoomMessageNodeToIRoomMessage),
  };
}

function activeRoomTopic() {
  return 'active-room';
}

const room: IFieldResolver<any, any, { id: string }> = async (
  parent, { id },
): Promise<IBakedRoom | null> => {
  const pRoom = await prisma.room({ id });
  if (pRoom) {
    return pRoomToIRoom(pRoom);
  }
  return null;
};

const activeRooms: IFieldResolver<any, IWrContext, any> = async (
  parent, args, { sub },
): Promise<IRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const pRooms = await prisma.rooms({ where: { active: true } });
  if (pRooms) {
    return pRooms.map(pRoomToIRoom);
  }
  return null;
};

const roomsWithCurrentUser: IFieldResolver<any, IWrContext, any> =  async (
  parent, args, { sub }
): Promise<IRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const pRooms = await prisma.rooms({ where: { occupants_some: { id: sub.id } } });
  if (pRooms) {
    return pRooms.map(pRoomToIRoom);
  }
  return null;
}

const roomCreate: IFieldResolver<any, IWrContext, {
  name?: string,
}> = async (parent, { name }, { sub }): Promise<IBakedRoom | null> => {
  if (!sub) {
    return null;
  }
  const pRoom = await prisma.createRoom({
    active: true,
    name: (name && name.trim()) || (randomWords({
      exactly: 1, wordsPerString: 3, separator: '-',
    })[0] as string),
    owner: { connect: { id: sub.id } },
    occupants: { connect: { id: sub.id } },
  });
  if (pRoom) {
    return pRoomToIRoom(pRoom);
  }
  return null;
};

// TODO: access control: owner or self only
const roomAddOccupant: IFieldResolver<any, any, {
  id: string, occupantId: string
}> = async (
  parent: any, { id, occupantId }
): Promise<IBakedRoom | null> => {
  if (!await prisma.$exists.room({ id })) {
    return null;
  } else if (!await prisma.$exists.user({ id: occupantId })) {
    return null;
  } else {
    const pOccupants = await prisma.room({ id }).occupants();
    if (!pOccupants.map((user) => user.id).includes(occupantId)) {
      const pRoom = await prisma.updateRoom({
        data: {
          occupants: { connect: { id: occupantId } },
        },
        where: { id },
      });
      if (pRoom) {
        return pRoomToIRoom(pRoom);
      }
    } else {
      const pRoom = await prisma.room({ id });
      return pRoomToIRoom(pRoom);
    }
  }
  return null;
};

const activeRoomUpdates: IFieldResolver<any, IWrContext, any> = async (
  parent, args, { pubsub },
): Promise<AsyncIterator<IRoomPayload> | null> => {
  return pubsub.asyncIterator<IRoomPayload>(activeRoomTopic());
};

export const roomQuery = {
  room, activeRooms, roomsWithCurrentUser
};

export const roomMutation = {
  roomCreate, roomAddOccupant,
};

export const roomSubscription = {
  activeRoomUpdates: {
    subscribe: activeRoomUpdates,
  },
};
