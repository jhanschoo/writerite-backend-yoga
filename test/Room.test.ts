import { PubSub } from 'graphql-yoga';
import { roomQuery, roomMutation, roomSubscription } from '../src/resolver/Room';
import { prisma, RoomNode, UserNode } from '../src/generated/prisma-client';
import { ICurrentUser, Roles } from '../src/interface/ICurrentUser';

const pubsub = new PubSub();

const { room } = roomQuery;
const { roomCreate, roomAddOccupant, roomMessageCreate } = roomMutation;
const { roomMessageUpdatesOfRoom } = roomSubscription;

const EMAIL = 'abc@xyz';
const OTHER_EMAIL = 'def@xyz';
const NEW_EMAIL = 'ghi@xyz';
const NEW_CONTENT = 'baz';

describe('Room resolvers', async () => {
  let USER: UserNode;
  let OTHER_USER: UserNode;
  let ROOM: RoomNode;
  let OTHER_ROOM: RoomNode;
  const commonBeforeEach = async () => {
    await prisma.deleteManySimpleUserRoomMessages({});
    await prisma.deleteManyRooms({});
    await prisma.deleteManyUsers({});
    USER = await prisma.createUser({ email: EMAIL });
    OTHER_USER = await prisma.createUser({ email: OTHER_EMAIL });
    ROOM = await prisma.createRoom({
      active: true,
      owner: { connect: { id: USER.id } },
      occupants: {
        connect: { id: USER.id },
      },
    });
    OTHER_ROOM = await prisma.createRoom({ active: true, owner: { connect: { id: OTHER_USER.id } } });
  };
  const commonAfterEach = async () => {
    await prisma.deleteManySimpleUserRoomMessages({});
    await prisma.deleteManyRooms({});
    await prisma.deleteManyUsers({});
  };

  describe('room', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const roomNode = await room(null, { id: '1234567' });
      expect(roomNode).toBeNull();
    });

    test('it should return room if it exists', async () => {
      expect.assertions(1);
      const roomNode = await room(null, { id: ROOM.id });
      expect(roomNode.id).toBe(ROOM.id);
    });
  });

  describe('roomCreate', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return null if sub.id is not present', async () => {
      expect.assertions(2);
      const roomNode1 = await roomCreate(null, null, null)
      expect(roomNode1).toBeNull();
      const roomNode2 = await roomCreate(null, null, { sub: {} })
      expect(roomNode2).toBeNull();
    });

    test('it creates a room once sub.id is present', async () => {
      expect.assertions(2);
      const roomNode = await roomCreate(null, null, { sub: { id: USER.id } });
      expect(roomNode).toHaveProperty('id');
      // work around typescript thinking deckNode may be null
      if (roomNode) {
        const ownerId = await prisma.room({ id: roomNode.id }).owner().id();
        expect(ownerId).toBe(USER.id);
      }
    });
  });

  describe('roomAddOccupant', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null on neither room nor occupant present', async () => {
      expect.assertions(1);
      const roomNode = await roomAddOccupant(null, { id: '1234567', occupantId: '1234567' });
      expect(roomNode).toBeNull();
    });

    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const roomNode = await roomAddOccupant(null, { id: '1234567', occupantId: USER.id });
      expect(roomNode).toBeNull();
    });

    test('it should return null on no occupant present', async () => {
      expect.assertions(1);
      const roomNode = await roomAddOccupant(null, { id: ROOM.id, occupantId: '1234567' });
      expect(roomNode).toBeNull();
    });

    test('it makes no noticeable change when occupant is already in room', async () => {
      expect.assertions(3);
      const priorOccupants = await prisma.room({ id: ROOM.id }).occupants();
      expect(priorOccupants).toContainEqual(expect.objectContaining({ id: USER.id }));
      const roomNode = await roomAddOccupant(null, { id: ROOM.id, occupantId: USER.id });
      expect(roomNode).toBeTruthy();
      if (roomNode) {
        const actualOccupants = (await prisma.room({ id: roomNode.id }).occupants())
          .map((user) => user.id).sort();
        expect(actualOccupants).toEqual(priorOccupants.map((user) => user.id).sort());
      }
    });

    test('it adds occupant when occupant is not already in room', async () => {
      expect.assertions(3);
      const priorOccupants = await prisma.room({ id: ROOM.id }).occupants();
      expect(priorOccupants).not.toContainEqual(expect.objectContaining({ id: OTHER_USER.id }));
      const roomNode = await roomAddOccupant(null, { id: ROOM.id, occupantId: OTHER_USER.id });
      expect(roomNode).toBeTruthy();
      if (roomNode) {
        const actualIds = (await prisma.room({ id: roomNode.id }).occupants())
          .map((user) => user.id).sort();
        const expectedIds = (priorOccupants.map((user) => user.id).concat([ OTHER_USER.id ])).sort();
        expect(actualIds).toEqual(expectedIds);
      }
    });
  });

  describe('roomMessageCreate', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub.id is not present', async () => {
      expect.assertions(2);
      const roomMessageNode1 = await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub },
      );
      expect(roomMessageNode1).toBeNull();
      const roomMessageNode2 = await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub, sub: {} },
      );
      expect(roomMessageNode2).toBeNull();
    });
    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const roomMessageNode = await roomMessageCreate(
        null,
        { roomId: '1234567', messageContent: NEW_CONTENT },
        { pubsub, sub: { id: USER.id } },
      );
      expect(roomMessageNode).toBeNull();
    });
    test('it should return null if sub.id is not an occupant', async () => {
      expect.assertions(1);
      const roomMessageNode = await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub, sub: { id: OTHER_USER.id } },
      );
      expect(roomMessageNode).toBeNull();
    });
    test('it should add message null if sub.id is an occupant', async () => {
      expect.assertions(3);
      const roomMessageNode = await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub, sub: { id: USER.id } },
      );
      expect(roomMessageNode).toBeTruthy();
      const roomNode = await prisma.room({ id: ROOM.id });
      expect(roomNode).toBeTruthy();
      if (roomNode) {
        const roomMessages = await prisma.room({ id: roomNode.id }).messages();
        expect(roomMessages).toContainEqual(
          expect.objectContaining({ content: NEW_CONTENT }),
        );
      }
    });
  });

  describe('roomMessageUpdatesOfRoom', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);
    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const subscr = await roomMessageUpdatesOfRoom.subscribe(null, { id: '1234567' }, { pubsub });
      expect(subscr).toBeNull();
    });
    test('it should return an AsyncIterator on room present', async () => {
      expect.assertions(1);
      const subscr = await roomMessageUpdatesOfRoom.subscribe(null, { id: ROOM.id }, { pubsub });
      expect(subscr).toHaveProperty('next');
    });
    test('subscription on room present is done if no new messages', async () => {
      expect.assertions(1);
      const subscr = await roomMessageUpdatesOfRoom.subscribe(null, { id: ROOM.id }, { pubsub });
      expect(subscr).toBeTruthy();
      if (subscr) {
        subscr.next().then(() => {
            throw new Error();
        });
      }
      return await new Promise((res) => setTimeout(res, 500));
    });
    test('subscription on room reproduces message posted in room using roomAddMessage since subscription', async () => {
      expect.assertions(5);
      const subscr = await roomMessageUpdatesOfRoom.subscribe(null, { id: ROOM.id }, { pubsub });
      const roomMessageNode = await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub, sub: { id: USER.id } },
      );
      expect(roomMessageNode).toBeTruthy();
      if (roomMessageNode) {
        expect(subscr).toBeTruthy();
        if (subscr) {
          const newMessage = await subscr.next();
          const value: any = newMessage.value;
          expect(newMessage.done).toBe(false);
          expect(value.mutation).toBe('CREATED');
          expect(value.new).toEqual(roomMessageNode);
        }
      }
    });
    test(`subscription on room does not reproduce message posted in
    room using roomAddMessage before subscription`, async () => {
      expect.assertions(1);
      await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub, sub: { id: USER.id } },
      );
      const subscr = await roomMessageUpdatesOfRoom.subscribe(null, { id: ROOM.id }, { pubsub });
      expect(subscr).toBeTruthy();
      if (subscr) {
        const nextResult = subscr.next();
        nextResult.then(() => {
          throw new Error();
        });
      }
      return await new Promise((res) => setTimeout(res, 500));
    });
  });
});
