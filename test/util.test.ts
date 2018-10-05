import { generateJWT, getClaims, comparePassword, hashPassword, generateB64UUID } from '../src/util';

describe('getClaims', () => {
  test('getClaims returns null on bad context', () => {
    expect(getClaims({})).toBeNull();
  });

  test('getClaims returns sub if present', () => {
    const sub = { hello: 'world' };
    expect(getClaims({ sub })).toHaveProperty('sub', sub);
  });

  test('getClaims returns null if header not present', () => {
    const ctx = { request: { get: () => undefined } };
    expect(getClaims(ctx)).toBeNull();
  });

  test('getClaims returns null if Authorization header is malformed', () => {
    const ctx = { request: { get: () => 'abc' } };
    expect(getClaims(ctx)).toBeNull();
  });
});

describe('JWTs', () => {
  test('generateJWT generates a JWT compatible with getClaims', () => {
    const sub = { hello: 'world' };
    const jwt = `Bearer ${generateJWT(sub)}`;
    expect(getClaims({ request: { get: (header: string) => {
      if (header === 'Authorization') {
        return jwt;
      }
    }}})).toHaveProperty('sub', sub);
  });
});

describe('passwords', () => {
  test('comparePassword fails on malformed', async () => {
    const passwordResultP = comparePassword('123', 'abc');
    expect(passwordResultP).resolves.toBe(false);
  });

  test('hashPassword generates a hash compatible with comparePassword', async () => {
    const hash = await hashPassword('12345');
    const passwordResultP = comparePassword('12345', hash);
    expect(passwordResultP).resolves.toBe(true);
  });
});

describe('generateB64UUID', () => {
  test('generateB64UUID generates distinct strings', () => {
    const a: number[] = [];
    for (let i = 0; i < 32; ++i) {
      a[i] = generateB64UUID();
      for (let j = 0; j < i; ++j) {
        expect(a[i]).not.toBe(a[j]);
      }
    }
  });
});
