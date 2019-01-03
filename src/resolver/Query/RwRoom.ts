import { IFieldResolver } from 'graphql-tools';

import { IRwContext } from '../../types';

import { IBakedRwRoom, pRoomToRwRoom } from '../RwRoom';

const rwRoom: IFieldResolver<any, IRwContext, { id: string }> = async (
  _parent, { id }, { prisma },
): Promise<IBakedRwRoom | null> => {
  const pRoom = await prisma.pRoom({ id });
  if (!pRoom) {
    return null;
  }
  return pRoomToRwRoom(pRoom, prisma);
};

const activeRwRooms: IFieldResolver<any, IRwContext, {}> = async (
  _parent, _args, { prisma, sub },
): Promise<IBakedRwRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const pRooms = await prisma.pRooms({ where: { active: true } });
  if (!pRooms) {
    return null;
  }
  return pRooms.map((pRoom) => pRoomToRwRoom(pRoom, prisma));
};

const rwRooms: IFieldResolver<any, IRwContext, {}> = async (
  _parent, _args, { prisma, sub },
): Promise<IBakedRwRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const pRooms = await prisma.pRooms();
  if (!pRooms) {
    return null;
  }
  return pRooms.map((pRoom) => pRoomToRwRoom(pRoom, prisma));
};

export const rwRoomQuery = {
  rwRoom, rwRooms, activeRwRooms,
};
