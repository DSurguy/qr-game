import fastify from 'fastify';
const app = fastify({
  logger: true
});

app.get('/', (request, response) => {
  response.send({ hello: 'world' })
})

app.listen({ port: 8010 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`Server is now listening on ${address}`);
})