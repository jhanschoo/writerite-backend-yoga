
import { PubSub } from 'graphql-yoga';
import { IUser, IBakedUser, userNodeToIUser } from './User';
import { ICurrentUser, IUpdate, MutationType, ResolvesTo } from '../types';
import { prisma, SimpleUserRoomMessageNode } from '../generated/prisma-client';
import { fieldGetter } from '../util';

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

interface IRoomMessageRoomPayload {
  roomMessageUpdatesOfRoom: IUpdate<IRoomMessage>;
}

export function simpleUserRoomMessageNodeToIRoomMessage(
  simpleUserRoomMessageNode: SimpleUserRoomMessageNode,
): IBakedRoomMessage {
  return {
    id: simpleUserRoomMessageNode.id,
    content: simpleUserRoomMessageNode.content,
    sender: async () => {
      return userNodeToIUser(
      await prisma.simpleUserRoomMessage({ id: simpleUserRoomMessageNode.id }).sender());
    },
  };
}

async function roomMessageCreate(
  parent: any,
  { roomId, messageContent }: { roomId: string , messageContent: string },
  ctx: any) {
  if (!(ctx && ctx.sub && ctx.sub.id)) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  const pubsub: PubSub = ctx.pubsub;
  if (!(await prisma.$exists.room({ id: roomId }))
  || (!(await prisma.room({ id: roomId }).occupants())
  .map((user) => user.id).includes(sub.id))) {
    return null;
  }
  const roomMessageNode = await prisma.createSimpleUserRoomMessage({
    content: messageContent,
    room: { connect: { id: roomId } },
    sender: { connect: { id: sub.id }},
  });
  if (roomMessageNode) {
    const roomMessageObj = simpleUserRoomMessageNodeToIRoomMessage(roomMessageNode);
    const roomMessageUpdate: IRoomMessageRoomPayload = {
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

async function roomMessageUpdatesOfRoom(
  parent: any,
  { id }: { id: string },
  ctx: any): Promise<AsyncIterator<IRoomMessageRoomPayload>|null> {
  const pubsub: PubSub = ctx.pubsub;
  if (!(await prisma.$exists.room({ id }))) {
    return null;
  }
  return pubsub.asyncIterator<IRoomMessageRoomPayload>(roomMessageTopicFromRoom(id));
}

export const roomMessageMutation = {
  roomMessageCreate,
};

export const roomMessageSubscription = {
  roomMessageUpdatesOfRoom: {
    subscribe: roomMessageUpdatesOfRoom,
  },
};
