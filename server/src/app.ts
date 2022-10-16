import cookie from '@fastify/cookie'
import type { FastifyCookieOptions } from '@fastify/cookie'
import fastify from "fastify";
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { adminRouter } from './routing/adminRouter/adminRouter';
import { Database } from 'better-sqlite3';
import SessionManager from "./sessionManager";
import { gamePortalRouter } from "./routing/gamePortalRouter";
import { gameRouter } from "./routing/gameRouter/gameRouter";
import { publicRouter } from './routing/publicRouter';
import { createPluginManager } from './plugins/pluginManager';
import { createRedemptionPointsPlugin } from './plugins/redemptionPoints';

export function start(db: Database) {
  const httpsOptions = process.env.HTTPS ? {
    key: readFileSync(resolve(__dirname, '../certs/server.key')),
    cert: readFileSync(resolve(__dirname, '../certs/server.cert'))
  } : undefined;

  const redemptionPointsPlugin = createRedemptionPointsPlugin();
  const pluginManager = createPluginManager();
  pluginManager.applyPlugin(redemptionPointsPlugin);

  const app = fastify({
    logger: true,
    https: httpsOptions
  })

  app.decorate('db', db);

  app.decorate('sessions', new SessionManager(db));

  app.decorate('plugins', pluginManager);
  
  //Allow all options requests
  app.register(require('@fastify/cors'))

  //Reject all other requests that don't have an API key
  app.addHook('onRequest', (request, reply, done) => {
    const apiKey = request.headers['api-key'];
    if( apiKey !== process.env.API_KEY ) {
      reply.status(403).send();
      return;
    }
    done();
  });

  app.addHook('onRoute', (routeOptions) => {
    console.log(routeOptions.routePath);
  });
  
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

  app.register(publicRouter, {
    prefix: 'api/public'
  })
  
  app.listen({ port: 8011, host: '::' }, (err, address) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(`Server is now listening on ${address}`);
  })
}