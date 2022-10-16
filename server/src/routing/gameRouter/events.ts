import { FastifyInstance } from "fastify";
import { GameEvent } from "../../qr-types";

export function applyEventRoutes (app: FastifyInstance) {
  app.get<{
    Params: {
      eventUuid: string;
    },
    Header: {
      authorization: string | undefined;
    },
    Reply: GameEvent | undefined;
  }>('/event/:eventUuid', (req, reply) => {
    try {
      const { eventUuid } = req.params;

      const getEvent = app.db.prepare(`
        SELECT * FROM project_events WHERE projectUuid=@projectUuid AND uuid=@eventUuid
      `)
      const gameEvent = getEvent.get({
        projectUuid: req.session.projectUuid,
        eventUuid
      })

      if( gameEvent ) reply.status(200).send({
        ...gameEvent,
        payload: JSON.parse(gameEvent.payload)
      })
      else reply.status(404).send();
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })
}