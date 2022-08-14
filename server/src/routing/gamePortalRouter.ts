import { randomUUID } from 'node:crypto';
import { FastifyPluginCallback } from "fastify"
import { ActivityCompletedEventPayload } from "../types";
import { EventType } from '../enums';
import { SavedActivityType } from '@qr-game/types';

// /api/admin/*
// ----
// BASE /api/game/portal/*
// POST /api/game/portal/player?playerUuid&projectUuid
// ----
// BASE /api/game/* <authenticated>
// GET  /api/game - project info
// GET  /api/game/me - current authenticated player info
// GET  /api/game/players - all claimed players
// GET  /api/game/players/:playerUuid - specific player info


// /portal
export const gamePortalRouter: FastifyPluginCallback = (app, options, done) => {
  // /player
  //   - if( not authenticated && claimed ) login
  //   - if( not authenticated && not claimed ) claim [client-side]
  //   - if( logged in as same ) view same profile [client-side]
  //   - if( logged in as other && duel pending ) connect duel
  //   - if( logged in as other && other claimed ) view other profile [client-side]
  
  // /activity
  //   - if( not authenticated ) view activity details [client-side]
  //   - if(  )

  app.post<{
    Querystring: {
      playerUuid: string;
      projectUuid: string;
    }
  }>('/player', (req, reply) => {
    try {
      const { playerUuid, projectUuid } = req.query;

      const getPlayer = app.db.prepare(`SELECT * FROM project_players WHERE projectUuid=@projectUuid AND uuid=@playerUuid AND deleted=0`);
      const player = getPlayer.get({ projectUuid, playerUuid })
      if( !player ) return reply.status(404).send();

      if( player.claimed ) {
        const sessionId = app.sessions.startSession(projectUuid, playerUuid)
        const signedSessionId = app.signCookie(sessionId);
        reply.status(200).send({
          target: '/game/me',
          setAuth: signedSessionId
        });
      } else {
        reply.status(200).send({
          target: `/player?game=${projectUuid}&player=${playerUuid}`
        })
      }
    } catch (e) {
      reply.status(500).send();
    }
  })

  app.post<{
    Querystring: {
      projectUuid: string;
      activityUuid: string;
    },
    Headers: {
      Authorization?: string;
    }
  }>('/activity', (req, reply) => {
    const { projectUuid, activityUuid } = req.query;
    const session = req.headers.Authorization ? app.unsignCookie(req.headers.Authorization).value : null;
    const currentPlayer = session ? app.sessions.getLoggedInPlayer(projectUuid, session) : null;
    if( currentPlayer ) {
      const hasCompletedBefore = false;

      const timestamp = Date.now();
      const payload: ActivityCompletedEventPayload = {
        playerUuid: currentPlayer,
        activityUuid,
        isRepeat: hasCompletedBefore //TODO: Check events to see if this player has completed, and use the appropriate value
      }
      const eventUuid = randomUUID();

      const transation = app.db.transaction(() => {
        const getActivity = app.db.prepare(`SELECT * FROM project_activities WHERE projectUuid=@projectUuid AND uuid=@activityUuid AND deleted=0`)
        const activity = getActivity.get({
          projectUuid,
          activityUuid
        }) as SavedActivityType

        if( !activity ) return reply.status(404).send();

        const insert = app.db.prepare(`
          INSERT INTO project_events (projectUuid, uuid, type, payload, timestamp)
          VALUES(
            @projectUuid,
            @uuid,
            @type,
            @payload,
            @timestamp
          )
        `)

        insert.run({
          projectUuid: req.query,
          uuid: eventUuid,
          type: EventType.ActivityCompleted,
          payload,
          timestamp
        })

        const insertTransation = app.db.prepare(`
          INSERT INTO project_transations (projectUuid, playerUuid, eventUuid, amount, timestamp)
          VALUES (
            @projectUuid,
            @playerUuid,
            @eventUuid,
            @amount,
            @timestamp
          )
        `)

        insertTransation.run({
          projectUuid,
          playerUuid: currentPlayer,
          eventUuid,
          amount: activity.value,
          timestamp
        })
      });

      transation();

      reply.status(200).send({
        target: `/game/activity/${activityUuid}`
      })
    }
    else {
      reply.status(200).send({
        target: `/activity?game=${projectUuid}&activity=${activityUuid}`
      })
    }
  })

  done()
}