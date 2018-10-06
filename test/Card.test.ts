import { cardQuery, cardMutation } from '../src/resolver/Card';
import { prisma, DeckNode, UserNode, SimpleCardNode } from '../src/generated/prisma-client';
import { ICurrentUser, Roles } from '../src/interface/ICurrentUser';

const { card, cardsFromDeck } = cardQuery;
const { cardSave, cardDelete } = cardMutation;

const EMAIL = 'abc@xyz';
const OTHER_EMAIL = 'def@xyz';
const NEW_EMAIL = 'ghi@xyz';
const NAME = 'oldDeck';
const OTHER_NAME = 'otherDeck';
const NEXT_NAME = 'nextDeck';
const NEW_NAME = 'newDeck';
const FRONT = 'front';
const BACK = 'back';
const NEXT_FRONT = 'front';
const NEXT_BACK = 'back';
const OTHER_FRONT = 'otherFront';
const OTHER_BACK = 'otherBack';
const NEW_FRONT = 'newFront';
const NEW_BACK = 'newBack';

describe('Card resolvers', async () => {
  let USER: UserNode;
  let OTHER_USER: UserNode;
  let DECK: DeckNode;
  let NEXT_DECK: DeckNode;
  let OTHER_DECK: DeckNode;
  let CARD: SimpleCardNode;
  let NEXT_CARD: SimpleCardNode;
  let OTHER_CARD: SimpleCardNode;
  const commonBeforeEach = async () => {
    await prisma.deleteManySimpleCards({});
    await prisma.deleteManyDecks({});
    await prisma.deleteManyUsers({});
    USER = await prisma.createUser({ email: EMAIL });
    OTHER_USER = await prisma.createUser({ email: OTHER_EMAIL });
    DECK = await prisma.createDeck({ name: NAME, owner: { connect: { id: USER.id } } });
    NEXT_DECK = await prisma.createDeck({ name: NEXT_NAME, owner: { connect: { id: USER.id } } });
    OTHER_DECK = await prisma.createDeck({ name: OTHER_NAME, owner: { connect: { id: OTHER_USER.id } } });
    CARD = await prisma.createSimpleCard({ front: FRONT, back: BACK, deck: { connect: { id: DECK.id }}});
    NEXT_CARD = await prisma.createSimpleCard({
      front: NEXT_FRONT, back: NEXT_BACK, deck: { connect: { id: NEXT_DECK.id }}});
    OTHER_CARD = await prisma.createSimpleCard({
      front: OTHER_FRONT, back: OTHER_BACK, deck: { connect: { id: OTHER_DECK.id }}});
  };
  const commonAfterEach = async () => {
    await prisma.deleteManySimpleCards({});
    await prisma.deleteManyDecks({});
    await prisma.deleteManyUsers({});
  };
  describe('card', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return cards having specified id if deck exists', async () => {
      const cardNode = await card(null, { id: CARD.id });
      expect(cardNode).toHaveProperty('front', FRONT);
      expect(cardNode).toHaveProperty('back', BACK);
    });
    test('it should return null if no card with said id exists', async () => {
      const cardNodes = await card(null, { id: '1234567' });
      expect(cardNodes).toBeNull();
    });
  });
  describe('cardsFromDeck', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return cards from deck containing specified id if deck exists', async () => {
      const cardNodes = await cardsFromDeck(null, { id: DECK.id });
      expect(cardNodes).toContainEqual(
      expect.objectContaining({ front: FRONT, back: BACK }));
    });
    test('it should return null if no deck with said id exists', async () => {
      const cardNodes = await cardsFromDeck(null, { id: '1234567' });
      expect(cardNodes).toBeNull();
    });
  });
  describe('cardSave', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return null if sub.id is not present', async () => {
      expect(cardSave(null, { front: NEW_FRONT, back: NEW_BACK, deckId: DECK.id }, null)).resolves.toBeNull();
      expect(cardSave(null, { front: NEW_FRONT, back: NEW_BACK, deckId: DECK.id }, {
        sub: ({} as ICurrentUser),
      })).resolves.toBeNull();
      expect(cardSave(null, {
        id: CARD.id, front: NEW_FRONT, back: NEW_BACK, deckId: DECK.id }, null)).resolves.toBeNull();
      expect(cardSave(null, {
        id: CARD.id, front: NEW_FRONT, back: NEW_BACK, deckId: DECK.id }, {
        sub: ({} as ICurrentUser),
      })).resolves.toBeNull();
    });
    test('it should save card if id not supplied and deck\'s owner is sub.id', async () => {
      const cardNode = await cardSave(null, { front: NEW_FRONT, back: NEW_BACK, deckId: DECK.id }, {
        sub: ({
          id: USER.id,
        } as ICurrentUser),
      });
      expect(cardNode).toBeTruthy();
      if (cardNode) {
        expect(cardNode).toHaveProperty('id');
        expect(cardNode).toHaveProperty('front', NEW_FRONT);
        expect(cardNode).toHaveProperty('back', NEW_BACK);
        const savedCard = await prisma.simpleCard({ id: cardNode.id });
        expect(savedCard).toHaveProperty('id');
        expect(savedCard).toHaveProperty('front', NEW_FRONT);
        expect(savedCard).toHaveProperty('back', NEW_BACK);
      }
    });
    test('it should return null if id not supplied and deck\'s owner is not sub.id', async () => {
      expect(cardSave(null, { front: NEW_FRONT, back: NEW_BACK, deckId: OTHER_DECK.id }, {
        sub: ({
          id: USER.id,
        } as ICurrentUser),
      })).resolves.toBeNull();
      const otherCards = await prisma.simpleCards({ where: {
        deck: { id: OTHER_DECK.id },
      }});
      expect(otherCards).not.toContainEqual(
        expect.objectContaining({ front: NEW_FRONT, back: NEW_BACK }));
    });
    test('it should update if id is supplied and deck\'s owner is sub.id', async () => {
      const cardNode = await cardSave(null, { id: CARD.id, front: NEW_FRONT, back: NEW_BACK, deckId: DECK.id }, {
        sub: ({
          id: USER.id,
        } as ICurrentUser),
      });
      expect(cardNode).toHaveProperty('id', CARD.id);
      expect(cardNode).toHaveProperty('front', NEW_FRONT);
      expect(cardNode).toHaveProperty('back', NEW_BACK);
      const savedCard = await prisma.simpleCard({ id: CARD.id });
      expect(savedCard).toHaveProperty('id', CARD.id);
      expect(savedCard).toHaveProperty('front', NEW_FRONT);
      expect(savedCard).toHaveProperty('back', NEW_BACK);
    });
    test('it should return null if id is supplied but deck is not correct', async () => {
      expect(cardSave(null, { id: CARD.id, front: NEW_FRONT, back: NEW_BACK, deckId: NEXT_DECK.id }, {
        sub: ({
          id: USER.id,
        } as ICurrentUser),
      })).resolves.toBeNull();
      const cardNode = await prisma.simpleCard({ id: CARD.id });
      expect(cardNode).toHaveProperty('id', CARD.id);
      expect(cardNode).toHaveProperty('front', FRONT);
      expect(cardNode).toHaveProperty('back', BACK);
    });
    test('it should return null if deck\'s owner is not sub.id', async () => {
      expect(cardSave(null, { id: OTHER_CARD.id, front: NEW_FRONT, back: NEW_BACK, deckId: OTHER_DECK.id }, {
        sub: ({
          id: USER.id,
        } as ICurrentUser),
      })).resolves.toBeNull();
      const cardNode = await prisma.simpleCard({ id: OTHER_CARD.id });
      expect(cardNode).toHaveProperty('id', OTHER_CARD.id);
      expect(cardNode).toHaveProperty('front', OTHER_FRONT);
      expect(cardNode).toHaveProperty('back', OTHER_BACK);
    });
  });
  describe('cardDelete', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return null if sub.id is not present', async () => {
      expect(cardDelete(null, { id: CARD.id }, null)).resolves.toBeNull();
      expect(cardDelete(null, { id: CARD.id }, {
        sub: ({} as ICurrentUser),
      })).resolves.toBeNull();
    });
    test('it should delete if deck\'s owner is sub.id', async () => {
      const cardNode = await cardDelete(null, { id: CARD.id }, {
        sub: ({
          id: USER.id,
        } as ICurrentUser),
      });
      expect(cardNode).toBeTruthy();
      if (cardNode) {
        expect(cardNode).toHaveProperty('id', CARD.id);
        expect(cardNode).toHaveProperty('front', FRONT);
        expect(cardNode).toHaveProperty('back', BACK);
        expect(prisma.simpleCard({ id: cardNode.id })).resolves.toBeNull();
      }
    });
    test('it should not delete if deck\'s owner is not sub.id', async () => {
      expect(cardDelete(null, { id: OTHER_CARD.id }, {
        sub: ({
          id: USER.id,
        } as ICurrentUser),
      })).resolves.toBeNull();
    });
  });
});
