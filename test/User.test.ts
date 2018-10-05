import { userQuery } from '../src/resolver/User';
import { prisma } from '../src/generated/prisma-client';

import { ICurrentUser, Roles } from '../src/interface/ICurrentUser';

const { user, users } = userQuery;

const email = 'abc@xyz';

describe('User resolvers', () => {
  describe('user', () => {
    beforeEach(async () => {
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyUsers({});
    });

    test('it should return null on no user present', () => {
      expect(user(null, { id: '1234567' })).resolves.toBeNull();
    });

    test('it should return user if it exists', async () => {
      const userNode = await prisma.createUser({ email });
      const retrievedUser = await user(null, { id: userNode.id });
      expect(retrievedUser.id).toBe(userNode.id);
    });
  });

  describe('users', () => {
    beforeEach(async () => {
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyUsers({});
    });

    test('it should return null if sub.roles is not present', () => {
      expect(users(null, null, null)).resolves.toBeNull();
      expect(users(null, null, { sub: ({} as ICurrentUser) })).resolves.toBeNull();
    });

    test('it should return null if not authorized as admin', () => {
      expect(users(null, null, {
        sub: ({
          roles: ['user'],
        } as ICurrentUser),
      })).resolves.toBeNull();
    });

    test('it should return users if they exist', async () => {
      const userNode = await prisma.createUser({ email });
      const retrievedUsers = await users(null, null, {
        sub: ({
          roles: ['user', 'admin'],
        } as ICurrentUser),
      });
      expect(retrievedUsers).toContainEqual(expect.objectContaining({
        id: userNode.id,
      }));
    });
  });
});
