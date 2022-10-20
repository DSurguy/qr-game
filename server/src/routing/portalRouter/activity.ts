import { FastifyInstance } from "fastify";
import { SavedActivity } from "../../qr-types";

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

    const getActivity = app.db.prepare(`SELECT * FROM project_activities WHERE projectUuid=@projectUuid AND uuid=@activityUuid AND deleted=0`)
    const activity = getActivity.get({
      projectUuid: session.projectUuid,
      activityUuid
    }) as SavedActivity

    if( !activity ) return reply.status(404).send();
    
    if( activity.isDuel ) {
      //Return control to the client to prompt to add this activity to a duel or start a new one
      return reply.status(200).send({
        target: `/game/activity/${activity.uuid}?duel`
      });
    }

    const hookResponses = app.plugins.runPortalActivityHook({
      db: app.db,
      session: session,
      activity
    });

    reply.status(200).send({
      target: `/game/activity/${activityUuid}`,
      hooks: {
        portalActivity: hookResponses
      }
    })
  })
}