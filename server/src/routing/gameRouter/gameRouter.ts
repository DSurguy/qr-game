import { FastifyPluginCallback } from "fastify"
import { applyInventoryRoutes } from "./inventory";
import { applyStoreRoutes } from "./store";
import { applyPlayerRoutes } from "./players";
import { applyDuelRoutes } from "./duels";
import { applyEventRoutes } from "./events";
import { applyActivityRoutes } from "./activities";
import { applyMeRoutes } from "./me";
import { applyProjectRoutes } from "./projects";

export const gameRouter: FastifyPluginCallback = (app, options, done) => {
  app.addHook('onRequest', (request, reply, done) => {
    const sessionHeader = app.unsignCookie(request.headers.authorization);
    if( !sessionHeader.valid ) {
      reply.status(401).send();
      return;
    }

    const session = app.sessions.getSession(sessionHeader.value)
    if( !session ) {
      reply.status(401).send();
      return;
    }

    request.session = session;

    done();
  })

  applyProjectRoutes(app);

  applyMeRoutes(app);

  applyActivityRoutes(app);

  applyEventRoutes(app);

  applyDuelRoutes(app);

  applyPlayerRoutes(app);

  applyStoreRoutes(app);

  applyInventoryRoutes(app);

  done();
}