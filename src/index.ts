import { GraphQLServer } from "graphql-yoga";
import { Prisma } from "prisma-binding";

import resolvers from "./resolvers/";

const db = new Prisma({
  debug: true,
  endpoint: "http://localhost:4466",
  typeDefs: "src/generated/prisma.graphql",
});

const server = new GraphQLServer({
  context: (req) => ({
    ...req,
    db,
  }),
  resolvers,
  typeDefs: "src/schema.graphql",
});
