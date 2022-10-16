import { FastifyInstance } from "fastify";
import { SavedActivity } from "../../qr-types";

export function applyActivityRoutes (app: FastifyInstance) {
  app.get<{
    Params: {
      activityUuid: string;
    },
    Header: {
      authorization: string | undefined;
    },
    Reply: SavedActivity | undefined;
  }>('/activities/:activityUuid', (req, reply) => {
    try {
      const { activityUuid } = req.params;

      const getActivity = app.db.prepare(`
        SELECT * FROM project_activities WHERE projectUuid=@projectUuid AND uuid=@activityUuid AND deleted=0
      `)
      const activity = getActivity.get({
        projectUuid: req.session.projectUuid,
        activityUuid
      })

      if( activity ) reply.status(200).send(activity)
      else reply.status(404).send();
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })
}