import { GraphQLFieldResolver } from 'graphql';
import { prisma } from '../generated/prisma-client';
import { ICurrentUser } from '../interface/ICurrentUser';

// TODO
async function userDecks(parent: any, args: any, ctx: any) {
  if (!(ctx && ctx.sub && ctx.sub.id)) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  return prisma.decks({ where: { owner: { id: ctx.sub.id } } });
}

async function deck(parent: any, { id }: any) {
  return prisma.deck({ id });
}

async function deckSave(parent: any, { id, name }: any, ctx: any) {
  if (!(ctx && ctx.sub && ctx.sub.id)) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  if (id) {
    if (await prisma.$exists.deck({ id, owner: { id: sub.id } })) {
      return prisma.updateDeck({
        data: { name },
        where: { id },
      });
    }
  } else {
    return prisma.createDeck({ name, owner: { connect: { id: sub.id } } });
  }
}

async function deckDelete(parent: any, { id }: any, ctx: any) {
  if (!(ctx && ctx.sub && ctx.sub.id)) {
    return null;
  }
  const sub: ICurrentUser = ctx.sub;
  if (await prisma.$exists.deck({ id, owner: { id: sub.id } })) {
    return prisma.deleteDeck({ id });
  } else {
    return null;
  }
}

export const deckQuery = {
  deck, userDecks,
};

export const deckMutation = {
  deckSave, deckDelete,
};
