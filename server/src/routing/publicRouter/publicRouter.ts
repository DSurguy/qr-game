import { FastifyPluginCallback } from "fastify";
import { applyPlayerRoutes } from "./player";

export const publicRouter: FastifyPluginCallback = (app, options, done) => {
  applyPlayerRoutes(app);

  done();
}