import { IFieldResolver } from 'graphql-tools';

import { MutationType, IWrContext } from '../../types';

import { pDeckToIDeck, IBakedDeck } from '../Deck';
import { deckTopicFromUser, IDeckUserPayload } from '../Subscription/Deck';

const deckSave: IFieldResolver<any, IWrContext, {
  id?: string,
  name?: string,
}> = async (
  _parent, { id, name }, { sub, prisma, pubsub },
): Promise<IBakedDeck | null> => {
  if (!sub) {
    return null;
  }
  if (id) {
    if (!await prisma.$exists.deck({ id, owner: { id: sub.id } })) {
      return null;
    }
    const pDeck = await prisma.updateDeck({
      data: (name && name.trim()) ? { name } : {},
      where: { id },
    });
    if (!pDeck) {
      return null;
    }
    const deckObj = pDeckToIDeck(pDeck, prisma);
    const deckUpdate: IDeckUserPayload = {
      deckUpdatesOfUser: {
        mutation: MutationType.UPDATED,
        new: deckObj,
        oldId: null,
      },
    };
    pubsub.publish(deckTopicFromUser(sub.id), deckUpdate);
    return deckObj;
  } else {
    const pDeck = await prisma.createDeck({
      name: (name && name.trim()) || 'New Deck',
      owner: { connect: { id: sub.id } },
    });
    if (!pDeck) {
      return null;
    }
    const deckObj = pDeckToIDeck(pDeck, prisma);
    const deckUpdate: IDeckUserPayload = {
      deckUpdatesOfUser: {
        mutation: MutationType.CREATED,
        new: deckObj,
        oldId: null,
      },
    };
    pubsub.publish(deckTopicFromUser(sub.id), deckUpdate);
    return deckObj;
  }
};

const deckDelete: IFieldResolver<any, IWrContext, {
  id: string,
}> = async (
  _parent: any,
  { id },
  { sub, prisma, pubsub },
): Promise<string | null> => {
  if (!sub) {
    return null;
  }
  if (!await prisma.$exists.deck({ id, owner: { id: sub.id } })) {
    return null;
  }
  const pDeck = await prisma.deleteDeck({ id });
  if (!pDeck) {
    return null;
  }
  const deckUpdate: IDeckUserPayload = {
    deckUpdatesOfUser: {
      mutation: MutationType.DELETED,
      new: null,
      oldId: pDeck.id,
    },
  };
  pubsub.publish(deckTopicFromUser(sub.id), deckUpdate);
  return pDeck.id;
};

export const deckMutation = {
  deckSave, deckDelete,
};
