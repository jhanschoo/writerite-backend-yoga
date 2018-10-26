import { prisma, SimpleCardNode } from '../generated/prisma-client';
import { IDeck, IBakedDeck, deckNodeToIDeck } from './Deck';
import { ICurrentUser, ResolvesTo, IWrContext } from '../types';
import { fieldGetter } from '../util';

export interface ICard {
  id: ResolvesTo<string>;
  front: ResolvesTo<string>;
  back: ResolvesTo<string>;
  deck: ResolvesTo<IDeck>;
}

export const Card: ICard = {
  id: fieldGetter<string>('id'),
  front: fieldGetter<string>('front'),
  back: fieldGetter<string>('back'),
  deck: fieldGetter<IDeck>('deck'),
};

export interface IBakedCard extends ICard {
  id: string;
  front: string;
  back: string;
  deck: ResolvesTo<IBakedDeck>;
}

// Relation resolver
export function cardNodeToICard(simpleCardNode: SimpleCardNode): IBakedCard {
  return {
    id: simpleCardNode.id,
    front: simpleCardNode.front,
    back: simpleCardNode.back,
    deck: async () => {
      return deckNodeToIDeck(await prisma.simpleCard({ id: simpleCardNode.id }).deck());
    },
  };
}

// Query resolvers

export async function card(
  parent: any,
  { id }: { id: string },
): Promise<ICard|null> {
  const simpleCardNode = await prisma.simpleCard({ id });
  if (simpleCardNode) {
    return cardNodeToICard(simpleCardNode);
  }
  return null;
}

async function cardsFromDeck(parent: any, { id }: any): Promise<ICard[]|null> {
  if (!await prisma.$exists.deck({ id })) {
    return null;
  }
  const cardNodes = await prisma.deck({ id }).cards();
  if (cardNodes) {
    return (cardNodes).map(cardNodeToICard);
  }
  return null;
}

// Mutation resolvers

async function cardSave(parent: any, { id, front, back, deckId }: any, { sub }: IWrContext): Promise<ICard|null> {
  if (!sub) {
    return null;
  }
  if (id) {
    if (await prisma.$exists.simpleCard({ id, deck: { id: (deckId as string), owner: { id: sub.id } } })) {
      const cardNode = await prisma.updateSimpleCard({ data: { front, back }, where: { id }});
      if (cardNode) {
        return cardNodeToICard(cardNode);
      }
    }
    return null;
  } else if (await prisma.$exists.deck({ id: deckId, owner: { id: sub.id } })) {
    const deckNode = await prisma.deck({ id: deckId });
    const cardNode = await prisma.createSimpleCard({
      front, back, deck: { connect: { id: deckNode.id } } });
    if (cardNode) {
      return cardNodeToICard(cardNode);
    }
    return null;
  }
  return null;
}

async function cardDelete(
  parent: any,
  { id }: { id: string },
  { sub }: IWrContext,
): Promise<ICard|null> {
  if (!sub) {
    return null;
  }
  if (await prisma.$exists.simpleCard({ id, deck: { owner: { id: sub.id } } })) {
    const cardNode = await prisma.deleteSimpleCard({ id });
    if (cardNode) {
      return cardNodeToICard(cardNode);
    }
  }
  return null;
}

export const cardQuery = {
  card, cardsFromDeck,
};

export const cardMutation = {
  cardSave, cardDelete,
};
