import { GraphQLResolveInfo } from 'graphql';
import { MergeInfo } from 'graphql-tools';
import { PubSub } from 'graphql-yoga';

import { prisma, Deck, User } from '../generated/prisma-client';
import { IWrContext } from '../src/types';

import { rwDeckQuery } from '../src/resolver/Query/RwDeck';
import { rwDeckMutation } from '../src/resolver/Mutation/RwDeck';

const { rwDeck, rwDecks } = rwDeckQuery;
const { rwDeckSave, rwDeckDelete } = rwDeckMutation;

const pubsub = new PubSub();
const baseCtx = { prisma, pubsub } as IWrContext;
const baseInfo = {} as GraphQLResolveInfo & { mergeInfo: MergeInfo };

const EMAIL = 'abc@xyz';
const OTHER_EMAIL = 'def@xyz';
const NEW_EMAIL = 'ghi@xyz';
const NAME = 'oldDeck';
const OTHER_NAME = 'otherDeck';
const NEW_NAME = 'newDeck';

describe('Deck resolvers', async () => {
  let USER: User;
  let OTHER_USER: User;
  let DECK: Deck;
  let OTHER_DECK: Deck;
  const commonBeforeEach = async () => {
    await prisma.deleteManyDecks({});
    await prisma.deleteManyUsers({});
    USER = await prisma.createUser({ email: EMAIL });
    OTHER_USER = await prisma.createUser({ email: OTHER_EMAIL });
    DECK = await prisma.createDeck({ name: NAME, owner: { connect: { id: USER.id } } });
    OTHER_DECK = await prisma.createDeck({ name: OTHER_NAME, owner: { connect: { id: OTHER_USER.id } } });
  };
  const commonAfterEach = async () => {
    await prisma.deleteManyDecks({});
    await prisma.deleteManyUsers({});
  };

  beforeEach(async () => {
    await prisma.deleteManySimpleUserRoomMessages({});
    await prisma.deleteManyRooms({});
    await prisma.deleteManySimpleCards({});
    await prisma.deleteManyDecks({});
    await prisma.deleteManyUsers({});
  });

  describe('decks', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub is not present', async () => {
      expect.assertions(1);
      expect(rwDecks(null, null, baseCtx, baseInfo))
        .resolves.toBeNull();
    });
    test('it should return user\'s decks if they exist', async () => {
      expect.assertions(1);
      const retrievedDecks = await rwDecks(null, null, {
        ...baseCtx, sub: { id: USER.id },
      } as IWrContext, baseInfo);
      expect(retrievedDecks).toContainEqual(expect.objectContaining({
        id: DECK.id,
      }));
    });
    test('it should not return other users\' decks if they exist', async () => {
      expect.assertions(1);
      const retrievedDecks = await rwDecks(null, null, {
        ...baseCtx, sub: { id: USER.id },
      } as IWrContext, baseInfo);
      expect(retrievedDecks).not.toContainEqual(expect.objectContaining({
        id: OTHER_DECK.id,
      }));
    });
  });

  describe('deck', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null on no deck present', () => {
      expect.assertions(1);
      expect(rwDeck(null, { id: '1234567' }, baseCtx, baseInfo))
        .resolves.toBeNull();
    });
    test('it should return deck if it exists', async () => {
      expect.assertions(1);
      const retrievedDeck = await rwDeck(
        null, { id: DECK.id }, baseCtx, baseInfo,
      );
      if (!retrievedDeck) {
        return null;
      }
      expect(retrievedDeck.id).toBe(DECK.id);
    });
  });

  describe('deckSave', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub is not present', async () => {
      expect.assertions(1);
      expect(rwDeckSave(null, { name: NAME }, baseCtx, baseInfo))
        .resolves.toBeNull();
    });
    test('it saves a deck when no deck id is specified', async () => {
      expect.assertions(4);
      const deckObj = await rwDeckSave(null, { name: NEW_NAME }, {
        ...baseCtx, sub: { id: USER.id },
      } as IWrContext, baseInfo);
      expect(deckObj).toHaveProperty('id');
      expect(deckObj).toHaveProperty('name', NEW_NAME);
      // work around typescript thinking deckNode may be null
      if (!deckObj) {
        return null;
      }
      expect(await prisma.deck({ id: deckObj.id })).toHaveProperty('name', NEW_NAME);
      expect(await prisma.deck({ id: deckObj.id }).owner().id()).toBe(USER.id);
    });
    test('it should return null and not save/update if specifies a deck not owned by sub.id', async () => {
      expect.assertions(2);
      const otherDeckObj = await rwDeckSave(
        null,
        { id: OTHER_DECK.id, name: NEW_NAME },
        { ...baseCtx, sub: { id: USER.id } } as IWrContext,
        baseInfo,
      );
      expect(otherDeckObj).toBeNull();
      expect(prisma.deck({ id: OTHER_DECK.id })).resolves.toHaveProperty('name', OTHER_NAME);
    });
    test('it updates a deck when id specifies a deck owned by sub.id', async () => {
      expect.assertions(4);
      const deckObj = await rwDeckSave(null, { id: DECK.id, name: NEW_NAME }, {
        ...baseCtx, sub: { id: USER.id },
      } as IWrContext, baseInfo);
      expect(deckObj).toHaveProperty('id');
      expect(deckObj).toHaveProperty('name', NEW_NAME);
      expect(prisma.deck({ id: DECK.id }).owner().id()).resolves.toBe(USER.id);
      expect(prisma.deck({ id: DECK.id }).name()).resolves.toBe(NEW_NAME);
    });
  });

  describe('deckDelete', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub is not present', async () => {
      expect.assertions(2);
      expect(rwDeckDelete(null, { id: DECK.id }, baseCtx, baseInfo))
        .resolves.toBeNull();
      const savedDeck = await prisma.deck({ id: DECK.id });
      expect(savedDeck).toHaveProperty('name', NAME);
    });
    test('it should return null if deck has differnet owner than sub.id', async () => {
      expect.assertions(2);
      expect(await rwDeckDelete(null, { id: OTHER_DECK.id }, {
        ...baseCtx, sub: { id: USER.id },
      } as IWrContext, baseInfo)).toBeNull();
      const savedDeck = await prisma.deck({ id: OTHER_DECK.id });
      expect(savedDeck).toHaveProperty('name', OTHER_NAME);
    });
    test('it should delete and return deleted deck\'s id if deck has same owner than sub.id', async () => {
      expect.assertions(2);
      const deletedDeckId = await rwDeckDelete(null, { id: DECK.id }, {
        ...baseCtx, sub: { id: USER.id },
      } as IWrContext, baseInfo);
      expect(deletedDeckId).toEqual(DECK.id);
      expect(await prisma.deck({ id: DECK.id })).toBeNull();
    });
  });
});
