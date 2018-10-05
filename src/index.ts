import { GraphQLServer } from 'graphql-yoga';
import { prisma } from './generated/prisma-client';
import helmet from 'helmet';

import resolvers from './resolver';
import { getClaims } from './util';

const server = new GraphQLServer({
  context: (req) => ({
    ...req,
    ...getClaims(req),
    prisma,
  }),
  resolvers,
  typeDefs: 'src/schema/schema.graphql',
});

server.express.use(helmet());

// tslint:disable-next-line no-console
server.start(() => console.log(`Server is running on http://localhost:4000`));
