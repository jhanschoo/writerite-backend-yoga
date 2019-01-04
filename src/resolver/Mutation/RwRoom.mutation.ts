import { IFieldResolver } from 'graphql-tools';
import randomWords from 'random-words';

import { IRwContext, MutationType } from '../../types';

import { IBakedRwRoom, pRoomToRwRoom } from '../RwRoom';
import {
  rwRoomTopicFromRwUser,
  IPRoomCreatedPayload,
} from '../Subscription/RwRoom.subscription';

const rwRoomCreate: IFieldResolver<any, IRwContext, {
  name?: string, deckId: string,
}> = async (_parent, { name, deckId }, { prisma, pubsub, sub, redisClient }): Promise<IBakedRwRoom | null> => {
  if (!sub) {
    return null;
  }
  const pRoom = await prisma.createPRoom({
    active: true,
    name: (name && name.trim()) || (randomWords({
      exactly: 1, wordsPerString: 3, separator: '-',
    })[0] as string),
    owner: { connect: { id: sub.id } },
    deck: { connect: { id: deckId } },
  });
  if (!pRoom) {
    return null;
  }
  const pRoomUpdate: IPRoomCreatedPayload = {
    rwRoomUpdates: {
      mutation: MutationType.CREATED,
      new: pRoom,
      oldId: null,
    },
  };
  pubsub.publish(rwRoomTopicFromRwUser(sub.id), pRoomUpdate);
  redisClient.publish('writerite:room:activating', pRoom.id);
  return pRoomToRwRoom(pRoom, prisma);
};

// TODO: access control: owner or self only
const rwRoomAddOccupant: IFieldResolver<any, IRwContext, {
  id: string, occupantId: string,
}> = async (
  _parent: any, { id, occupantId }, { prisma },
): Promise<IBakedRwRoom | null> => {
  if (!await prisma.$exists.pRoom({ id })) {
    return null;
  }
  if (!await prisma.$exists.pUser({ id: occupantId })) {
    return null;
  }
  const pRoom = await prisma.pRoom({ id });
  const rwRoom = pRoomToRwRoom(pRoom, prisma);
  const roomOwner = await rwRoom.owner(null);
  const pOccupants = await rwRoom.occupants(null);
  const occupantIds = pOccupants.map((user) => user.id);
  if (occupantId === roomOwner.id || occupantIds.includes(occupantId)) {
    return rwRoom;
  }
  const pUpdatedRoom = await prisma.updatePRoom({
    data: {
      occupants: { connect: { id: occupantId } },
    },
    where: { id },
  });
  if (!pUpdatedRoom) {
    return null;
  }
  return pRoomToRwRoom(pUpdatedRoom, prisma);
};

export const rwRoomMutation = {
  rwRoomCreate, rwRoomAddOccupant,
};
