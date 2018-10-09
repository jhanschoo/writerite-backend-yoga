import { GraphQLServer, PubSub } from 'graphql-yoga';
import { prisma } from './generated/prisma-client';
import helmet from 'helmet';

import resolvers from './resolver';
import { getClaims } from './util';

// TODO: use redis instead when needed
const pubsub = new PubSub();

const server = new GraphQLServer({
  context: (req) => ({
    ...req,
    ...getClaims(req),
    prisma,
    pubsub,
  }),
  resolvers,
  typeDefs: 'src/schema/schema.graphql',
});

server.express.use(helmet());

server.start({
  cors: {
    origin: [/localhost/, /https:\/\/writerite.site/],
    credentials: true,
  },
  debug: true,
  // tslint:disable-next-line no-console
}, () => console.log(`Server is running on http://localhost:4000`));
