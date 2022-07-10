import { FastifyPluginCallback } from 'fastify/types/plugin'

export const adminRouter: FastifyPluginCallback = (app, options, done) => {
  app.get('/health', (req, res) => {
    try {
      //See if we can access and pragma the database
      const info = app.db.pragma('table_info')
      setTimeout(() => {
        res.code(200).send()
      }, 1000);
    } catch (e) {
      res.code(500).send();
    }
  })
  done()
}
