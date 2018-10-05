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
    return new Promise<string|undefined>((res, rej) => {
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
    return new Promise<string|undefined>((res, rej) => {
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
    return new Promise<string|undefined>((res, rej) => {
      if (idToken === GOOD_TOKEN) {
        res('true');
      } else {
        res('false');
      }
    });
  }
}

describe('AuthService', async () => {

  describe('googleAuth', async () => {
    beforeEach(async () => {
      await prisma.deleteManyUsers({});
    });

    afterEach(async () => {
      await prisma.deleteManyUsers({});
    });

    test('returns null if verify fails', async () => {
      const googleAuth = new GoogleAuthService();
      expect(googleAuth.signin(EMAIL_GOOGLE, BAD_TOKEN, BAD_GOOGLE_ID)).resolves.toBeNull();
    });
    test('returns null if verify returns different googleId', async () => {
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE })).resolves.toBe(false);
      expect(googleAuth.signin(EMAIL_GOOGLE, GOOD_TOKEN, BAD_GOOGLE_ID)).resolves.toBeNull();
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE })).resolves.toBe(false);
    });
    test('creates user if verify returns same googleId and no user currently exists', async () => {
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE })).resolves.toBe(false);
      const signinP = await googleAuth.signin(EMAIL_GOOGLE, GOOD_TOKEN, GOOD_GOOGLE_ID);
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE, googleId: GOOD_GOOGLE_ID })).resolves.toBe(true);
    });
    test('fetch user if user with correct email and googleId exists', async () => {
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE })).resolves.toBe(false);
      const user = await prisma.createUser({ email: EMAIL_GOOGLE, googleId: GOOD_GOOGLE_ID });
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE, googleId: GOOD_GOOGLE_ID })).resolves.toBe(true);
      const signinP = await googleAuth.signin(EMAIL_GOOGLE, GOOD_TOKEN, GOOD_GOOGLE_ID);
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
    });
    test('returns null if user with matching email exists with different googleId', async () => {
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE })).resolves.toBe(false);
      const user = await prisma.createUser({ email: EMAIL_GOOGLE, googleId: BAD_GOOGLE_ID });
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE, googleId: BAD_GOOGLE_ID })).resolves.toBe(true);
      expect(googleAuth.signin(EMAIL_GOOGLE, GOOD_TOKEN, GOOD_GOOGLE_ID)).resolves.toBeNull();
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE, googleId: BAD_GOOGLE_ID })).resolves.toBe(true);
    });
    test('returns null if user with matching email exists that has null googleId', async () => {
      const googleAuth = new GoogleAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE })).resolves.toBe(false);
      const user = await prisma.createUser({ email: EMAIL_GOOGLE });
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE })).resolves.toBe(true);
      expect(googleAuth.signin(EMAIL_GOOGLE, GOOD_TOKEN, GOOD_GOOGLE_ID)).resolves.toBeNull();
      expect(prisma.$exists.user({ email: EMAIL_GOOGLE })).resolves.toBe(true);
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
      const facebookAuth = new FacebookAuthService();
      expect(facebookAuth.signin(EMAIL_FACEBOOK, BAD_TOKEN, BAD_FACEBOOK_ID)).resolves.toBeNull();
    });
    test('returns null if verify returns different facebookId', async () => {
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK })).resolves.toBe(false);
      expect(facebookAuth.signin(EMAIL_FACEBOOK, GOOD_TOKEN, BAD_FACEBOOK_ID)).resolves.toBeNull();
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK })).resolves.toBe(false);
    });
    test('creates user if verify returns same facebookId and no user currently exists', async () => {
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK })).resolves.toBe(false);
      const signinP = await facebookAuth.signin(EMAIL_FACEBOOK, GOOD_TOKEN, GOOD_FACEBOOK_ID);
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK, facebookId: GOOD_FACEBOOK_ID })).resolves.toBe(true);
    });
    test('fetch user if user with correct email and googleId exists', async () => {
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK })).resolves.toBe(false);
      await prisma.createUser({ email: EMAIL_FACEBOOK, facebookId: GOOD_FACEBOOK_ID });
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK, facebookId: GOOD_FACEBOOK_ID })).resolves.toBe(true);
      const signinP = await facebookAuth.signin(EMAIL_FACEBOOK, GOOD_TOKEN, GOOD_FACEBOOK_ID);
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK, facebookId: GOOD_FACEBOOK_ID })).resolves.toBe(true);
    });
    test('returns null if user with matching email exists with different facebookId', async () => {
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK })).resolves.toBe(false);
      await prisma.createUser({ email: EMAIL_FACEBOOK, facebookId: BAD_FACEBOOK_ID });
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK, facebookId: BAD_FACEBOOK_ID })).resolves.toBe(true);
      expect(facebookAuth.signin(EMAIL_FACEBOOK, GOOD_TOKEN, GOOD_FACEBOOK_ID)).resolves.toBeNull();
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK, facebookId: BAD_FACEBOOK_ID })).resolves.toBe(true);
    });
    test('returns null if user with matching email exists that has null facebookId', async () => {
      const facebookAuth = new FacebookAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK })).resolves.toBe(false);
      const user = await prisma.createUser({ email: EMAIL_FACEBOOK });
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK })).resolves.toBe(true);
      expect(facebookAuth.signin(EMAIL_FACEBOOK, GOOD_TOKEN, GOOD_GOOGLE_ID)).resolves.toBeNull();
      expect(prisma.$exists.user({ email: EMAIL_FACEBOOK })).resolves.toBe(true);
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
      const localAuth = new LocalAuthService();
      expect(localAuth.signin(EMAIL_LOCAL, BAD_TOKEN, GOOD_PASSWORD)).resolves.toBeNull();
    });
    test('creates user if verify returns "true" and no user currently exists', async () => {
      const localAuth = new LocalAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_LOCAL })).resolves.toBe(false);
      const signinP = await localAuth.signin(EMAIL_LOCAL, GOOD_TOKEN, GOOD_PASSWORD);
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(prisma.$exists.user({ email: EMAIL_LOCAL })).resolves.toBe(true);
    });
    test('fetch user if user with correct email and googleId exists', async () => {
      const localAuth = new LocalAuthServiceTrueVerify();
      const passwordHash = await hashPassword(GOOD_PASSWORD);
      expect(prisma.$exists.user({ email: EMAIL_LOCAL })).resolves.toBe(false);
      await prisma.createUser({ email: EMAIL_LOCAL, passwordHash });
      expect(prisma.$exists.user({ email: EMAIL_LOCAL, passwordHash })).resolves.toBe(true);
      const signinP = await localAuth.signin(EMAIL_LOCAL, GOOD_TOKEN, GOOD_PASSWORD);
      expect(signinP).toHaveProperty('token');
      expect(signinP).toHaveProperty('user');
      expect(prisma.$exists.user({ email: EMAIL_LOCAL, passwordHash })).resolves.toBe(true);
    });
    test('returns null if user with matching email but wrong password exists', async () => {
      const localAuth = new LocalAuthServiceTrueVerify();
      const passwordHash = await hashPassword(GOOD_PASSWORD);
      expect(prisma.$exists.user({ email: EMAIL_LOCAL })).resolves.toBe(false);
      await prisma.createUser({ email: EMAIL_LOCAL, passwordHash });
      expect(prisma.$exists.user({ email: EMAIL_LOCAL, passwordHash })).resolves.toBe(true);
      expect(localAuth.signin(EMAIL_LOCAL, GOOD_TOKEN, BAD_PASSWORD)).resolves.toBeNull();
      expect(prisma.$exists.user({ email: EMAIL_LOCAL, passwordHash })).resolves.toBe(true);
    });
    test('returns null if user with matching email exists that has null passwordHash', async () => {
      const localAuth = new LocalAuthServiceTrueVerify();
      expect(prisma.$exists.user({ email: EMAIL_LOCAL })).resolves.toBe(false);
      await prisma.createUser({ email: EMAIL_LOCAL });
      expect(prisma.$exists.user({ email: EMAIL_LOCAL })).resolves.toBe(true);
      expect(localAuth.signin(EMAIL_LOCAL, GOOD_TOKEN, BAD_PASSWORD)).resolves.toBeNull();
      expect(prisma.$exists.user({ email: EMAIL_LOCAL })).resolves.toBe(true);
    });
  });
});
