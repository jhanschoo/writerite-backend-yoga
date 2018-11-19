import { Context } from 'graphql-yoga/dist/types';
import bcrypt from 'bcrypt';
import KJUR from 'jsrsasign';
import { ResolvesTo, ICurrentUser, Roles } from './types';

const SALT_ROUNDS = 10;

export function fieldGetter<T>(field: string): ResolvesTo<T> {
  return (parent: any) => {
    return parent[field] instanceof Function ? parent[field]() : parent[field];
  };
}

export async function resolveField<T>(
  f: ResolvesTo<T>, parent = null
): Promise<T> {
  return new Promise<T>((res, rej) => {
    if (f instanceof Function) {
      res(f(parent));
    } else {
      res(f);
    }
  });
}

export function isCurrentUser(o: any): o is ICurrentUser {
  return o && o.id && typeof o.id === 'string'
    && o.email && o.email === 'string'
    && o.roles && o.roles instanceof Array && o.roles.every((r: any) => {
      return r === Roles.admin || r === Roles.user;
    });
}

const EC_KEYPAIR = (
  new KJUR.crypto.ECDSA({ curve: 'secp256r1' })
).generateKeyPairHex();
const PUBLIC_KEY = new KJUR.crypto.ECDSA(
  { curve: 'secp256r1', pub: EC_KEYPAIR.ecpubhex },
);
const PRIVATE_KEY = new KJUR.crypto.ECDSA(
  { curve: 'secp256r1', prv: EC_KEYPAIR.ecprvhex },
);

export async function comparePassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function generateB64UUID() {
  const uuid = KJUR.crypto.Util.getRandomHexOfNbits(128);
  const b64uuid = KJUR.hextob64(uuid);
  return b64uuid;
}

export function generateJWT(sub: any, persist = false) {
  const timeNow = KJUR.jws.IntDate.get('now');
  const expiryTime = KJUR.jws.IntDate.get(
    persist ? 'now + 1month' : 'now + 1day',
  );

  const header = {
    alg: 'ES256',
    cty: 'JWT',
  };

  const payload = {
    exp: expiryTime,
    iat: timeNow,
    iss: 'https://writerite.site',
    jti: generateB64UUID(),
    // nbf: timeNow,
    sub,
  };

  const jwt = KJUR.jws.JWS.sign(null, header, payload, PRIVATE_KEY);
  return jwt;
}

export function getClaims(ctx: Context): { sub: ICurrentUser } | null {
  if (ctx.sub) {
    return { sub: ctx.sub };
  }
  let authorization = null;
  if (ctx.request && ctx.request.get) {
    authorization = ctx.request.get('Authorization');
  } else if (ctx.connection && ctx.connection.context) {
    if (ctx.connection.context.Authorization) {
      authorization = ctx.connection.context.Authorization;
    } else if (ctx.connection.context.authorization) {
      authorization = ctx.connection.context.authorization;
    }
  }
  if (!authorization) {
    return null;
  }
  const jwt = authorization.slice(7);
  if (jwt) {
    try {
      if (KJUR.jws.JWS.verify(jwt, PUBLIC_KEY, ['ES256'])) {
        const sub = KJUR.jws.JWS.parse(jwt)
          .payloadObj.sub as ICurrentUser;
        ctx.sub = sub;
        return { sub };
      }
    } catch (e) {
      ctx.sub = null;
      return null;
    }
  }
  return null;
}

export function getToken(ctx: Context) {
  return ctx.request.header('Authorization').slice(7);
}
