import { IFieldResolver } from 'graphql-tools';

import { IWrContext } from '../../types';

import { IRwRoom, IBakedRwRoom, pRoomToRwRoom } from '../RwRoom';

const rwRoom: IFieldResolver<any, any, { id: string }> = async (
  _parent, { id }, { prisma },
): Promise<IBakedRwRoom | null> => {
  const pRoom = await prisma.room({ id });
  if (!pRoom) {
    return null;
  }
  return pRoomToRwRoom(pRoom, prisma);
};

const activeRwRooms: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { prisma, sub },
): Promise<IRwRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const pRooms = await prisma.rooms({ where: { active: true } });
  if (!pRooms) {
    return null;
  }
  return pRooms.map((pRoom) => pRoomToRwRoom(pRoom, prisma));
};

const rwRooms: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { prisma, sub },
): Promise<IRwRoom[] | null> => {
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
  return pRooms.map((pRoom) => pRoomToRwRoom(pRoom, prisma));
};

export const rwRoomQuery = {
  rwRoom, rwRooms, activeRwRooms,
};
