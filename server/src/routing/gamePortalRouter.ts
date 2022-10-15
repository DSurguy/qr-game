import { randomUUID } from 'node:crypto';
import { FastifyPluginCallback } from "fastify"
import { SavedActivity, ActivityCompletedEventPayload, GameEventType } from '../qr-types';
import { hasCompletedActivityBefore } from './gameMethods/hasCompletedBefore';

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
    },
    Headers: {
      authorization?: string;
    }
  }>('/player', (req, reply) => {
    try {
      const { playerUuid, projectUuid } = req.query;

      const getPlayer = app.db.prepare(`SELECT * FROM project_players WHERE projectUuid=@projectUuid AND uuid=@playerUuid AND deleted=0`);
      const player = getPlayer.get({ projectUuid, playerUuid })
      if( !player ) return reply.status(404).send();

      const sessionHeader = req.headers.authorization && app.unsignCookie(req.headers.authorization).value;
      const session = sessionHeader && app.sessions.getSession(sessionHeader);
      //TODO: maybe force log out if session expired? Don't want people to accidentally log in.
      if( session ) {
        if( player.uuid === session.playerUuid ) {
          reply.status(200).send({
            target: '/game/me'
          });
        }
        else {
          reply.status(200).send({
            target: `/game/player/${player.uuid}`,
          });
        }
      }
      else{
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
    else if( activity.isDuel ) {
      //Return control to the client to prompt to add this activity to a duel or start a new one
      return reply.status(200).send({
        target: `/game/activity/${activity.uuid}?duel`
      });
    }

    const hasCompletedBefore = hasCompletedActivityBefore(app.db, session.projectUuid, session.playerUuid, activityUuid);

    const timestamp = Date.now();
    const eventPayload: ActivityCompletedEventPayload = {
      playerUuid: session.playerUuid,
      activityUuid,
      isRepeat: hasCompletedBefore
    }
    const eventUuid = randomUUID();

    const transaction = app.db.transaction(() => {

      const insert = app.db.prepare(`
        INSERT INTO project_events (projectUuid, uuid, type, payload, primaryUuid, secondaryUuid, timestamp)
        VALUES(
          @projectUuid,
          @uuid,
          @type,
          @payload,
          @primaryUuid,
          @secondaryUuid,
          @timestamp
        )
      `)

      insert.run({
        projectUuid: session.projectUuid,
        uuid: eventUuid,
        type: GameEventType.ActivityCompleted,
        payload: JSON.stringify(eventPayload),
        primaryUuid: activityUuid,
        secondaryUuid: session.playerUuid,
        timestamp
      })

      const insertTransaction = app.db.prepare(`
        INSERT INTO project_transactions (projectUuid, playerUuid, eventUuid, amount, timestamp)
        VALUES (
          @projectUuid,
          @playerUuid,
          @eventUuid,
          @amount,
          @timestamp
        )
      `)

      insertTransaction.run({
        projectUuid: session.projectUuid,
        playerUuid: session.playerUuid,
        eventUuid,
        amount: hasCompletedBefore ? activity.repeatValue : activity.value,
        timestamp
      })
    });

    transaction();

    reply.status(200).send({
      target: `/game/activity/${activityUuid}?claimedByEvent=${eventUuid}`
    })
  })

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

  done()
}