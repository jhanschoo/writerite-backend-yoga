import { prisma, Room as prismaRoom } from '../generated/prisma-client';
import { ICurrentUser, ResolvesTo, IUpdate, IWrContext } from '../types';
import { IUser, IBakedUser, userNodeToIUser } from './User';
import {
  IRoomMessage,
  IBakedRoomMessage,
  simpleUserRoomMessageNodeToIRoomMessage,
} from './RoomMessage';
import { fieldGetter } from '../util';
import { PubSub } from 'graphql-yoga';
import { IFieldResolver } from 'graphql-tools';

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

interface IRoomPayload {
  [field: string]: IUpdate<IRoom>;
}

export function roomNodeToIRoom(roomNode: prismaRoom): IBakedRoom {
  return {
    id: roomNode.id,
    owner: async () => userNodeToIUser(
      await prisma.room({ id: roomNode.id }).owner()),
    occupants: async () => (
      await prisma.room({ id: roomNode.id }).occupants()
    ).map(userNodeToIUser),
    messages: async () => (
      await prisma.room({ id: roomNode.id }).messages()
    ).map(simpleUserRoomMessageNodeToIRoomMessage),
  };
}

function activeRoomTopic() {
  return 'active-room';
}

const room: IFieldResolver<any, any, { id: string }> = async (
  parent, { id },
): Promise<IBakedRoom | null> => {
  const roomNode = await prisma.room({ id });
  if (roomNode) {
    return roomNodeToIRoom(roomNode);
  }
  return null;
};

const activeRooms: IFieldResolver<any, IWrContext, any> = async (
  parent, args, { sub },
): Promise<IRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const roomNodes = await prisma.rooms({ where: { active: true } });
  if (roomNodes) {
    return roomNodes.map(roomNodeToIRoom);
  }
  return null;
};

const roomCreate: IFieldResolver<any, IWrContext, any> = async (
  parent, args, { sub },
): Promise<IBakedRoom | null> => {
  if (!sub) {
    return null;
  }
  const roomNode = await prisma.createRoom({
    active: true, owner: { connect: { id: sub.id } }
  });
  if (roomNode) {
    return roomNodeToIRoom(roomNode);
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
    const occupantNodes = await prisma.room({ id }).occupants();
    if (!occupantNodes.map((user) => user.id).includes(occupantId)) {
      const roomNode = await prisma.updateRoom({
        data: {
          occupants: { connect: { id: occupantId } },
        },
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
};

const activeRoomUpdates: IFieldResolver<any, IWrContext, any> = async (
  parent, args, { pubsub },
): Promise<AsyncIterator<IRoomPayload> | null> => {
  return pubsub.asyncIterator<IRoomPayload>(activeRoomTopic());
};

export const roomQuery = {
  room, activeRooms,
};

export const roomMutation = {
  roomCreate, roomAddOccupant,
};

export const roomSubscription = {
  activeRoomUpdates: {
    subscribe: activeRoomUpdates,
  },
};
