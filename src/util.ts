import { Context } from 'graphql-yoga/dist/types';
import bcrypt from 'bcrypt';
import KJUR from 'jsrsasign';

const SALT_ROUNDS = 10;

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

export function getClaims(ctx: Context) {
  if (ctx.sub) {
    return { sub: ctx.sub };
  }
  if (!ctx.request || !ctx.request.get) {
    return null;
  }
  const authorization = ctx.request.get('Authorization');
  if (!authorization) {
    return null;
  }
  const jwt = authorization.slice(7);
  if (jwt && KJUR.jws.JWS.verify(jwt, PUBLIC_KEY, ['ES256'])) {
    const sub = KJUR.jws.JWS.parse(jwt).payloadObj.sub;
    ctx.sub = sub;
    return { sub };
  }
  return null;
}

export function getToken(ctx: Context) {
  return ctx.request.header('Authorization').slice(7);
}
