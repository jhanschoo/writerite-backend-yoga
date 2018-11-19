import { GraphQLResolveInfo } from 'graphql';
import { MergeInfo } from 'graphql-tools';

import { userQuery } from '../src/resolver/User';
import { prisma, User } from '../src/generated/prisma-client';

import { ICurrentUser, Roles, IWrContext } from '../src/types';

const { user, users } = userQuery;

const EMAIL = 'abc@xyz';
const OTHER_EMAIL = 'def@xyz';
const NEW_EMAIL = 'ghi@xyz';
const dummyInfo = {} as GraphQLResolveInfo & { mergeInfo: MergeInfo };

describe('User resolvers', async () => {
  let USER: User;
  let OTHER_USER: User;
  const commonBeforeEach = async () => {
    await prisma.deleteManyUsers({});
    USER = await prisma.createUser({ email: EMAIL });
    OTHER_USER = await prisma.createUser({ email: OTHER_EMAIL });
  };
  const commonAfterEach = async () => {
    await prisma.deleteManyUsers({});
  };

  beforeEach(async () => {
    await prisma.deleteManySimpleUserRoomMessages({});
    await prisma.deleteManyRooms({});
    await prisma.deleteManySimpleCards({});
    await prisma.deleteManyDecks({});
    await prisma.deleteManyUsers({});
  });

  describe('user', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null on no user present', async () => {
      expect.assertions(1);
      const userNode = await user(null, { id: '1234567' }, null, dummyInfo);
      expect(userNode).toBeNull();
    });
    test('it should return user if it exists', async () => {
      expect.assertions(1);
      const retrievedUser = await user(null, { id: USER.id }, null, dummyInfo);
      if (retrievedUser) {
        expect(retrievedUser.id).toBe(USER.id);
      }
    });
  });

  describe('users', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub is not present', async () => {
      expect.assertions(1);
      const userObj1 = await users(null, null, {} as IWrContext, dummyInfo);
      expect(userObj1).toBeNull();
    });
    test('it should return null if not authorized as admin', async () => {
      expect.assertions(1);
      const userObj = await users(null, null, {
        sub: {
          roles: [Roles.user],
        },
      } as IWrContext, dummyInfo);
      expect(userObj).toBeNull();
    });

    test('it should return users if they exist', async () => {
      expect.assertions(1);
      const userObjs = await users(null, null, {
        sub: {
          id: USER.id,
          roles: [Roles.user, Roles.admin],
        },
      } as IWrContext, dummyInfo);
      expect(userObjs).toContainEqual(expect.objectContaining({
        id: USER.id,
      }));
    });
  });
});
