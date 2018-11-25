import { IFieldResolver } from 'graphql-tools';

import { IWrContext } from '../../types';

import { IRoom, IBakedRoom, pRoomToIRoom } from '../Room';

const room: IFieldResolver<any, any, { id: string }> = async (
  _parent, { id }, { prisma },
): Promise<IBakedRoom | null> => {
  const pRoom = await prisma.room({ id });
  if (!pRoom) {
    return null;
  }
  return pRoomToIRoom(pRoom, prisma);
};

const activeRooms: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { prisma, sub },
): Promise<IRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const pRooms = await prisma.rooms({ where: { active: true } });
  if (!pRooms) {
    return null;
  }
  return pRooms.map((pRoom) => pRoomToIRoom(pRoom, prisma));
};

const rooms: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { prisma, sub },
): Promise<IRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const pRooms = await prisma.rooms({
    where: {
      OR: [
        { owner: { id: sub.id } },
        { occupants_some: { id: sub.id } },
      ],
    },
  });
  if (!pRooms) {
    return null;
  }
  return pRooms.map((pRoom) => pRoomToIRoom(pRoom, prisma));
};

export const roomQuery = {
  room, rooms, activeRooms,
};
