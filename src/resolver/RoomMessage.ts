import { IUser, IBakedUser, userNodeToIUser } from './User';
import { IUpdate, MutationType, ResolvesTo, IWrContext } from '../types';
import { prisma, SimpleUserRoomMessage as prismaSimpleUserRoomMessageNode } from '../generated/prisma-client';
import { fieldGetter } from '../util';
import { IFieldResolver } from 'graphql-tools';

function roomMessageTopicFromRoom(id: string) {
  return `room-message:${id}`;
}

export interface IRoomMessage {
  id: ResolvesTo<string>;
  content: ResolvesTo<string>;
  sender: ResolvesTo<IUser>;
}

export const RoomMessage: IRoomMessage = {
  id: fieldGetter('id'),
  content: fieldGetter('content'),
  sender: fieldGetter('sender'),
};

export interface IBakedRoomMessage extends IRoomMessage {
  id: string;
  content: string;
  sender: ResolvesTo<IBakedUser>;
}

interface IRoomMessagePayload {
  [field: string]: IUpdate<IRoomMessage>;
}

export function simpleUserRoomMessageNodeToIRoomMessage(
  simpleUserRoomMessageNode: prismaSimpleUserRoomMessageNode,
): IBakedRoomMessage {
  return {
    id: simpleUserRoomMessageNode.id,
    content: simpleUserRoomMessageNode.content,
    sender: async () => {
      return userNodeToIUser(
        await prisma.simpleUserRoomMessage({
          id: simpleUserRoomMessageNode.id
        }).sender());
    },
  };
}

const roomMessageCreate: IFieldResolver<any, IWrContext, {
  roomId: string, messageContent: string
}> = async (
  parent, { roomId, messageContent }, { sub, pubsub }
): Promise<IBakedRoomMessage | null> => {
    if (!sub) {
      return null;
    }
    if (!(await prisma.$exists.room({ id: roomId }))
      || (!(await prisma.room({ id: roomId }).occupants())
        .map((user) => user.id).includes(sub.id))) {
      return null;
    }
    const roomMessageNode = await prisma.createSimpleUserRoomMessage({
      content: messageContent,
      room: { connect: { id: roomId } },
      sender: { connect: { id: sub.id } },
    });
    if (roomMessageNode) {
      const roomMessageObj = simpleUserRoomMessageNodeToIRoomMessage(roomMessageNode);
      const roomMessageUpdate: IRoomMessagePayload = {
        roomMessageUpdatesOfRoom: {
          mutation: MutationType.CREATED,
          new: roomMessageObj,
          old: null,
        },
      };
      pubsub.publish(roomMessageTopicFromRoom(roomId), roomMessageUpdate);
      return roomMessageObj;
    }
    return null;
  }

const roomMessageUpdatesOfRoom: IFieldResolver<any, IWrContext, {
  id: string
}> = async (
  parent, { id }, { pubsub }
): Promise<AsyncIterator<IRoomMessagePayload> | null> => {
    if (!(await prisma.$exists.room({ id }))) {
      return null;
    }
    return pubsub.asyncIterator<IRoomMessagePayload>(roomMessageTopicFromRoom(id));
  }

export const roomMessageMutation = {
  roomMessageCreate,
};

export const roomMessageSubscription = {
  roomMessageUpdatesOfRoom: {
    subscribe: roomMessageUpdatesOfRoom,
  },
};
