import { resolve } from 'node:path';
import fastify from "fastify";
import { apiRouter } from './apiRouter';

const app = fastify({
  logger: true
})

app.register(require('@fastify/cors'))

app.register(require('@fastify/static'), {
  root: resolve(__dirname, 'static')
})

app.register(apiRouter, {
  prefix: 'api'
})

app.listen({ port: 8011 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Server is now listening on ${address}`);
})