import { cardQuery, cardMutation } from '../src/resolver/Card';
import { prisma, DeckNode, UserNode, SimpleCardNode } from '../src/generated/prisma-client';
import { IWrContext } from '../src/types';
import { resolveField } from '../src/util'

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

  beforeEach(async () => {
    await prisma.deleteManySimpleUserRoomMessages({});
    await prisma.deleteManyRooms({});
    await prisma.deleteManySimpleCards({});
    await prisma.deleteManyDecks({});
    await prisma.deleteManyUsers({});
  });

  describe('card', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return cards having specified id if deck exists', async () => {
      expect.assertions(2);
      const cardObj = await card(null, { id: CARD.id });
      expect(cardObj).toHaveProperty('front', FRONT);
      expect(cardObj).toHaveProperty('back', BACK);
    });
    test('it should return null if no card with said id exists', async () => {
      expect.assertions(1);
      const cardObjs = await card(null, { id: '1234567' });
      expect(cardObjs).toBeNull();
    });
  });

  describe('cardsFromDeck', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return cards from deck containing specified id if deck exists', async () => {
      expect.assertions(1);
      const cardObjs = await cardsFromDeck(null, { id: DECK.id });
      expect(cardObjs).toContainEqual(
        expect.objectContaining({ front: FRONT, back: BACK }),
       );
    });
    test('it should return null if no deck with said id exists', async () => {
      expect.assertions(1);
      const cardNodes = await cardsFromDeck(null, { id: '1234567' });
      expect(cardNodes).toBeNull();
    });
  });

  describe('cardSave', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub is not present', async () => {
      expect.assertions(1);
      expect(cardSave(null, { front: NEW_FRONT, back: NEW_BACK, deckId: DECK.id }, {
      } as IWrContext)).resolves.toBeNull();
    });
    test('it should save card if id not supplied and deck\'s owner is sub.id', async () => {
      expect.assertions(7);
      const cardObj = await cardSave(null, { front: NEW_FRONT, back: NEW_BACK, deckId: DECK.id }, {
        sub: {
          id: USER.id,
        },
      } as IWrContext);
      expect(cardObj).toBeTruthy();
      if (cardObj) {
        expect(cardObj).toHaveProperty('id');
        expect(cardObj).toHaveProperty('front', NEW_FRONT);
        expect(cardObj).toHaveProperty('back', NEW_BACK);
        const savedCard = await prisma.simpleCard({ id: await resolveField(cardObj.id) });
        expect(savedCard).toHaveProperty('id');
        expect(savedCard).toHaveProperty('front', NEW_FRONT);
        expect(savedCard).toHaveProperty('back', NEW_BACK);
      }
    });
    test('it should return null if id not supplied and deck\'s owner is not sub.id', async () => {
      expect.assertions(2);
      expect(cardSave(null, { front: NEW_FRONT, back: NEW_BACK, deckId: OTHER_DECK.id }, {
        sub: {
          id: USER.id,
        },
      } as IWrContext)).resolves.toBeNull();
      const otherCards = await prisma.simpleCards({ where: {
        deck: { id: OTHER_DECK.id },
      }});
      expect(otherCards).not.toContainEqual(
        expect.objectContaining({ front: NEW_FRONT, back: NEW_BACK }));
    });
    test('it should update if id is supplied and deck\'s owner is sub.id', async () => {
      expect.assertions(6);
      const cardObj = await cardSave(null, { id: CARD.id, front: NEW_FRONT, back: NEW_BACK, deckId: DECK.id }, {
        sub: {
          id: USER.id,
        },
      } as IWrContext);
      expect(cardObj).toHaveProperty('id', CARD.id);
      expect(cardObj).toHaveProperty('front', NEW_FRONT);
      expect(cardObj).toHaveProperty('back', NEW_BACK);
      const savedCard = await prisma.simpleCard({ id: CARD.id });
      expect(savedCard).toHaveProperty('id', CARD.id);
      expect(savedCard).toHaveProperty('front', NEW_FRONT);
      expect(savedCard).toHaveProperty('back', NEW_BACK);
    });
    test('it should return null if id is supplied but deck is not correct', async () => {
      expect.assertions(4);
      expect(cardSave(null, { id: CARD.id, front: NEW_FRONT, back: NEW_BACK, deckId: NEXT_DECK.id }, {
        sub: {
          id: USER.id,
        },
      } as IWrContext)).resolves.toBeNull();
      const cardObj = await prisma.simpleCard({ id: CARD.id });
      expect(cardObj).toHaveProperty('id', CARD.id);
      expect(cardObj).toHaveProperty('front', FRONT);
      expect(cardObj).toHaveProperty('back', BACK);
    });
    test('it should return null if deck\'s owner is not sub.id', async () => {
      expect.assertions(4);
      expect(cardSave(null, { id: OTHER_CARD.id, front: NEW_FRONT, back: NEW_BACK, deckId: OTHER_DECK.id }, {
        sub: {
          id: USER.id,
        },
      } as IWrContext)).resolves.toBeNull();
      const cardObj = await prisma.simpleCard({ id: OTHER_CARD.id });
      expect(cardObj).toHaveProperty('id', OTHER_CARD.id);
      expect(cardObj).toHaveProperty('front', OTHER_FRONT);
      expect(cardObj).toHaveProperty('back', OTHER_BACK);
    });
  });

  describe('cardDelete', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub is not present', async () => {
      expect.assertions(1);
      expect(cardDelete(null, { id: CARD.id }, {} as IWrContext)).resolves.toBeNull();
    });
    test('it should delete if deck\'s owner is sub.id', async () => {
      expect.assertions(5);
      const cardObj = await cardDelete(null, { id: CARD.id }, {
        sub: {
          id: USER.id,
        },
      } as IWrContext);
      expect(cardObj).toBeTruthy();
      if (cardObj) {
        expect(cardObj).toHaveProperty('id', CARD.id);
        expect(cardObj).toHaveProperty('front', FRONT);
        expect(cardObj).toHaveProperty('back', BACK);
        expect(prisma.simpleCard({ id: await resolveField(cardObj.id) })).resolves.toBeNull();
      }
    });
    test('it should not delete if deck\'s owner is not sub.id', async () => {
      expect.assertions(1);
      expect(cardDelete(null, { id: OTHER_CARD.id }, {
        sub: {
          id: USER.id,
        },
      } as IWrContext)).resolves.toBeNull();
    });
  });
});
