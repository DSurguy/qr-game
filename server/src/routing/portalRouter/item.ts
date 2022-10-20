import { FastifyInstance } from "fastify";

export function applyItemRoutes(app: FastifyInstance) {
  app.post<{
    Querystring: {
      projectUuid: string;
      itemUuid: string;
    },
    Headers: {
      authorization?: string;
    }
  }>('/item', (req, reply) => {
    const { projectUuid, itemUuid } = req.query;
    const sessionId = req.headers.authorization ? app.unsignCookie(req.headers.authorization).value : null;
    const session = sessionId ? app.sessions.getSession(sessionId) : null;
    
    if( !session ) {
      reply.status(200).send({
        target: `/login`
      })
      return;
    }

    if( projectUuid !== session.projectUuid ) {
      reply.status(401).send();
      return;
    }

    reply.status(200).send({
      target: `/game/store/${itemUuid}`
    })
  })
}