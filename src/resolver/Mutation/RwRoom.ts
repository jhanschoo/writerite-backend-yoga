import { IFieldResolver } from 'graphql-tools';
import randomWords from 'random-words';

import { IRwContext, MutationType } from '../../types';

import { IBakedRwRoom, pRoomToRwRoom } from '../RwRoom';
import { IBakedRwRoomPayload, rwRoomTopicFromRwUser } from '../Subscription/RwRoom';

const rwRoomCreate: IFieldResolver<any, IRwContext, {
  name?: string,
}> = async (_parent, { name }, { prisma, pubsub, sub }): Promise<IBakedRwRoom | null> => {
  if (!sub) {
    return null;
  }
  const pRoom = await prisma.createPRoom({
    active: true,
    name: (name && name.trim()) || (randomWords({
      exactly: 1, wordsPerString: 3, separator: '-',
    })[0] as string),
    owner: { connect: { id: sub.id } },
  });
  if (!pRoom) {
    return null;
  }
  const roomObj = pRoomToRwRoom(pRoom, prisma);
  const roomUpdate: IBakedRwRoomPayload = {
    rwRoomUpdates: {
      mutation: MutationType.CREATED,
      new: roomObj,
      oldId: null,
    },
  };
  pubsub.publish(rwRoomTopicFromRwUser(sub.id), roomUpdate);
  return roomObj;
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
  const roomObj = pRoomToRwRoom(pRoom, prisma);
  const roomOwner = await roomObj.owner(null);
  const pOccupants = await roomObj.occupants(null);
  const occupantIds = pOccupants.map((user) => user.id);
  if (occupantId === roomOwner.id || occupantIds.includes(occupantId)) {
    return roomObj;
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
