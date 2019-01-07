import fs from 'fs';
import config from 'config';
import './assertConfig';

import { GraphQLServer } from 'graphql-yoga';
import helmet from 'helmet';
import { RedisPubSub } from 'graphql-redis-subscriptions';

import { prisma } from '../generated/prisma-client';
import resolvers from './resolver';

import Redis from 'ioredis';

import { getClaims, generateJWT } from './util';
import { IHttpsConfig, IRedisConfig } from './types';

const { NODE_ENV } = process.env;
const HTTPS = config.get<IHttpsConfig>('HTTPS');
const REDIS = config.get<IRedisConfig>('REDIS');

const redisOptions = {
  host: REDIS.HOST,
  port: parseInt(REDIS.PORT, 10),
};

const redisClient = new Redis({ ...redisOptions, db: 2 });
redisClient.on('error', (err) => {
  // tslint:disable-next-line: no-console
  console.error(`redisClient error: ${err}`);
});

// TODO: use redis instead when needed
const pubsub = new RedisPubSub({
  publisher: new Redis({ ...redisOptions, db: 1 }),
  subscriber: new Redis({ ...redisOptions, db: 1 }),
});

const acolyteJWT = generateJWT({
  id: 'acolyte',
  email: 'acolyte@writerite.site',
  roles: ['acolyte'],
}, true);

const writeJWT = () => {
  redisClient.set('writerite:acolyte:jwt', acolyteJWT)
    .then(() => setTimeout(writeJWT, 10000));
};
writeJWT();

const server = new GraphQLServer({
  context: (req) => ({
    ...req,
    ...getClaims(req),
    prisma,
    pubsub,
    redisClient,
  }),
  mocks: NODE_ENV === 'testing',
  resolvers,
  typeDefs: 'src/schema/schema.graphql',
});

server.express.use(helmet());

server.start({
  cors: {
    origin: [/https:\/\/local.writerite.site:3000/, /https:\/\/writerite.site/],
    credentials: true,
  },
  debug: NODE_ENV !== 'production',
  playground: false,
  https: (NODE_ENV !== 'production')
    ? {
      cert: fs.readFileSync(HTTPS.CERT_FILE),
      key: fs.readFileSync(HTTPS.KEY_FILE),
    }
    : undefined,
  // tslint:disable-next-line no-console
}, () => console.log(`Server is running`));
