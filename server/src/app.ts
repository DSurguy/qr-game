import cookie from '@fastify/cookie'
import type { FastifyCookieOptions } from '@fastify/cookie'
import fastify from "fastify";
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { adminRouter } from './routing/adminRouter';
import { Database } from 'better-sqlite3';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import SessionManager from "./sessionManager";
import { gamePortalRouter } from "./routing/gamePortalRouter";
import { gameRouter } from "./routing/gameRouter";

export function start(db: Database) {
  const httpsOptions = process.env.HTTPS ? {
    key: readFileSync(resolve(__dirname, '../certs/server.key')),
    cert: readFileSync(resolve(__dirname, '../certs/server.cert'))
  } : undefined;

  const app = fastify({
    logger: true,
    https: httpsOptions
  }).withTypeProvider<TypeBoxTypeProvider>()

  app.decorate('db', db);

  app.decorate('sessions', new SessionManager(db));
  
  app.register(require('@fastify/cors'))
  
  //TODO: Store this secret in a file and re-use it
  app.register(cookie as any, {
    secret: 'change-this-secret-later',
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