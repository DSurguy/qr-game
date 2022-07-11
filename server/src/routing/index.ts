import fastify from "fastify";
import { adminRouter } from './adminRouter';
import { Database } from 'better-sqlite3';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

export function start(db: Database) {
  const app = fastify({
    logger: true
  }).withTypeProvider<TypeBoxTypeProvider>()

  app.decorate('db', db);
  
  app.register(require('@fastify/cors'))
  
  app.register(adminRouter, {
    prefix: 'api/admin'
  })
  
  app.listen({ port: 8011 }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(`Server is now listening on ${address}`);
  })
}