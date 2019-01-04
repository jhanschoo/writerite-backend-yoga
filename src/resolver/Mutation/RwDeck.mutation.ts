import { IFieldResolver } from 'graphql-tools';

import { MutationType, IRwContext } from '../../types';

import { pDeckToRwDeck, IBakedRwDeck } from '../RwDeck';
import {
  rwDeckTopicFromRwUser,
  IPDeckUpdatedPayload,
  IPDeckCreatedPayload,
  IPDeckDeletedPayload,
} from '../Subscription/RwDeck.subscription';

const rwDeckSave: IFieldResolver<any, IRwContext, {
  id?: string,
  name?: string,
}> = async (
  _parent, { id, name }, { sub, prisma, pubsub },
): Promise<IBakedRwDeck | null> => {
  if (!sub) {
    return null;
  }
  if (id) {
    if (!await prisma.$exists.pDeck({ id, owner: { id: sub.id } })) {
      return null;
    }
    const pDeck = await prisma.updatePDeck({
      data: (name && name.trim()) ? { name } : {},
      where: { id },
    });
    if (!pDeck) {
      return null;
    }
    const pDeckUpdate: IPDeckUpdatedPayload = {
      rwDeckUpdates: {
        mutation: MutationType.UPDATED,
        new: pDeck,
        oldId: null,
      },
    };
    pubsub.publish(rwDeckTopicFromRwUser(sub.id), pDeckUpdate);
    return pDeckToRwDeck(pDeck, prisma);
  } else {
    const pDeck = await prisma.createPDeck({
      name: (name && name.trim()) || 'New Deck',
      owner: { connect: { id: sub.id } },
    });
    if (!pDeck) {
      return null;
    }
    const pDeckUpdate: IPDeckCreatedPayload = {
      rwDeckUpdates: {
        mutation: MutationType.CREATED,
        new: pDeck,
        oldId: null,
      },
    };
    pubsub.publish(rwDeckTopicFromRwUser(sub.id), pDeckUpdate);
    return pDeckToRwDeck(pDeck, prisma);
  }
};

const rwDeckDelete: IFieldResolver<any, IRwContext, {
  id: string,
}> = async (
  _parent: any,
  { id },
  { sub, prisma, pubsub },
): Promise<string | null> => {
  if (!sub) {
    return null;
  }
  if (!await prisma.$exists.pDeck({ id, owner: { id: sub.id } })) {
    return null;
  }
  const pDeck = await prisma.deletePDeck({ id });
  if (!pDeck) {
    return null;
  }
  const pDeckUpdate: IPDeckDeletedPayload = {
    rwDeckUpdates: {
      mutation: MutationType.DELETED,
      new: null,
      oldId: pDeck.id,
    },
  };
  pubsub.publish(rwDeckTopicFromRwUser(sub.id), pDeckUpdate);
  return pDeck.id;
};

export const rwDeckMutation = {
  rwDeckSave, rwDeckDelete,
};
