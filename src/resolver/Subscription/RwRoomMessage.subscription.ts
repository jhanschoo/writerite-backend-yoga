import { IFieldResolver } from 'graphql-tools';

import { IUpdate, IRwContext } from '../../types';

import { pRoomMessageToRwRoomMessage } from '../RwRoomMessage';
import { PRoomMessage } from '../../../generated/prisma-client';
import { updateMapFactory } from '../../util';

export function rwRoomMessageTopicFromRwRoom(id: string) {
  return `room-message:${id}`;
}

const rwRoomMessageUpdatesOfRoomSubscribe: IFieldResolver<any, IRwContext, {
  roomId: string,
}> = async (
  _parent, { roomId }, { prisma, pubsub },
): Promise<AsyncIterator<IUpdate<PRoomMessage>> | null> => {
  if (!await prisma.$exists.pRoom({ id: roomId })) {
    return null;
  }
  return pubsub.asyncIterator<IUpdate<PRoomMessage>>(rwRoomMessageTopicFromRwRoom(roomId));
};

export const rwRoomMessageSubscription = {
  rwRoomMessageUpdatesOfRoom: {
    resolve: updateMapFactory(pRoomMessageToRwRoomMessage),
    subscribe: rwRoomMessageUpdatesOfRoomSubscribe,
  },
};
