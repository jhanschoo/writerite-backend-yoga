import { IFieldResolver } from 'graphql-tools';

import { IRwContext } from '../../types';

import { IBakedRwRoomMessage, pSimpleUserRoomMessageToRwRoomMessage } from '../RwRoomMessage';

const rwRoomMessage: IFieldResolver<any, IRwContext, { id: string }> = async (
  _parent, { id }, { prisma },
): Promise<IBakedRwRoomMessage | null> => {
  const pRoomMessage = await prisma.pSimpleUserRoomMessage({ id });
  if (!pRoomMessage) {
    return null;
  }
  return pSimpleUserRoomMessageToRwRoomMessage(pRoomMessage, prisma);
};

const rwRoomMessagesOfRoom: IFieldResolver<any, IRwContext, { roomId: string }> = async (
  _parent, { roomId }, { prisma, sub },
): Promise<IBakedRwRoomMessage[] | null> => {
  if (!sub) {
    return null;
  }
  const pRoomMessages = await prisma.pSimpleUserRoomMessages({
    where: {
      room: { id: roomId },
    },
  });
  if (!pRoomMessages) {
    return null;
  }
  return pRoomMessages.map((pRoomMessage) => pSimpleUserRoomMessageToRwRoomMessage(pRoomMessage, prisma));
};

export const rwRoomMessageQuery = {
  rwRoomMessage, rwRoomMessagesOfRoom,
};
