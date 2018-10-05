import { deckQuery, deckMutation } from '../src/resolver/Deck';
import { prisma, DeckNode } from '../src/generated/prisma-client';
import { ICurrentUser, Roles } from '../src/interface/ICurrentUser';

const { deck, userDecks } = deckQuery;
const { deckSave, deckDelete } = deckMutation;

const EMAIL = 'abc@xyz';
const OTHER_EMAIL = 'def@xyz';
const NAME = 'newDeck';
const OTHER_NAME = 'otherDeck';

describe('Deck resolvers', async () => {
  describe('userDecks', async () => {
    beforeEach(async () => {
      await prisma.deleteManyDecks({});
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyDecks({});
      await prisma.deleteManyUsers({});
    });

    test('it should return null if sub.id is not present', async () => {
      const userNode = await prisma.createUser({ email: EMAIL });
      const deckNode = await prisma.createDeck({ name: NAME, owner: { connect: { email: EMAIL } } });
      expect(userDecks(null, null, null)).resolves.toBeNull();
      expect(userDecks(null, null, {
        sub: ({} as ICurrentUser),
      })).resolves.toBeNull();
      return userNode;
    });

    test('it should return user\'s decks if they exist', async () => {
      const userNode = await prisma.createUser({ email: EMAIL });
      const deckNode = await prisma.createDeck({ name: NAME, owner: { connect: { email: EMAIL } } });
      const retrievedDecks = await userDecks(null, null, {
        sub: ({
          id: userNode.id,
        } as ICurrentUser),
      });
      expect(retrievedDecks).toContainEqual(expect.objectContaining({
        id: deckNode.id,
      }));
    });

    test('it should not return other users\' decks if they exist', async () => {
      const userNode = await prisma.createUser({ email: EMAIL });
      await prisma.createUser({ email: OTHER_EMAIL });
      await prisma.createDeck({ name: NAME, owner: { connect: { email: EMAIL } } });
      const otherDeckNode = await prisma.createDeck({ name: NAME, owner: { connect: { email: OTHER_EMAIL } } });
      const retrievedDecks = await userDecks(null, null, {
        sub: ({
          id: userNode.id,
        } as ICurrentUser),
      });
      expect(retrievedDecks).not.toContainEqual(expect.objectContaining({
        id: otherDeckNode.id,
      }));
    });
  });

  describe('deck', () => {
    beforeEach(async () => {
      await prisma.deleteManyDecks({});
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyDecks({});
      await prisma.deleteManyUsers({});
    });

    test('it should return null on no deck present', () => {
      expect(deck(null, { id: '1234567' })).resolves.toBeNull();
    });

    test('it should return deck if it exists', async () => {
      const deckNode = await prisma.createDeck({ name: NAME, owner: { create: { email: EMAIL } } });
      const retrievedDeck = await deck(null, { id: deckNode.id });
      expect(retrievedDeck.id).toBe(deckNode.id);
    });
  });

  describe('deckSave', () => {
    beforeEach(async () => {
      await prisma.deleteManyDecks({});
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyDecks({});
      await prisma.deleteManyUsers({});
    });

    test('it should return null if sub.id is not present', async () => {
      expect(deckSave(null, { name: NAME }, null)).resolves.toBeNull();
      expect(deckSave(null, { name: NAME }, { sub: {} })).resolves.toBeNull();
    });

    test('it should return null and not save/update if specifies a deck not owned by sub.id', async () => {
      const user = await prisma.createUser({ email: EMAIL });
      const otherUser = await prisma.createUser({ email: OTHER_EMAIL });
      const deckNode = await prisma.createDeck({ name: NAME, owner: { connect: { id: user.id }}});
      const otherDeckNode = await deckSave(null, { id: deckNode.id, name: OTHER_NAME }, { sub: { id: otherUser.id } });
      expect(otherDeckNode).toBeNull();
      expect(prisma.deck({ id: deckNode.id })).resolves.toHaveProperty('name', NAME);
    });

    test('it saves a deck when no deck id is specified', async () => {
      const user = await prisma.createUser({ email: EMAIL });
      const deckNode = await deckSave(null, { name: NAME }, { sub: { id: user.id } });
      expect(deckNode).toHaveProperty('id');
      expect(deckNode).toHaveProperty('name', NAME);
      // work around typescript thinking deckNode may be null
      if (deckNode) {
        expect(prisma.deck({ id: deckNode.id })).resolves.toHaveProperty('name', NAME);
        expect(prisma.deck({ id: deckNode.id }).owner().id()).resolves.toBe(user.id);
      }
    });

    test('it updates a deck when id specifies a deck owned by sub.id', async () => {
      const user = await prisma.createUser({ email: EMAIL });
      const deckObj = await prisma.createDeck({ name: NAME, owner: { connect: { id: user.id }}});
      const deckNode = await deckSave(null, { id: deckObj.id, name: OTHER_NAME }, { sub: { id: user.id } });
      expect(deckNode).toHaveProperty('id');
      expect(deckNode).toHaveProperty('name', OTHER_NAME);
      expect(prisma.deck({ id: deckObj.id }).owner().id()).resolves.toBe(user.id);
      expect(prisma.deck({ id: deckObj.id }).name()).resolves.toBe(OTHER_NAME);
    });
  });
  describe('deckDelete', () => {
    beforeEach(async () => {
      await prisma.deleteManyDecks({});
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyDecks({});
      await prisma.deleteManyUsers({});
    });

    test('it should return null if sub.id is not present', async () => {
      const user = await prisma.createUser({ email: EMAIL });
      const deckNode = await prisma.createDeck({ name: NAME, owner: { connect: { id: user.id } }});
      expect(deckDelete(null, { id: deckNode.id }, null)).resolves.toBeNull();
      expect(deckDelete(null, { id: deckNode.id }, { sub: {} })).resolves.toBeNull();
      const savedDeck = await prisma.deck({ id: deckNode.id });
      expect(savedDeck).toHaveProperty('name', NAME);
    });

    test('it should return null if deck has differnet owner than sub.id', async () => {
      const user = await prisma.createUser({ email: EMAIL });
      const otherUser = await prisma.createUser({ email: OTHER_EMAIL });
      const deckNode = await prisma.createDeck({ name: NAME, owner: { connect: { id: user.id } }});
      expect(deckDelete(null, { id: deckNode.id }, { sub: {
        id: otherUser.id,
      } })).resolves.toBeNull();
      const savedDeck = await prisma.deck({ id: deckNode.id });
      expect(savedDeck).toHaveProperty('name', NAME);
    });

    test('it should return delete if deck has same owner than sub.id', async () => {
      const user = await prisma.createUser({ email: EMAIL });
      const deckNode = await prisma.createDeck({ name: NAME, owner: { connect: { id: user.id } }});
      const deletedDeck = await deckDelete(null, { id: deckNode.id }, { sub: {
        id: user.id,
      } });
      expect(deletedDeck).toHaveProperty('id');
      expect(deletedDeck).toHaveProperty('name', NAME);
      expect(prisma.deck({ id: deckNode.id })).resolves.toBeNull();
    });
  });
});
