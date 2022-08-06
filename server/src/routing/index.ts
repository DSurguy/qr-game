import fastify from "fastify";
import type { FastifyCookieOptions } from '@fastify/cookie'
import cookie from '@fastify/cookie'
import { adminRouter } from './adminRouter';
import { Database } from 'better-sqlite3';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import SessionManager from "../sessionManager";
import { gamePortalRouter } from "./gamePortalRouter";
import { gameRouter } from "./gameRouter";

export function start(db: Database) {
  const app = fastify({
    logger: true
  }).withTypeProvider<TypeBoxTypeProvider>()

  app.decorate('db', db);

  app.decorate('sessions', new SessionManager(db));
  
  app.register(require('@fastify/cors'))
  app.register(cookie, {
    secret: 'change-this-secret-later'
  } as FastifyCookieOptions)
  
  app.register(adminRouter, {
    prefix: 'api/admin'
  })

  app.register(gamePortalRouter, {
    prefix: 'api/game/portal'
  })

  app.register(gameRouter, {
    prefix: 'api/game'
  })
  
  app.listen({ port: 8011, host: '::' }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(`Server is now listening on ${address}`);
  })
}