import { GoogleAuthService } from '../src/service/GoogleAuthService';
import { FacebookAuthService } from '../src/service/FacebookAuthService';
import { LocalAuthService } from '../src/service/LocalAuthService';
import { prisma } from '../src/generated/prisma-client';
import { hashPassword } from '../src/util';

const EMAIL_GOOGLE = 'abc.google@xyz';
const EMAIL_FACEBOOK = 'abc.facebook@xyz';
const EMAIL_LOCAL = 'abc.local@xyz';
const BAD_TOKEN = 'badToken';
const GOOD_TOKEN = 'goodToken';
const BAD_GOOGLE_ID = 'badGoogleId';
const GOOD_GOOGLE_ID = 'goodGoogleId';
const BAD_FACEBOOK_ID = 'badFacebookId';
const GOOD_FACEBOOK_ID = 'goodFacebookId';
const BAD_PASSWORD = 'badPassword';
const GOOD_PASSWORD = 'goodPassword';

// tslint:disable-next-line max-classes-per-file
class GoogleAuthServiceTrueVerify extends GoogleAuthService {
  protected async verify(idToken: string) {
    return new Promise<string | undefined>((res, rej) => {
      if (idToken === GOOD_TOKEN) {
        res(GOOD_GOOGLE_ID);
      } else {
        res(undefined);
      }
    });
  }
}

// tslint:disable-next-line max-classes-per-file
class FacebookAuthServiceTrueVerify extends FacebookAuthService {
  protected async verify(idToken: string) {
    return new Promise<string | undefined>((res, rej) => {
      if (idToken === GOOD_TOKEN) {
        res(GOOD_FACEBOOK_ID);
      } else {
        res(undefined);
      }
    });
  }
}

// tslint:disable-next-line max-classes-per-file
class LocalAuthServiceTrueVerify extends LocalAuthService {
  protected async verify(idToken: string) {
    return new Promise<string | undefined>((res, rej) => {
      if (idToken === GOOD_TOKEN) {
        res('true');
      } else {
        res('false');
      }
    });
  }
}

