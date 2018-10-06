import { GraphQLFieldResolver } from 'graphql';
import { prisma } from '../generated/prisma-client';
import { ICurrentUser } from '../interface/ICurrentUser';

async function card(parent: any, { id }: any) {
  return await prisma.simpleCard({ id });
}

async function cardsFromDeck(parent: any, { id }: any) {
  if (!await prisma.$exists.deck({ id })) {
    return null;
  }
  return await prisma.simpleCards({ where: { deck: { id } } });
}

async function cardSave(parent: any, { id, front, back, deckId }: any, ctx: any) {
  if (!(ctx && ctx.sub && ctx.sub.id)) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  if (id) {
    if (await prisma.$exists.simpleCard({ id, deck: { id: (deckId as string), owner: { id: sub.id } } })) {
      return await prisma.updateSimpleCard({ data: { front, back }, where: { id }});
    }
    return null;
  } else if (await prisma.$exists.deck({ id: deckId, owner: { id: sub.id } })) {
    const deckNode = await prisma.deck({ id: deckId });
    return await prisma.createSimpleCard({
      front, back, deck: { connect: { id: deckNode.id } } });
  }
}

async function cardDelete(parent: any, { id }: any, ctx: any) {
  if (!(ctx && ctx.sub && ctx.sub.id)) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  if (await prisma.$exists.simpleCard({ id, deck: { owner: { id: sub.id } } })) {
    return prisma.deleteSimpleCard({ id });
  }
}

export const cardQuery = {
  card, cardsFromDeck,
};

export const cardMutation = {
  cardSave, cardDelete,
};
