import { IFieldResolver } from 'graphql-tools';

import { IUpdate, IRwContext } from '../../types';

import { PRoom } from '../../../generated/prisma-client';
import { pRoomToRwRoom } from '../RwRoom';
import { updateMapFactory } from '../../util';

export function rwRoomTopicFromRwUser(id: string) {
  return `room:user:${id}`;
}

const rwRoomUpdatesSubscribe: IFieldResolver<any, IRwContext, {}> = async (
  _parent, _args, { pubsub, sub },
): Promise<AsyncIterator<IUpdate<PRoom>> | null> => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IUpdate<PRoom>>(rwRoomTopicFromRwUser(sub.id));
};

export const rwRoomSubscription = {
  rwRoomUpdates: {
    resolve: updateMapFactory(pRoomToRwRoom),
    subscribe: rwRoomUpdatesSubscribe,
  },
};
