import { FastifyPluginCallback } from 'fastify/types/plugin'

export const apiRouter: FastifyPluginCallback = (app, options, done) => {
  app.get('/health', (req, res) => {
    setTimeout(() => {
      res.code(200).send()
    }, 1000);
  })
  done()
}
