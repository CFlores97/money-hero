import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

import { typeDefs } from './schema/index.js';
import { resolvers } from './resolvers/index.js';
import { buildGraphQLContext } from './context.js';

export async function installGraphQL(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) =>
        buildGraphQLContext(req)
    })
  );
}