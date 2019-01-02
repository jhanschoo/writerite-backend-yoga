import { IFieldResolver } from 'graphql-tools';

import { IRwContext } from '../../types';

import { IRwRoom, IBakedRwRoom, pRoomToRwRoom } from '../RwRoom';

const rwRoom: IFieldResolver<any, any, { id: string }> = async (
  _parent, { id }, { prisma },
): Promise<IBakedRwRoom | null> => {
  const pRoom = await prisma.pRoom({ id });
  if (!pRoom) {
    return null;
  }
  return pRoomToRwRoom(pRoom, prisma);
};

const activeRwRooms: IFieldResolver<any, IRwContext, any> = async (
  _parent, _args, { prisma, sub },
): Promise<IRwRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const pRooms = await prisma.pRooms({ where: { active: true } });
  if (!pRooms) {
    return null;
  }
  return pRooms.map((pRoom) => pRoomToRwRoom(pRoom, prisma));
};

const rwRooms: IFieldResolver<any, IRwContext, any> = async (
  _parent, _args, { prisma, sub },
): Promise<IRwRoom[] | null> => {
  if (!sub) {
    return null;
  }
  const pRooms = await prisma.pRooms({
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
