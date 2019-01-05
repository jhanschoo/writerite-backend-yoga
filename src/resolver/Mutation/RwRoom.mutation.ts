import { IFieldResolver } from 'graphql-tools';
import randomWords from 'random-words';

import { IRwContext, MutationType, ICreatedUpdate, IUpdatedUpdate } from '../../types';

import { IBakedRwRoom, pRoomToRwRoom } from '../RwRoom';
import {
  rwRoomTopic,
} from '../Subscription/RwRoom.subscription';
import { PRoom } from '../../../generated/prisma-client';
import { throwIfDevel, wrAuthenticationError, wrNotFoundError, wrGuardPrismaNullError } from '../../util';

const rwRoomCreate: IFieldResolver<any, IRwContext, {
  name?: string, deckId: string,
}> = async (_parent, { name, deckId }, { prisma, pubsub, sub, redisClient }): Promise<IBakedRwRoom | null> => {
  try {
    if (!sub) {
      throw wrAuthenticationError();
    }
    const pRoom = await prisma.createPRoom({
      active: true,
      name: (name && name.trim()) || (randomWords({
        exactly: 1, wordsPerString: 3, separator: '-',
      })[0] as string),
      owner: { connect: { id: sub.id } },
      deck: { connect: { id: deckId } },
    });
    wrGuardPrismaNullError(pRoom);
    const pRoomUpdate: ICreatedUpdate<PRoom> = {
      mutation: MutationType.CREATED,
      new: pRoom,
      oldId: null,
    };
    pubsub.publish(rwRoomTopic(), pRoomUpdate);
    redisClient.publish('writerite:room:activating', pRoom.id);
    return pRoomToRwRoom(pRoom, prisma);
  } catch (e) {
    return throwIfDevel(e);
  }
};

// TODO: access control: owner or self only
const rwRoomAddOccupant: IFieldResolver<any, IRwContext, {
  id: string, occupantId: string,
}> = async (
  _parent: any, { id, occupantId }, { prisma, sub, pubsub },
): Promise<IBakedRwRoom | null> => {
  try {
    if (!sub) {
      throw wrAuthenticationError();
    }
    const pRoom = await prisma.pRoom({ id });
    wrGuardPrismaNullError(pRoom);
    const rwRoom = pRoomToRwRoom(pRoom, prisma);
    const roomOwner = await rwRoom.owner(null);
    // TODO: implement allowing occupants to add new occupants
    if (roomOwner.id !== sub.id) {
      throw wrNotFoundError('room');
    }
    const pOccupants = await rwRoom.occupants(null);
    const occupantIds = pOccupants.map((user) => user.id);
    if (occupantId === roomOwner.id || occupantIds.includes(occupantId)) {
      return rwRoom;
    }
    const pUpdatedRoom = await prisma.updatePRoom({
      data: {
        // TODO: verify that this appends an occupant rather than overwriting
        occupants: { connect: { id: occupantId } },
      },
      where: { id },
    });
    wrGuardPrismaNullError(pUpdatedRoom);
    const pRoomUpdate: IUpdatedUpdate<PRoom> = {
      mutation: MutationType.UPDATED,
      new: pUpdatedRoom,
      oldId: null,
    };
    pubsub.publish(rwRoomTopic(), pRoomUpdate);
    return pRoomToRwRoom(pUpdatedRoom, prisma);
  } catch (e) {
    return throwIfDevel(e);
  }
};

export const rwRoomMutation = {
  rwRoomCreate, rwRoomAddOccupant,
};
