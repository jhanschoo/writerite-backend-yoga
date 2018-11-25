import { IFieldResolver } from 'graphql-tools';
import randomWords from 'random-words';

import { IWrContext } from '../../types';

import { IBakedRoom, pRoomToIRoom } from '../Room';

const roomCreate: IFieldResolver<any, IWrContext, {
  name?: string,
}> = async (_parent, { name }, { prisma, sub }): Promise<IBakedRoom | null> => {
  if (!sub) {
    return null;
  }
  const pRoom = await prisma.createRoom({
    active: true,
    name: (name && name.trim()) || (randomWords({
      exactly: 1, wordsPerString: 3, separator: '-',
    })[0] as string),
    owner: { connect: { id: sub.id } },
  });
  if (!pRoom) {
    return null;
  }
  return pRoomToIRoom(pRoom, prisma);
};

// TODO: access control: owner or self only
const roomAddOccupant: IFieldResolver<any, any, {
  id: string, occupantId: string,
}> = async (
  parent: any, { id, occupantId }, { prisma },
): Promise<IBakedRoom | null> => {
  if (!await prisma.$exists.room({ id })) {
    return null;
  }
  if (!await prisma.$exists.user({ id: occupantId })) {
    return null;
  }
  const pRoom = await prisma.room({ id });
  const roomObj = pRoomToIRoom(pRoom, prisma);
  const roomOwner = await roomObj.owner(null);
  const pOccupants = await roomObj.occupants(null);
  const occupantIds = pOccupants.map((user) => user.id);
  if (occupantId === roomOwner.id || occupantIds.includes(occupantId)) {
    return roomObj;
  }
  const pUpdatedRoom = await prisma.updateRoom({
    data: {
      occupants: { connect: { id: occupantId } },
    },
    where: { id },
  });
  if (!pUpdatedRoom) {
    return null;
  }
  return pRoomToIRoom(pUpdatedRoom, prisma);
};

export const roomMutation = {
  roomCreate, roomAddOccupant,
};
