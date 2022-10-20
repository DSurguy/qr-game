import { FastifyInstance } from "fastify";
import { GameActivity, GameEventType, SavedActivity } from "../../qr-types";

export function applyActivityRoutes (app: FastifyInstance) {
  app.get<{
    Params: {
      activityUuid: string;
    },
    Header: {
      authorization: string | undefined;
    },
    Reply: GameActivity | undefined;
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

      if( !activity ) {
        reply.status(404).send();
        return;
      }

      const selectTags = app.db.prepare(`
        SELECT * from activity_tags
        WHERE projectUuid=@projectUuid AND activityUuid=@activityUuid AND tag IN ('color', 'icon')
      `)
      const tags = selectTags.all({
        projectUuid: req.session.projectUuid,
        activityUuid
      })
      const tagMap = tags.reduce((aggregate, tag) => {
        aggregate[tag.tag] = tag.value;
        return aggregate
      }, {})

      const selectLastEvent = app.db.prepare(`
        SELECT * FROM project_events
        WHERE
          projectUuid=@projectUuid AND
          primaryUuid=@activityUuid AND
          secondaryUuid=@playerUuid AND
          type=@eventType
        ORDER BY timestamp DESC
      `)
      const lastEvent = selectLastEvent.get({
        projectUuid: req.session.projectUuid,
        playerUuid: req.session.playerUuid,
        activityUuid: activity.uuid,
        eventType: GameEventType.ActivityCompleted
      })
      const claimAmount = lastEvent ? JSON.parse(lastEvent.payload)?.amount : undefined;

      reply.status(200).send({
        ...activity,
        isDuel: !!activity.isDuel,
        isRepeatable: !!activity.isDuel,
        icon: tagMap.icon,
        color: tagMap.color,
        claimedAt: lastEvent?.timestamp,
        claimedFor: claimAmount
      })
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })
}