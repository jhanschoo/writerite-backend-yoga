import { GraphQLFieldResolver } from 'graphql';
import { prisma } from '../generated/prisma-client';
import { ICurrentUser } from '../interface/ICurrentUser';

async function card(parent: any, ctx: any) {
  if (ctx && ctx.sub && ctx.sub.id) {
    const sub: ICurrentUser = ctx.sub;
    return await prisma.simpleCard({ id: sub.id });
  }
  return null;
}

async function cardsFromDeck(parent: any, ctx: any) {
  if (ctx && ctx.sub && ctx.sub.id) {
    const sub: ICurrentUser = ctx.sub;
    return await prisma.simpleCards({ where: { deck: { id: sub.id } } });
  }
}

async function cardSave(parent: any, { id, front, back, deck }: any, ctx: any) {
  if (ctx && ctx.sub && ctx.sub.id) {
    const sub: ICurrentUser = ctx.sub;
    if (id) {
      if (await prisma.$exists.simpleCard({ id, deck: { id: (deck as string), owner: { id: sub.id } } })) {
        return await prisma.updateSimpleCard({ data: { front, back }, where: { id }});
      }
      return null;
    } else if (await prisma.$exists.deck({ id: deck, owner: { id: sub.id } })) {
      const deckNode = await prisma.deck({ id: deck });
      return await prisma.createSimpleCard({
        front, back, deck: { connect: { id: deckNode.id } } });
    }
  }
  return null;
}

async function cardDelete(parent: any, { id }: any, ctx: any) {
  if (ctx && ctx.sub && ctx.sub.id) {
    const sub: ICurrentUser = ctx.sub;
    if (await prisma.$exists.simpleCard({ id, deck: { owner: { id: sub.id } } })) {
      return prisma.deleteSimpleCard({ id });
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
