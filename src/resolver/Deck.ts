import { PubSub } from 'graphql-yoga';
import { prisma, DeckNode } from '../generated/prisma-client';
import { ICurrentUser, IUpdate, MutationType, ResolvesTo, IWrContext } from '../types';

import { IUser, IBakedUser, userNodeToIUser } from './User';
import { ICard, IBakedCard, cardNodeToICard } from './Card';
import { fieldGetter } from '../util';

export interface IDeck {
  id: ResolvesTo<string>;
  name: ResolvesTo<string>;
  owner: ResolvesTo<IUser>;
  cards: ResolvesTo<ICard[]>;
}

export const Deck: ResolvesTo<IDeck> = {
  id: fieldGetter('id'),
  name: fieldGetter('name'),
  owner: fieldGetter('owner'),
  cards: fieldGetter('cards'),
};

export interface IBakedDeck extends IDeck {
  id: string;
  name: string;
  owner: ResolvesTo<IBakedUser>;
  cards: ResolvesTo<IBakedCard[]>;
}

interface IDeckUserPayload {
  deckUpdatesOfUser: IUpdate<IDeck>;
}

export function deckNodeToIDeck(deckNode: DeckNode): IBakedDeck {
  return {
    id: deckNode.id,
    name: deckNode.name,
    owner: async () => userNodeToIUser(
      await prisma.deck({ id: deckNode.id }).owner()),
    cards: async () => (
      await prisma.deck({ id: deckNode.id }).cards()
    ).map(cardNodeToICard),
  };
}

function deckTopicFromUser(id: string) {
  return `user-deck:${id}`;
}

// TODO
async function userDecks(
  parent: any,
  args: any,
  { sub }: IWrContext): Promise<IDeck[]|null> {
  if (!sub) {
    return null;
  }
  const deckNodes = await prisma.decks({ where: { owner: { id: sub.id } } });
  if (deckNodes) {
    return deckNodes.map(deckNodeToIDeck);
  }
  return null;
}

export async function deck(
  parent: any,
  { id }: { id: string }) {
  const deckNode = await prisma.deck({ id });
  if (deckNode) {
    return deckNodeToIDeck(deckNode);
  }
  return null;
}

async function deckSave(
  parent: any,
  { id, name }: { id?: string, name: string },
  { sub, pubsub }: IWrContext) {
  if (!sub) {
    return null;
  }
  if (id) {
    if (await prisma.$exists.deck({ id, owner: { id: sub.id } })) {
      const deckNode = await prisma.updateDeck({
        data: { name },
        where: { id },
      });
      if (deckNode) {
        const deckObj = deckNodeToIDeck(deckNode);
        const deckUpdate: IDeckUserPayload = {
          deckUpdatesOfUser: {
            mutation: MutationType.UPDATED,
            new: deckObj,
            old: null,
          },
        };
        pubsub.publish(deckTopicFromUser(sub.id), deckUpdate);
        return deckObj;
      }
    }
    return null;
  } else {
    const deckNode = await prisma.createDeck({ name, owner: { connect: { id: sub.id } } });
    if (deckNode) {
      const deckObj = deckNodeToIDeck(deckNode);
      const deckUpdate: IDeckUserPayload = {
        deckUpdatesOfUser: {
          mutation: MutationType.CREATED,
          new: deckObj,
          old: null,
        },
      };
      pubsub.publish(deckTopicFromUser(sub.id), deckUpdate);
      return deckObj;
    }
    return null;
  }
}

async function deckDelete(
  parent: any,
  { id }: { id: string },
  { sub, pubsub }: IWrContext) {
  if (!sub) {
    return null;
  }
  if (await prisma.$exists.deck({ id, owner: { id: sub.id } })) {
    const deckNode = await prisma.deleteDeck({ id });
    if (deckNode) {
      const deckObj = deckNodeToIDeck(deckNode);
      const deckUpdate: IDeckUserPayload = {
        deckUpdatesOfUser: {
          mutation: MutationType.DELETED,
          new: null,
          // TODO: querying through relations on a deleted node
          //   may fail.
          old: deckNodeToIDeck(deckNode),
        },
      };
      pubsub.publish(deckTopicFromUser(sub.id), deckUpdate);
      return deckObj;
    }
  }
  return null;
}

function deckUpdatesOfUser(parent: any, args: any, { sub, pubsub }: IWrContext): AsyncIterator<IDeckUserPayload>|null {
  if (!sub) {
    return null;
  }
  return pubsub.asyncIterator<IDeckUserPayload>(deckTopicFromUser(sub.id));
}

export const deckQuery = {
  deck, userDecks,
};

export const deckMutation = {
  deckSave, deckDelete,
};

export const deckSubscription = {
  deckUpdatesOfUser: {
    subscribe: deckUpdatesOfUser,
  },
};
