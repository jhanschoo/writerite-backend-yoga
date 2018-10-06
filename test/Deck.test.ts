import { deckQuery, deckMutation } from '../src/resolver/Deck';
import { prisma, DeckNode, UserNode } from '../src/generated/prisma-client';
import { ICurrentUser, Roles } from '../src/interface/ICurrentUser';

const { deck, userDecks } = deckQuery;
const { deckSave, deckDelete } = deckMutation;

const EMAIL = 'abc@xyz';
const OTHER_EMAIL = 'def@xyz';
const NEW_EMAIL = 'ghi@xyz';
const NAME = 'oldDeck';
const OTHER_NAME = 'otherDeck';
const NEW_NAME = 'newDeck';

describe('Deck resolvers', async () => {
  let USER: UserNode;
  let OTHER_USER: UserNode;
  let DECK: DeckNode;
  let OTHER_DECK: DeckNode;
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
  describe('userDecks', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return null if sub.id is not present', async () => {
      expect(userDecks(null, null, null)).resolves.toBeNull();
      expect(userDecks(null, null, {
        sub: ({} as ICurrentUser),
      })).resolves.toBeNull();
    });

    test('it should return user\'s decks if they exist', async () => {
      const retrievedDecks = await userDecks(null, null, {
        sub: ({
          id: USER.id,
        } as ICurrentUser),
      });
      expect(retrievedDecks).toContainEqual(expect.objectContaining({
        id: DECK.id,
      }));
    });

    test('it should not return other users\' decks if they exist', async () => {
      const retrievedDecks = await userDecks(null, null, {
        sub: ({
          id: USER.id,
        } as ICurrentUser),
      });
      expect(retrievedDecks).not.toContainEqual(expect.objectContaining({
        id: OTHER_DECK.id,
      }));
    });
  });

  describe('deck', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return null on no deck present', () => {
      expect(deck(null, { id: '1234567' })).resolves.toBeNull();
    });

    test('it should return deck if it exists', async () => {
      const retrievedDeck = await deck(null, { id: DECK.id });
      expect(retrievedDeck.id).toBe(DECK.id);
    });
  });

  describe('deckSave', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub.id is not present', async () => {
      expect(deckSave(null, { name: NAME }, null)).resolves.toBeNull();
      expect(deckSave(null, { name: NAME }, { sub: {} })).resolves.toBeNull();
    });

    test('it saves a deck when no deck id is specified', async () => {
      const deckNode = await deckSave(null, { name: NEW_NAME }, { sub: { id: USER.id } });
      expect(deckNode).toHaveProperty('id');
      expect(deckNode).toHaveProperty('name', NEW_NAME);
      // work around typescript thinking deckNode may be null
      if (deckNode) {
        expect(prisma.deck({ id: deckNode.id })).resolves.toHaveProperty('name', NEW_NAME);
        expect(prisma.deck({ id: deckNode.id }).owner().id()).resolves.toBe(USER.id);
      }
    });

    test('it should return null and not save/update if specifies a deck not owned by sub.id', async () => {
      const otherDeckNode = await deckSave(null, { id: OTHER_DECK.id, name: NEW_NAME }, { sub: { id: USER.id } });
      expect(otherDeckNode).toBeNull();
      expect(prisma.deck({ id: OTHER_DECK.id })).resolves.toHaveProperty('name', OTHER_NAME);
    });

    test('it updates a deck when id specifies a deck owned by sub.id', async () => {
      const deckNode = await deckSave(null, { id: DECK.id, name: NEW_NAME }, { sub: { id: USER.id } });
      expect(deckNode).toHaveProperty('id');
      expect(deckNode).toHaveProperty('name', NEW_NAME);
      expect(prisma.deck({ id: DECK.id }).owner().id()).resolves.toBe(USER.id);
      expect(prisma.deck({ id: DECK.id }).name()).resolves.toBe(NEW_NAME);
    });
  });

  describe('deckDelete', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return null if sub.id is not present', async () => {
      expect(deckDelete(null, { id: DECK.id }, null)).resolves.toBeNull();
      expect(deckDelete(null, { id: DECK.id }, { sub: {} })).resolves.toBeNull();
      const savedDeck = await prisma.deck({ id: DECK.id });
      expect(savedDeck).toHaveProperty('name', NAME);
    });

    test('it should return null if deck has differnet owner than sub.id', async () => {
      expect(deckDelete(null, { id: OTHER_DECK.id }, { sub: {
        id: USER.id,
      } })).resolves.toBeNull();
      const savedDeck = await prisma.deck({ id: OTHER_DECK.id });
      expect(savedDeck).toHaveProperty('name', OTHER_NAME);
    });

    test('it should delete and return deleted deck if deck has same owner than sub.id', async () => {
      const deletedDeck = await deckDelete(null, { id: DECK.id }, { sub: {
        id: USER.id,
      } });
      expect(deletedDeck).toHaveProperty('id');
      expect(deletedDeck).toHaveProperty('name', NAME);
      expect(prisma.deck({ id: DECK.id })).resolves.toBeNull();
    });
  });
});
