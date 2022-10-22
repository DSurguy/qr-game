import { FastifyInstance } from "fastify";

export function applyActivityRoutes(app: FastifyInstance) {
  app.post<{
    Querystring: {
      projectUuid: string;
      activityUuid: string;
    },
    Headers: {
      authorization?: string;
    }
  }>('/activity', (req, reply) => {
    const { projectUuid, activityUuid } = req.query;
    const sessionId = req.headers.authorization ? app.unsignCookie(req.headers.authorization).value : null;
    const session = sessionId ? app.sessions.getSession(sessionId) : null;
    if( !session ) {
      reply.status(200).send({
        target: `/activity?game=${projectUuid}&activity=${activityUuid}`
      })
      return;
    }
    if( projectUuid !== session.projectUuid ) {
      reply.status(401).send();
      return;
    }
    
    return reply.status(200).send({
      target: `/game/activity/${activityUuid}`
    });
  })
}