describe('AuthService', async () => {
  beforeEach(async () => {
    await prisma.deleteManySimpleUserRoomMessages({});
    await prisma.deleteManyRooms({});
    await prisma.deleteManySimpleCards({});
    await prisma.deleteManyDecks({});
    await prisma.deleteManyUsers({});
  });

  describe('googleAuth', async () => {
    beforeEach(async () => {
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyUsers({});
    });

    test('returns null if verify fails', async () => {
      expect.assertions(1);
      const googleAuth = new GoogleAuthService();
      expect(await googleAuth.signin({
        prisma,
        email: EMAIL_GOOGLE,
        token: BAD_TOKEN,
        identifier: BAD_GOOGLE_ID,
      })).toBeNull();
    });
    test('returns null if verify returns different googleId', async () => {
      expect.assertions(3);
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_GOOGLE })).toBe(false);
      expect(await googleAuth.signin({
        prisma,
        email: EMAIL_GOOGLE,
        token: GOOD_TOKEN,
        identifier:
        BAD_GOOGLE_ID,
      })).toBeNull();
      expect(await prisma.$exists.user({ email: EMAIL_GOOGLE })).toBe(false);
    });
    test('creates user if verify returns same googleId and no user currently exists', async () => {
      expect.assertions(4);
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_GOOGLE }))
        .toBe(false);
      const signinP = await googleAuth.signin({
        prisma,
        email: EMAIL_GOOGLE,
        token: GOOD_TOKEN,
        identifier: GOOD_GOOGLE_ID,
      });
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(await prisma.$exists.user({
        email: EMAIL_GOOGLE, googleId: GOOD_GOOGLE_ID,
      })).toBe(true);
    });
    test('fetch user if user with correct email and googleId exists', async () => {
      expect.assertions(4);
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_GOOGLE })).toBe(false);
      const user = await prisma.createUser({ email: EMAIL_GOOGLE, googleId: GOOD_GOOGLE_ID });
      expect(await prisma.$exists.user({ email: EMAIL_GOOGLE, googleId: GOOD_GOOGLE_ID })).toBe(true);
      const signinP = await googleAuth.signin({
        prisma,
        email: EMAIL_GOOGLE,
        token: GOOD_TOKEN,
        identifier: GOOD_GOOGLE_ID,
      });
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
    });
    test('returns null if user with matching email exists with different googleId', async () => {
      expect.assertions(4);
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_GOOGLE })).toBe(false);
      const user = await prisma.createUser({
        email: EMAIL_GOOGLE, googleId: BAD_GOOGLE_ID,
      });
      expect(await prisma.$exists.user({
        email: EMAIL_GOOGLE, googleId: BAD_GOOGLE_ID,
      })).toBe(true);
      expect(await googleAuth.signin({
        prisma,
        email: EMAIL_GOOGLE,
        token: GOOD_TOKEN,
        identifier: GOOD_GOOGLE_ID,
      })).toBeNull();
      expect(await prisma.$exists.user({
        email: EMAIL_GOOGLE, googleId: BAD_GOOGLE_ID,
      })).toBe(true);
    });
    test('returns null if user with matching email exists that has null googleId', async () => {
      expect.assertions(4);
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_GOOGLE })).toBe(false);
      await prisma.createUser({ email: EMAIL_GOOGLE });
      expect(await prisma.$exists.user({ email: EMAIL_GOOGLE })).toBe(true);
      expect(await googleAuth.signin({
        prisma,
        email: EMAIL_GOOGLE,
        token: GOOD_TOKEN,
        identifier: GOOD_GOOGLE_ID,
      })).toBeNull();
      expect(await prisma.$exists.user({ email: EMAIL_GOOGLE })).toBe(true);
    });
  });

  describe('facebookAuth', async () => {
    beforeEach(async () => {
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyUsers({});
    });

    test('returns null if verify fails', async () => {
      expect.assertions(1);
      const facebookAuth = new FacebookAuthService();
      expect(await facebookAuth.signin({
        prisma,
        email: EMAIL_FACEBOOK,
        token: BAD_TOKEN,
        identifier: BAD_FACEBOOK_ID,
      })).toBeNull();
    });
    test('returns null if verify returns different facebookId', async () => {
      expect.assertions(3);
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK })).toBe(false);
      expect(await facebookAuth.signin({
        prisma,
        email: EMAIL_FACEBOOK,
        token: GOOD_TOKEN,
        identifier: BAD_FACEBOOK_ID,
      })).toBeNull();
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK })).toBe(false);
    });
    test('creates user if verify returns same facebookId and no user currently exists', async () => {
      expect.assertions(4);
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK })).toBe(false);
      const signinP = await facebookAuth.signin({
        prisma,
        email: EMAIL_FACEBOOK,
        token: GOOD_TOKEN,
        identifier: GOOD_FACEBOOK_ID,
      });
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(await prisma.$exists.user({
        email: EMAIL_FACEBOOK,
        facebookId: GOOD_FACEBOOK_ID,
      })).toBe(true);
    });
    test('fetch user if user with correct email and googleId exists', async () => {
      expect.assertions(5);
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK })).toBe(false);
      await prisma.createUser({ email: EMAIL_FACEBOOK, facebookId: GOOD_FACEBOOK_ID });
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK, facebookId: GOOD_FACEBOOK_ID })).toBe(true);
      const signinP = await facebookAuth.signin({
        prisma,
        email: EMAIL_FACEBOOK,
        token: GOOD_TOKEN,
        identifier: GOOD_FACEBOOK_ID,
      });
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(await prisma.$exists.user({
        email: EMAIL_FACEBOOK, facebookId: GOOD_FACEBOOK_ID,
      })).toBe(true);
    });
    test('returns null if user with matching email exists with different facebookId', async () => {
      expect.assertions(4);
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK })).toBe(false);
      await prisma.createUser({ email: EMAIL_FACEBOOK, facebookId: BAD_FACEBOOK_ID });
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK, facebookId: BAD_FACEBOOK_ID })).toBe(true);
      expect(await facebookAuth.signin({
        prisma,
        email: EMAIL_FACEBOOK,
        token: GOOD_TOKEN,
        identifier: GOOD_FACEBOOK_ID,
      })).toBeNull();
      expect(await prisma.$exists.user({
        email: EMAIL_FACEBOOK,
        facebookId: BAD_FACEBOOK_ID,
      })).toBe(true);
    });
    test('returns null if user with matching email exists that has null facebookId', async () => {
      expect.assertions(4);
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK })).toBe(false);
      const user = await prisma.createUser({ email: EMAIL_FACEBOOK });
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK })).toBe(true);
      expect(await facebookAuth.signin({
        prisma,
        email: EMAIL_FACEBOOK,
        token: GOOD_TOKEN,
        identifier: GOOD_GOOGLE_ID,
      })).toBeNull();
      expect(await prisma.$exists.user({ email: EMAIL_FACEBOOK })).toBe(true);
    });
  });

  describe('localAuth', async () => {
    beforeEach(async () => {
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyUsers({});
    });

    test('returns null if verify fails', async () => {
      expect.assertions(1);
      const localAuth = new LocalAuthService();
      expect(await localAuth.signin({
        prisma,
        email: EMAIL_LOCAL,
        token: BAD_TOKEN,
        identifier: GOOD_PASSWORD,
      })).toBeNull();
    });
    test('creates user if verify returns "true" and no user currently exists', async () => {
      expect.assertions(4);
      const localAuth = new LocalAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL })).toBe(false);
      const signinP = await localAuth.signin({
        prisma,
        email: EMAIL_LOCAL,
        token: GOOD_TOKEN,
        identifier: GOOD_PASSWORD,
      });
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL })).toBe(true);
    });
    test('fetch user if user with correct email and googleId exists', async () => {
      expect.assertions(5);
      const localAuth = new LocalAuthServiceTrueVerify();
      const passwordHash = await hashPassword(GOOD_PASSWORD);
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL })).toBe(false);
      await prisma.createUser({ email: EMAIL_LOCAL, passwordHash });
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL, passwordHash })).toBe(true);
      const signinP = await localAuth.signin({
        prisma,
        email: EMAIL_LOCAL,
        token: GOOD_TOKEN,
        identifier: GOOD_PASSWORD,
      });
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL, passwordHash })).toBe(true);
    });
    test('returns null if user with matching email but wrong password exists', async () => {
      expect.assertions(4);
      const localAuth = new LocalAuthServiceTrueVerify();
      const passwordHash = await hashPassword(GOOD_PASSWORD);
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL })).toBe(false);
      await prisma.createUser({ email: EMAIL_LOCAL, passwordHash });
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL, passwordHash })).toBe(true);
      expect(await localAuth.signin({
        prisma,
        email: EMAIL_LOCAL,
        token: GOOD_TOKEN,
        identifier: BAD_PASSWORD,
      })).toBeNull();
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL, passwordHash })).toBe(true);
    });
    test('returns null if user with matching email exists that has null passwordHash', async () => {
      expect.assertions(4);
      const localAuth = new LocalAuthServiceTrueVerify();
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL })).toBe(false);
      await prisma.createUser({ email: EMAIL_LOCAL });
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL })).toBe(true);
      expect(await localAuth.signin({
        prisma,
        email: EMAIL_LOCAL,
        token: GOOD_TOKEN,
        identifier: BAD_PASSWORD,
      })).toBeNull();
      expect(await prisma.$exists.user({ email: EMAIL_LOCAL })).toBe(true);
    });
  });
});
