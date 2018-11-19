import { IFieldResolver, IResolverObject } from 'graphql-tools';

import { prisma, SimpleCard as prismaSimpleCard } from '../generated/prisma-client';
import { IDeck, IBakedDeck, deckNodeToIDeck } from './Deck';
import { ICurrentUser, ResolvesTo, IWrContext } from '../types';
import { fieldGetter } from '../util';
import { FragmentsOnCompositeTypes } from 'graphql/validation/rules/FragmentsOnCompositeTypes';

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
export function cardNodeToICard(simpleCardNode: prismaSimpleCard): IBakedCard {
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

const card: IFieldResolver<any, any, { id: string }> = async (
  parent,
  { id },
): Promise<ICard | null> => {
  const simpleCardNode = await prisma.simpleCard({ id });
  if (simpleCardNode) {
    return cardNodeToICard(simpleCardNode);
  }
  return null;
};

const cardsFromDeck: IFieldResolver<any, any, { id: string }> = async (
  parent,
  { id },
): Promise<ICard[] | null> => {
  if (!await prisma.$exists.deck({ id })) {
    return null;
  }
  const cardNodes = await prisma.deck({ id }).cards();
  if (cardNodes) {
    return (cardNodes).map(cardNodeToICard);
  }
  return null;
};

// Mutation resolvers

const cardSave: IFieldResolver<any, IWrContext, {
  id?: string,
  front: string,
  back: string,
  deckId: string,
}> = async (
  parent,
  { id, front, back, deckId },
  { sub }: IWrContext,
  ): Promise<ICard | null> => {
    if (!sub) {
      return null;
    }
    if (id) {
      if (await prisma.$exists.simpleCard({ id, deck: { id: (deckId as string), owner: { id: sub.id } } })) {
        const cardNode = await prisma.updateSimpleCard({ data: { front, back }, where: { id } });
        if (cardNode) {
          return cardNodeToICard(cardNode);
        }
      }
      return null;
    } else if (await prisma.$exists.deck({ id: deckId, owner: { id: sub.id } })) {
      const deckNode = await prisma.deck({ id: deckId });
      const cardNode = await prisma.createSimpleCard({
        front, back, deck: { connect: { id: deckNode.id } },
      });
      if (cardNode) {
        return cardNodeToICard(cardNode);
      }
      return null;
    }
    return null;
  };

const cardDelete: IFieldResolver<any, IWrContext, { id: string }> = async (
  parent, { id }, { sub },
): Promise<ICard | null> => {
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
};

export const cardQuery = {
  card, cardsFromDeck,
};

export const cardMutation = {
  cardSave, cardDelete,
};
