import { GraphQLResolveInfo } from 'graphql';
import { MergeInfo } from 'graphql-tools';
import { PubSub } from 'graphql-yoga';

import { prisma, Room, User } from '../generated/prisma-client';
import { IWrContext } from '../src/types';

import { rwRoomQuery } from '../src/resolver/Query/RwRoom';
import { rwRoomMutation } from '../src/resolver/Mutation/RwRoom';
import { rwRoomMessageMutation } from '../src/resolver/Mutation/RwRoomMessage';
import { rwRoomMessageSubscription } from '../src/resolver/Subscription/RwRoomMessage';

const pubsub = new PubSub();
const baseCtx = { prisma, pubsub } as IWrContext;
const baseInfo = {} as GraphQLResolveInfo & { mergeInfo: MergeInfo };

const { rwRoom } = rwRoomQuery;
const { rwRoomCreate, rwRoomAddOccupant } = rwRoomMutation;
const { rwRoomMessageCreate } = rwRoomMessageMutation;
const { rwRoomMessageUpdatesOfRoom } = rwRoomMessageSubscription;

const EMAIL = 'abc@xyz';
const OTHER_EMAIL = 'def@xyz';
const NEW_EMAIL = 'ghi@xyz';
const NEW_CONTENT = 'baz';
const ROOM_NAME = 'r1';

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
    OTHER_ROOM = await prisma.createRoom({
      active: true, name: ROOM_NAME, owner: {
        connect: { id: OTHER_USER.id },
      },
    });
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
      const roomObj = await rwRoom(null, { id: '1234567' }, baseCtx, baseInfo);
      expect(roomObj).toBeNull();
    });
    test('it should return room if it exists', async () => {
      expect.assertions(1);
      const roomObj = await rwRoom(null, { id: ROOM.id }, baseCtx, baseInfo);
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
      const roomObj = await rwRoomCreate(null, {}, baseCtx, baseInfo);
      expect(roomObj).toBeNull();
    });
    test('it creates a room once sub.id is present', async () => {
      expect.assertions(3);
      const roomObj = await rwRoomCreate(null, {}, {
        ...baseCtx, sub: { id: USER.id },
      } as IWrContext, baseInfo);
      expect(roomObj).toHaveProperty('id');
      expect(roomObj).toHaveProperty('name');
      if (roomObj) {
        const ownerId = await prisma.room({ id: roomObj.id }).owner().id();
        expect(ownerId).toBe(USER.id);
      }
    });
    test('it creates a room with given name', async () => {
      expect.assertions(3);
      const roomObj = await rwRoomCreate(null, { name: ROOM_NAME }, {
        ...baseCtx, sub: { id: USER.id },
      } as IWrContext, baseInfo);
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
      const roomObj = await rwRoomAddOccupant(
        null, { id: '1234567', occupantId: '1234567' }, baseCtx, baseInfo,
      );
      expect(roomObj).toBeNull();
    });
    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const roomObj = await rwRoomAddOccupant(
        null, { id: '1234567', occupantId: USER.id }, baseCtx, baseInfo,
      );
      expect(roomObj).toBeNull();
    });
    test('it should return null on no occupant present', async () => {
      expect.assertions(1);
      const roomObj = await rwRoomAddOccupant(
        null, { id: ROOM.id, occupantId: '1234567' }, baseCtx, baseInfo,
      );
      expect(roomObj).toBeNull();
    });
    test('it makes no noticeable change when occupant is already in room', async () => {
      expect.assertions(3);
      const priorOccupants = await prisma.room({ id: ROOM.id }).occupants();
      expect(priorOccupants).toContainEqual(expect.objectContaining({ id: USER.id }));
      const roomObj = await rwRoomAddOccupant(
        null, { id: ROOM.id, occupantId: USER.id }, baseCtx, baseInfo,
      );
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
      expect(priorOccupants).not.toContainEqual(
        expect.objectContaining({ id: OTHER_USER.id }),
      );
      const roomObj = await rwRoomAddOccupant(
        null, { id: ROOM.id, occupantId: OTHER_USER.id }, baseCtx, baseInfo,
      );
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
      const roomMessageObj1 = await rwRoomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        baseCtx,
        baseInfo,
      );
      expect(roomMessageObj1).toBeNull();
      const roomMessageObj2 = await rwRoomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        baseCtx,
        baseInfo,
      );
      expect(roomMessageObj2).toBeNull();
    });
    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const roomMessageObj = await rwRoomMessageCreate(
        null,
        { roomId: '1234567', messageContent: NEW_CONTENT },
        { ...baseCtx, sub: { id: USER.id } } as IWrContext,
        baseInfo,
      );
      expect(roomMessageObj).toBeNull();
    });
    test('it should return null if sub.id is not an occupant', async () => {
      expect.assertions(1);
      const roomMessageObj = await rwRoomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { ...baseCtx, sub: { id: OTHER_USER.id } } as IWrContext,
        baseInfo,
      );
      expect(roomMessageObj).toBeNull();
    });
    test('it should add message null if sub.id is an occupant', async () => {
      expect.assertions(3);
      const roomMessageObj = await rwRoomMessageCreate(
        null,
        { roomId: ROOM.id, messageContent: NEW_CONTENT },
        { ...baseCtx, sub: { id: USER.id } } as IWrContext,
        baseInfo,
      );
      expect(roomMessageObj).toBeTruthy();
      const pRoom = await prisma.room({ id: ROOM.id });
      expect(pRoom).toBeTruthy();
      if (!pRoom) {
        return null;
      }
      const roomMessages = await prisma.room({ id: pRoom.id }).messages();
      expect(roomMessages).toContainEqual(
        expect.objectContaining({ content: NEW_CONTENT }),
      );
    });
  });

  describe('roomMessageUpdatesOfRoom', () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null on no room present', async () => {
      expect.assertions(1);
      const subscr = await rwRoomMessageUpdatesOfRoom.subscribe(
        null, { roomId: '1234567' }, baseCtx, baseInfo,
      );
      expect(subscr).toBeNull();
    });
    test('it should return an AsyncIterator on room present', async () => {
      expect.assertions(1);
      const subscr = await rwRoomMessageUpdatesOfRoom.subscribe(
        null, { roomId: ROOM.id }, baseCtx, baseInfo,
      );
      expect(subscr).toHaveProperty('next');
    });
    test('subscription on room present is done if no new messages', async () => {
      expect.assertions(1);
      const subscr = await rwRoomMessageUpdatesOfRoom.subscribe(
        null, { roomId: ROOM.id }, baseCtx, baseInfo,
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
        const subscr = await rwRoomMessageUpdatesOfRoom.subscribe(
          null, { roomId: ROOM.id }, baseCtx, baseInfo,
        );
        const roomMessageObj = await rwRoomMessageCreate(
          null,
          { roomId: ROOM.id, messageContent: NEW_CONTENT },
          { ...baseCtx, sub: { id: USER.id } } as IWrContext,
          baseInfo,
        );
        expect(roomMessageObj).toBeTruthy();
        if (roomMessageObj) {
          expect(subscr).toBeTruthy();
          if (!subscr) {
            throw new Error('`subscr` not obtained');
          }
          const newMessage = await subscr.next();
          if (newMessage.value && newMessage.value.rwRoomMessageUpdatesOfRoom) {
            const payload: any = newMessage.value.rwRoomMessageUpdatesOfRoom;
            expect(payload.mutation).toBe('CREATED');
            expect(payload.new).toEqual(roomMessageObj);
          } else {
            expect(newMessage.value).toBeTruthy();
            expect(newMessage.value.rwRoomMessageUpdatesOfRoom).toBeTruthy();
          }
          expect(newMessage.done).toBe(false);
        }
      });
    test(
      `subscription on room does not reproduce message posted in
      room using roomMessageCreate before subscription`,
      async () => {
        expect.assertions(1);
        await rwRoomMessageCreate(
          null,
          { roomId: ROOM.id, messageContent: NEW_CONTENT },
          { ...baseCtx, sub: { id: USER.id } } as IWrContext,
          baseInfo,
        );
        const subscr = await rwRoomMessageUpdatesOfRoom.subscribe(
          null, { roomId: ROOM.id }, baseCtx, baseInfo,
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
