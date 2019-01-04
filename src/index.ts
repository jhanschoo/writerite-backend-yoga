import fs from 'fs';
import config from 'config';
import './assertConfig';

import { GraphQLServer, PubSub } from 'graphql-yoga';
import helmet from 'helmet';

import { prisma } from '../generated/prisma-client';
import resolvers from './resolver';

import redis from 'redis';

import { getClaims, generateJWT } from './util';
import { IHttpsConfig } from './types';

const { NODE_ENV } = process.env;
const HTTPS = config.get<IHttpsConfig>('HTTPS');

const redisClient = redis.createClient();
redisClient.on('error', (err) => {
  // tslint:disable-next-line: no-console
  console.error(`redisClient error: ${err}`);
});

// TODO: use redis instead when needed
const pubsub = new PubSub();
const acolyteJWT = generateJWT({
  id: 'acolyte',
  email: 'acolyte@writerite.site',
  roles: ['acolyte'],
}, true);

redisClient.set('writerite:acolyte:jwt', acolyteJWT);

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
  https: {
    cert: fs.readFileSync(HTTPS.CERT_FILE),
    key: fs.readFileSync(HTTPS.KEY_FILE),
  },
  // tslint:disable-next-line no-console
}, () => console.log(`Server is running on http://localhost:4000`));
