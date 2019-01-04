import { IFieldResolver } from 'graphql-tools';

import { IRwContext } from '../../types';

import { IBakedRwRoomMessage, pRoomMessageToRwRoomMessage } from '../RwRoomMessage';

const rwRoomMessage: IFieldResolver<any, IRwContext, { id: string }> = async (
  _parent, { id }, { prisma },
): Promise<IBakedRwRoomMessage | null> => {
  const pRoomMessage = await prisma.pRoomMessage({ id });
  if (!pRoomMessage) {
    return null;
  }
  return pRoomMessageToRwRoomMessage(pRoomMessage, prisma);
};

const rwRoomMessagesOfRoom: IFieldResolver<any, IRwContext, { roomId: string }> = async (
  _parent, { roomId }, { prisma, sub },
): Promise<IBakedRwRoomMessage[] | null> => {
  if (!sub) {
    return null;
  }
  const pRoomMessages = await prisma.pRoomMessages({
    where: {
      room: { id: roomId },
    },
  });
  if (!pRoomMessages) {
    return null;
  }
  return pRoomMessages.map((pRoomMessage) => pRoomMessageToRwRoomMessage(pRoomMessage, prisma));
};

export const rwRoomMessageQuery = {
  rwRoomMessage, rwRoomMessagesOfRoom,
};
