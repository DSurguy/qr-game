import { resolve } from 'node:path';
import fastify from "fastify";
import fastifyStatic from '@fastify/static';

const app = fastify({
  logger: true
})

app.register(fastifyStatic, {
  root: resolve(__dirname, 'static')
})

app.listen({ port: 8011 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Server is now listening on ${address}`);
})