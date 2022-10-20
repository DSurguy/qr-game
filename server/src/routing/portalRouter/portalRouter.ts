import { FastifyPluginCallback } from "fastify"
import { applyPlayerRoutes } from './player';
import { applyActivityRoutes } from './activity';
import { applyItemRoutes } from './item';

export const portalRouter: FastifyPluginCallback = (app, options, done) => {

  applyPlayerRoutes(app);

  applyActivityRoutes(app);

  applyItemRoutes(app);

  done()
}