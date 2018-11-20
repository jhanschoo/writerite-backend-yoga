import { GraphQLResolveInfo } from 'graphql';
import { MergeInfo } from 'graphql-tools';
import { PubSub } from 'graphql-yoga';

import { roomQuery, roomMutation } from '../src/resolver/Room';
import { roomMessageMutation, roomMessageSubscription } from '../src/resolver/RoomMessage';
import { prisma, Room, User } from '../src/generated/prisma-client';
import { IWrContext } from '../src/types';

const pubsub = new PubSub();

const { room } = roomQuery;
const { roomCreate, roomAddOccupant } = roomMutation;
const { roomMessageCreate } = roomMessageMutation;
const { roomMessageUpdatesOfRoom } = roomMessageSubscription;

const EMAIL = 'abc@xyz';
const OTHER_EMAIL = 'def@xyz';
const NEW_EMAIL = 'ghi@xyz';
const NEW_CONTENT = 'baz';
const ROOM_NAME = 'r1';
const dummyInfo = {} as GraphQLResolveInfo & { mergeInfo: MergeInfo };

describe('Room resolvers', async () => {
  let USER: User;
  let OTHER_USER: User;
  let ROOM: Room;
  let OTHER_ROOM: Room;
  const commonBeforeEach = async () => {
    await prisma.deleteManySimpleUserRoomMessages({});
    await prisma.deleteManyRooms({});
    await prisma.deleteManyUsers({});
    USER = await prisma.createUser({ email: EMAIL });
    OTHER_USER = await prisma.createUser({ email: OTHER_EMAIL });
    ROOM = await prisma.createRoom({
      active: true,
      name: ROOM_NAME,
      owner: { connect: { id: USER.id } },
      occupants: {
        connect: { id: USER.id },
      },
    });
    OTHER_ROOM = await prisma.createRoom({ active: true, name: ROOM_NAME, owner: { connect: { id: OTHER_USER.id } } });
  };
  const commonAfterEach = async () => {
    await prisma.deleteManySimpleUserRoomMessages({});
    await prisma.deleteManyRooms({});
    await prisma.deleteManyUsers({});
  };

  beforeEach(async () => {
    await prisma.deleteManySimpleUserRoomMessages({});
    await prisma.deleteManyRooms({});
    await prisma.deleteManySimpleCards({});
    await prisma.deleteManyDecks({});
    await prisma.deleteManyUsers({});
  });

  describe('room', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const roomObj = await room(null, { id: '1234567' }, null, dummyInfo);
      expect(roomObj).toBeNull();
    });
    test('it should return room if it exists', async () => {
      expect.assertions(1);
      const roomObj = await room(null, { id: ROOM.id }, null, dummyInfo);
      if (roomObj) {
        expect(roomObj.id).toBe(ROOM.id);
      }
    });
  });

  describe('roomCreate', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub is not present', async () => {
      expect.assertions(1);
      const roomObj = await roomCreate(null, {}, {} as IWrContext, dummyInfo);
      expect(roomObj).toBeNull();
    });
    test('it creates a room once sub.id is present', async () => {
      expect.assertions(3);
      const roomObj = await roomCreate(null, {}, { sub: { id: USER.id } } as IWrContext, dummyInfo);
      expect(roomObj).toHaveProperty('id');
      expect(roomObj).toHaveProperty('name');
      if (roomObj) {
        const ownerId = await prisma.room({ id: roomObj.id }).owner().id();
        expect(ownerId).toBe(USER.id);
      }
    });
    test('it creates a room with given name', async () => {
      expect.assertions(3);
      const roomObj = await roomCreate(null, { name: ROOM_NAME }, { sub: { id: USER.id } } as IWrContext, dummyInfo);
      expect(roomObj).toHaveProperty('id');
      expect(roomObj).toHaveProperty('name', ROOM_NAME);
      if (roomObj) {
        const ownerId = await prisma.room({ id: roomObj.id }).owner().id();
        expect(ownerId).toBe(USER.id);
      }
    });
  });

  describe('roomAddOccupant', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null on neither room nor occupant present', async () => {
      expect.assertions(1);
      const roomObj = await roomAddOccupant(null, { id: '1234567', occupantId: '1234567' }, null, dummyInfo);
      expect(roomObj).toBeNull();
    });
    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const roomObj = await roomAddOccupant(null, { id: '1234567', occupantId: USER.id }, null, dummyInfo);
      expect(roomObj).toBeNull();
    });
    test('it should return null on no occupant present', async () => {
      expect.assertions(1);
      const roomObj = await roomAddOccupant(null, { id: ROOM.id, occupantId: '1234567' }, null, dummyInfo);
      expect(roomObj).toBeNull();
    });
    test('it makes no noticeable change when occupant is already in room', async () => {
      expect.assertions(3);
      const priorOccupants = await prisma.room({ id: ROOM.id }).occupants();
      expect(priorOccupants).toContainEqual(expect.objectContaining({ id: USER.id }));
      const roomObj = await roomAddOccupant(null, { id: ROOM.id, occupantId: USER.id }, null, dummyInfo);
      expect(roomObj).toBeTruthy();
      if (roomObj) {
        const actualOccupants = (await prisma.room({ id: roomObj.id }).occupants())
          .map((user) => user.id).sort();
        expect(actualOccupants).toEqual(priorOccupants.map((user) => user.id).sort());
      }
    });
    test('it adds occupant when occupant is not already in room', async () => {
      expect.assertions(3);
      const priorOccupants = await prisma.room({ id: ROOM.id }).occupants();
      expect(priorOccupants).not.toContainEqual(expect.objectContaining({ id: OTHER_USER.id }));
      const roomObj = await roomAddOccupant(null, { id: ROOM.id, occupantId: OTHER_USER.id }, null, dummyInfo);
      expect(roomObj).toBeTruthy();
      if (roomObj) {
        const actualIds = (await prisma.room({ id: roomObj.id }).occupants())
          .map((user) => user.id).sort();
        const expectedIds = (priorOccupants.map((user) => user.id).concat([OTHER_USER.id])).sort();
        expect(actualIds).toEqual(expectedIds);
      }
    });
  });

  describe('roomMessageCreate', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub is not present', async () => {
      expect.assertions(2);
      const roomMessageObj1 = await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub } as IWrContext,
        dummyInfo,
      );
      expect(roomMessageObj1).toBeNull();
      const roomMessageObj2 = await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub } as IWrContext,
        dummyInfo,
      );
      expect(roomMessageObj2).toBeNull();
    });
    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const roomMessageObj = await roomMessageCreate(
        null,
        { roomId: '1234567', messageContent: NEW_CONTENT },
        { pubsub, sub: { id: USER.id } } as IWrContext,
        dummyInfo,
      );
      expect(roomMessageObj).toBeNull();
    });
    test('it should return null if sub.id is not an occupant', async () => {
      expect.assertions(1);
      const roomMessageObj = await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub, sub: { id: OTHER_USER.id } } as IWrContext,
        dummyInfo,
      );
      expect(roomMessageObj).toBeNull();
    });
    test('it should add message null if sub.id is an occupant', async () => {
      expect.assertions(3);
      const roomMessageObj = await roomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { pubsub, sub: { id: USER.id } } as IWrContext,
        dummyInfo,
      );
      expect(roomMessageObj).toBeTruthy();
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
      const subscr = await roomMessageUpdatesOfRoom.subscribe(
        null, { id: '1234567' }, { pubsub } as IWrContext, dummyInfo,
      );
      expect(subscr).toBeNull();
    });
    test('it should return an AsyncIterator on room present', async () => {
      expect.assertions(1);
      const subscr = await roomMessageUpdatesOfRoom.subscribe(
        null, { id: ROOM.id }, { pubsub } as IWrContext, dummyInfo,
      );
      expect(subscr).toHaveProperty('next');
    });
    test('subscription on room present is done if no new messages', async () => {
      expect.assertions(1);
      const subscr = await roomMessageUpdatesOfRoom.subscribe(
        null, { id: ROOM.id }, { pubsub } as IWrContext, dummyInfo,
      );
      expect(subscr).toBeTruthy();
      if (subscr) {
        subscr.next().then(() => {
          throw new Error();
        });
      }
      return await new Promise((res) => setTimeout(res, 500));
    });
    test(
      `subscription on room reproduces message posted in room using
      roomMessageCreate since subscription`,
      async () => {
        expect.assertions(5);
        const subscr = await roomMessageUpdatesOfRoom.subscribe(
          null, { id: ROOM.id }, { pubsub } as IWrContext, dummyInfo,
        );
        const roomMessageObj = await roomMessageCreate(
          null,
          { roomId: ROOM.id, messageContent: NEW_CONTENT },
          { pubsub, sub: { id: USER.id } } as IWrContext,
          dummyInfo,
        );
        expect(roomMessageObj).toBeTruthy();
        if (roomMessageObj) {
          expect(subscr).toBeTruthy();
          if (subscr) {
            const newMessage = await subscr.next();
            if (newMessage.value && newMessage.value.roomMessageUpdatesOfRoom) {
              const payload: any = newMessage.value.roomMessageUpdatesOfRoom;
              expect(payload.mutation).toBe('CREATED');
              expect(payload.new).toEqual(roomMessageObj);
            }
            expect(newMessage.done).toBe(false);
          }
        }
      });
    test(
      `subscription on room does not reproduce message posted in
      room using roomMessageCreate before subscription`,
      async () => {
        expect.assertions(1);
        await roomMessageCreate(
          null,
          { roomId: ROOM.id, messageContent: NEW_CONTENT },
          { pubsub, sub: { id: USER.id } } as IWrContext,
          dummyInfo,
        );
        const subscr = await roomMessageUpdatesOfRoom.subscribe(
          null,{ id: ROOM.id }, { pubsub } as IWrContext, dummyInfo,
        );
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
