import { FastifyPluginCallback } from 'fastify/types/plugin'
import { applyItemRoutes } from './items';
import { applyPlayerRoutes } from './players';
import { applySettingsRoutes } from './settings';
import { applyActivityRoutes } from './activities';
import { applyProjectRoutes } from './projects';

export const adminRouter: FastifyPluginCallback = (app, options, done) => {

  app.get('/health', (req, reply) => {
    try {
      //See if we can access and pragma the database
      const info = app.db.pragma('table_info')
      setTimeout(() => {
        reply.code(200).send()
      }, 1000);
    } catch (e) {
      reply.code(500).send();
    }
  })

  applyProjectRoutes(app);

  applyActivityRoutes(app);

  applySettingsRoutes(app);

  applyPlayerRoutes(app);

  applyItemRoutes(app);

  done()
}
