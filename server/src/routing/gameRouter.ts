import { DuelState, Duel, GameEvent, GamePlayer, GameProject, SavedActivity, SavedPlayer, SavedProject } from "../qr-types";
import { FastifyPluginCallback } from "fastify"
import { playerToGame, projectToGame } from "../conversions/toGame";
import { ProjectSession } from "../types";

// BASE /api/game/* <authenticated>
// GET  /api/game - project info
// GET  /api/game/me - current authenticated player info
// GET  /api/game/players - all claimed players
// GET  /api/game/players/:playerUuid - specific player info
export const gameRouter: FastifyPluginCallback = (app, options, done) => {
  app.addHook('onRequest', (request, reply, done) => {
    const sessionHeader = app.unsignCookie(request.headers.authorization);
    if( !sessionHeader.valid ) {
      reply.status(401).send();
      return;
    }

    const session = app.sessions.getSession(sessionHeader.value)
    if( !session ) {
      reply.status(401).send();
      return;
    }

    request.session = session;

    done();
  })

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Reply: GameProject | undefined;
  }>('/', (req, reply) => {
    try {
      const select = app.db.prepare('SELECT * FROM project_sessions WHERE sessionId=@sessionId')
      let possibleSession = select.get({ sessionId: req.session.sessionId });
      if( !possibleSession || !possibleSession.projectUuid ) {
        reply.status(401).send();
        return;
      }
      const session = possibleSession as ProjectSession;

      const getProject = app.db.prepare('SELECT * FROM projects WHERE uuid=@projectUuid AND deleted=0')
      const project = getProject.get({
        projectUuid: session.projectUuid
      }) as SavedProject | undefined;

      if( !project ) {
        reply.status(404).send();
        return;
      }

      else reply.status(200).send(projectToGame(project));
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Reply: GamePlayer | undefined;
  }>('/me', (req, reply) => {
    try {
      const select = app.db.prepare('SELECT * FROM project_sessions WHERE sessionId=@sessionId')
      let possibleSession = select.get({ sessionId: req.session.sessionId });
      if( !possibleSession || !possibleSession.projectUuid ) {
        reply.status(401).send();
        return;
      }
      const session = possibleSession as ProjectSession;

      const getPlayer = app.db.prepare(`
        SELECT * FROM project_players
        WHERE projectUuid=@projectUuid AND uuid=@playerUuid AND deleted=0
      `)
      const player = getPlayer.get({
        projectUuid: session.projectUuid,
        playerUuid: session.playerUuid
      }) as SavedPlayer | undefined;

      if( !player ) {
        reply.status(404).send();
        return;
      }

      reply.status(200).send(playerToGame(player));
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Reply: number | undefined;
  }>('/me/balance', (req, reply) => {
    try {
      const getPlayerBalance = app.db.prepare(`
        SELECT SUM(amount) as playerBalance FROM project_transactions
        WHERE projectUuid=@projectUuid AND playerUuid=@playerUuid
      `)
      let { playerBalance } = getPlayerBalance.get({
        projectUuid: req.session.projectUuid,
        playerUuid: req.session.playerUuid
      }) as { playerBalance: number } | undefined
      if( !playerBalance ) playerBalance = 0;

      reply.status(200).send(playerBalance);
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })

  app.get<{
    Params: {
      activityUuid: string;
    },
    Header: {
      authorization: string | undefined;
    },
    Reply: SavedActivity | undefined;
  }>('/activity/:activityUuid', (req, reply) => {
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

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Querystring: {
      state?: DuelState
    },
    Reply: Duel[] | undefined;
  }>('/duels', (req, reply) => {
    try {
      const parts = [
        `SELECT * FROM project_duels WHERE projectUuid=@projectUuid AND initiatorUuid=@playerUuid`
      ]
      if( req.query.state ) parts.push(' AND state=@state')
      const getDuels = app.db.prepare(parts.join(""))
      const duels = getDuels.all({
        projectUuid: req.session.projectUuid,
        playerUuid: req.session.playerUuid,
        state: req.query.state
      })

      if( duels ) reply.status(200).send(duels);
      else reply.status(404).send();
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })

  done();
}