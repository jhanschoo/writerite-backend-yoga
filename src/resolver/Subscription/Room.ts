import { IFieldResolver } from 'graphql-tools';

import { IUpdate, IWrContext, MutationType } from '../../types';

import { IRoom } from '../Room';

export const enum RoomOccupantMutationType {
  JOINED = 'JOINED',
  LEFT = 'LEFT',
}
export type RoomMutationType = MutationType | RoomOccupantMutationType;

interface IActiveRoomUpdatesPayload {
  activeRoomUpdates: IUpdate<IRoom, RoomMutationType>;
}

interface IRoomOccupantUpdatesPayload {
  roomOccupantUpdates: IUpdate<IRoom, RoomMutationType>;
}

export type IRoomPayload =
  | IActiveRoomUpdatesPayload
  | IRoomOccupantUpdatesPayload;

export function activeRoomTopic() {
  return 'active-room';
}

export function roomTopicFromUser(id: string) {
  return `user-room:${id}`;
}

const roomOccupantUpdates: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { pubsub, sub },
): Promise<AsyncIterator<IRoomPayload> | null> => {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IRoomPayload>(roomTopicFromUser(sub.id));
};

const activeRoomUpdates: IFieldResolver<any, IWrContext, any> = async (
  _parent, _args, { pubsub },
): Promise<AsyncIterator<IRoomPayload> | null> => {
  return pubsub.asyncIterator<IRoomPayload>(activeRoomTopic());
};

export const roomSubscription = {
  activeRoomUpdates: {
    subscribe: activeRoomUpdates,
  },
  roomOccupantUpdates: {
    subscribe: roomOccupantUpdates,
  },
};
