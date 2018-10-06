import { userQuery } from '../src/resolver/User';
import { prisma, UserNode } from '../src/generated/prisma-client';

import { ICurrentUser, Roles } from '../src/interface/ICurrentUser';

const { user, users } = userQuery;

const EMAIL = 'abc@xyz';
const OTHER_EMAIL = 'def@xyz';
const NEW_EMAIL = 'ghi@xyz';

describe('User resolvers', async () => {
  let USER: UserNode;
  let OTHER_USER: UserNode;
  const commonBeforeEach = async () => {
    await prisma.deleteManyUsers({});
    USER = await prisma.createUser({ email: EMAIL });
    OTHER_USER = await prisma.createUser({ email: OTHER_EMAIL });
  };
  const commonAfterEach = async () => {
    await prisma.deleteManyUsers({});
  };
  describe('user', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null on no user present', async () => {
      expect.assertions(1);
      const userNode = await user(null, { id: '1234567' });
      expect(userNode).toBeNull();
    });

    test('it should return user if it exists', async () => {
      expect.assertions(1);
      const retrievedUser = await user(null, { id: USER.id });
      expect(retrievedUser.id).toBe(USER.id);
    });
  });

  describe('users', async () => {
    beforeEach(commonBeforeEach);
    afterEach(commonAfterEach);

    test('it should return null if sub.roles is not present', async () => {
      expect.assertions(2);
      const userNode1 = await users(null, null, null);
      expect(userNode1).toBeNull();
      const userNode2 = await users(null, null, { sub: ({} as ICurrentUser) });
      expect(userNode2).toBeNull();
    });

    test('it should return null if not authorized as admin', async () => {
      expect.assertions(1);
      const userNode = await users(null, null, {
        sub: ({
          roles: ['user'],
        } as ICurrentUser),
      });
      expect(userNode).toBeNull();
    });

    test('it should return users if they exist', async () => {
      expect.assertions(1);
      const userNodes = await users(null, null, {
        sub: ({
          id: USER.id,
          roles: ['user', 'admin'],
        } as ICurrentUser),
      });
      expect(userNodes).toContainEqual(expect.objectContaining({
        id: USER.id,
      }));
    });
  });
});
