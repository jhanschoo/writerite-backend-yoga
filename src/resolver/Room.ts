import { PubSub } from 'graphql-yoga';
import { prisma } from '../generated/prisma-client';
import { ICurrentUser } from '../interface/ICurrentUser';

function topicFromRoom(id: string) {
  return `room:${id}`;
}

async function room(parent: any, { id }: any) {
  return prisma.room({ id });
}

async function roomCreate(parent: any, args: any, ctx: any) {
  if (!ctx || !ctx.sub || !ctx.sub.id) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  return prisma.createRoom({ active: true, owner: { connect: { id: sub.id } } });
}

// TODO: access control: owner or self only
async function roomAddOccupant(parent: any, { id, occupantId }: any) {
  if (!await prisma.$exists.room({ id })) {
    return null;
  } else if (!await prisma.$exists.user({ id: occupantId })) {
    return null;
  } else {
    const occupants = await prisma.room({ id }).occupants();
    if (!occupants.map((user) => user.id).includes(occupantId)) {
      return await prisma.updateRoom({
        data: { occupants: {
          connect: { id: occupantId },
        } },
        where: { id },
      });
    }
    return await prisma.room({ id });
  }
}

async function roomAddMessage(parent: any, { id, messageContent }: any, ctx: any) {
  if (!(ctx && ctx.sub && ctx.sub.id)) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  const pubsub: PubSub = ctx.pubsub;
  if (!(await prisma.$exists.room({ id }))
  || (!(await prisma.room({ id }).occupants())
  .map((user) => user.id).includes(sub.id))) {
    return null;
  }
  const roomMessageNode = await prisma.createSimpleUserRoomMessage({
    content: messageContent,
    room: { connect: { id } },
    sender: { connect: { id: sub.id }},
  });
  if (roomMessageNode) {
    pubsub.publish(topicFromRoom(id), roomMessageNode);
  }
  return await prisma.room({ id });
}

async function roomNewMessage(parent: any, { id }: any, ctx: any) {
  const pubsub: PubSub = ctx.pubsub;
  if (!(await prisma.$exists.room({ id }))) {
    return null;
  }
  return pubsub.asyncIterator(topicFromRoom(id));
}

export const roomQuery = {
  room,
};

export const roomMutation = {
  roomCreate, roomAddOccupant, roomAddMessage,
};

export const roomSubscription = {
  roomNewMessage,
};
