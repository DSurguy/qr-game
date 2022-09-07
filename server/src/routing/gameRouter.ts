import { DuelState, Duel, GameEvent, GamePlayer, GameProject, SavedActivity, SavedPlayer, SavedProject, UpdateDuelPayload, ChangeType, GameDuel } from "../qr-types";
import { FastifyPluginCallback } from "fastify"
import { playerToGame, projectToGame } from "../conversions/toGame";
import { ProjectSession } from "../types";
import { randomUUID } from "node:crypto";

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
  
  const activeDuelStates = [
    DuelState.Created,
    DuelState.Pending,
    DuelState.Accepted,
    DuelState.PendingCancel,
    DuelState.PendingInitiatorConfirm,
    DuelState.PendingRecipientConfirm
  ];

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Querystring: {
      state?: DuelState;
      active?: boolean;
      activity?: string;
    },
    Reply: GameDuel[] | { message: string; };
  }>('/duels', (req, reply) => {
    try {
      const parts = [`
        SELECT 
          pd.*,
          pa.uuid as 'activity.uuid',
          pa.name as 'activity.name',
          pa.value as 'activity.value',
          pa.isRepeatable as 'activity.isRepeatable',
          pa.repeatValue as 'activity.repeatValue'
        FROM project_duels pd LEFT JOIN project_activities pa WHERE
        pd.projectUuid=@projectUuid
          AND (pd.initiatorUuid=@playerUuid OR pd.recipientUuid=@playerUuid)
      `]
      if( req.query.state ) parts.push('AND state=@state')
      if( req.query.active !== undefined ) {
        const activeQuery = '('+activeDuelStates.map(state => `'${state}'`).join(',')+')'
        parts.push(`AND pd.state IN ${activeQuery}`)
      }
      if( req.query.activity ) {
        parts.push('AND pd.activityUuid=@activity')
      }
      const getDuels = app.db.prepare(parts.join(' '))
      const duels = getDuels.all({
        projectUuid: req.session.projectUuid,
        playerUuid: req.session.playerUuid,
        state: req.query.state,
        activity: req.query.activity
      });

      let gameDuels = duels.map(duel => {
        const transformedDuel = {
          activity: {}
        } as any;
        Object.keys(duel).forEach(key => {
          if( key.startsWith('activity.') ){
            transformedDuel.activity[key.split('.')[1]] = duel[key]
          }
          else transformedDuel[key] = duel[key]
        })
        return transformedDuel;
      })

      reply.status(200).send(gameDuels);
    } catch (e) {
      console.error(e.message);
      reply.status(500).send({ message: e.message });
    }
  })

  app.post<{
    Header: {
      authorization: string | undefined;
    },
    Body: {
      activityUuid: string;
    },
    Reply: Duel | { message: string };
  }>('/duels', (req, reply) => {
    try {
      if( !req.body.activityUuid ) {
        reply.status(400).send({ message: "activityUuid is required."});
        return;
      }
      const duelId = randomUUID();
      const timestamp = Date.now();
      const createDuel = app.db.prepare(`
        INSERT INTO project_duels (
          projectUuid,
          uuid,
          initiatorUuid,
          recipientUuid,
          activityUuid,
          state,
          victorUuid,
          createdAt,
          updatedAt,
          deleted
        ) VALUES (
          @projectUuid,
          @uuid,
          @initiatorUuid,
          null,
          @activityUuid,
          @state,
          null,
          @timestamp,
          @timestamp,
          0
        ) 
      `)
      createDuel.run({
        projectUuid: req.session.projectUuid,
        uuid: duelId,
        initiatorUuid: req.session.playerUuid,
        activityUuid: req.body.activityUuid,
        state: DuelState.Created,
        timestamp
      })
      const getDuel = app.db.prepare(`SELECT * FROM project_duels WHERE uuid=@uuid`)
      const duel = getDuel.get({
        projectUuid: req.session.projectUuid,
        uuid: duelId,
      })
      reply.status(201).send(duel);
    } catch (e) {
      console.error(e.message);
      reply.status(500).send({ message: e.message });
    }
  })

  app.put<{
    Header: {
      authorization: string | undefined;
    },
    Body: UpdateDuelPayload,
    Params: {
      duelId: string;
    },
    Reply: Duel | { message: string };
  }>('/duels/:duelId', (req, reply) => {
    try {
      const { duelId } = req.params;
      const timestamp = Date.now();
      const runTransaction = app.db.transaction(() => {
        const getDuel = app.db.prepare(`SELECT * FROM project_duels WHERE uuid=@uuid`)
        let duel = getDuel.get({
          uuid: duelId,
        }) as Duel;

        //TODO: Add events for every relevant change type
        switch(req.body.changeType) {
          case ChangeType.AddActivity: {
            const allowedStates = [
              DuelState.Created
            ]
            if( allowedStates.includes(duel.state) === false ){
              reply.status(400).send({ message: `Duel is not in the ${DuelState.Created} state`});
              return;
            }
            const { activityUuid } = req.body.payload;
            if( !activityUuid ) {
              reply.status(400).send({ message: "activityUuid is required."});
              return;
            }
            const updateDuel = app.db.prepare(`
              UPDATE project_duels SET
                activityUuid=@activityUuid
                updatedAt=@timestamp
              WHERE uuid=@duelId AND deleted=0
            `)
            updateDuel.run({
              duelId,
              activityUuid,
              timestamp
            })
            break;
          }
          case ChangeType.AddRecipient: {
            const allowedStates = [
              DuelState.Created
            ]
            if( allowedStates.includes(duel.state) === false ){
              reply.status(400).send({ message: `Duel is not in the ${DuelState.Created} state`});
              return;
            }
            const { recipientUuid } = req.body.payload;
            if( !recipientUuid ) {
              reply.status(400).send({ message: "recipientUuid is required."});
              return;
            }
            const updateDuel = app.db.prepare(`
              UPDATE project_duels SET
                recipientUuid=@recipientUuid,
                updatedAt=@timestamp,
                state=@state
              WHERE uuid=@duelId AND deleted=0
            `)
            const statementPayload: any = {
              duelId,
              recipientUuid,
              state: DuelState.Pending,
              timestamp
            }
            updateDuel.run({
              duelId,
              recipientUuid,
              state: DuelState.Pending,
              timestamp
            })
            break;
          }
          case ChangeType.RecipientConfirm: {
            const allowedStates = [
              DuelState.Pending
            ]
            if( allowedStates.includes(duel.state) === false ){
              reply.status(400).send({ message: `Duel is not in the ${DuelState.Pending} state`});
              return;
            }
            const { accepted } = req.body.payload;
            if( accepted === undefined ) {
              reply.status(400).send({ message: `accepted is a required property for change type ${req.body.changeType}`})
              return;
            }
            const update = app.db.prepare(`
              UPDATE project_duels SET
                state=@state,
                updatedAt=@timestamp
              WHERE uuid=@duelId AND deleted=0
            `)
            update.run({
              duelId,
              state: accepted ? DuelState.Accepted : DuelState.Rejected,
              timestamp
            })
            break;
          }
          case ChangeType.Cancel: {
            if( duel.initiatorUuid !== req.session.playerUuid ) {
              reply.status(401).send({
                message: "Only the duel initiator can cancel duels"
              })
              return;
            }
            const allowedStates = [
              DuelState.Created,
              DuelState.Pending,
              DuelState.Accepted
            ]
            if( allowedStates.includes(duel.state) === false ){
              reply.status(400).send({ message: `Duel is not in one of the following states: ${allowedStates.join(' ')}`});
              return;
            }
            const update = app.db.prepare(`
              UPDATE project_duels SET
                state=@state,
                updatedAt=@timestamp
              WHERE uuid=@duelId AND deleted=0
            `)
            let nextState: DuelState;
            if( duel.state === DuelState.Accepted ) nextState = DuelState.PendingCancel;
            else nextState = DuelState.Cancelled
            update.run({
              duelId,
              state: nextState,
              timestamp
            })
            break;
          }
          case ChangeType.CancelConfirm: {
            const { accepted } = req.body.payload;
            if( accepted === undefined ) {
              reply.status(400).send({ message: `accepted is a required property for change type ${req.body.changeType}`})
              return;
            }
            if( duel.recipientUuid !== req.session.playerUuid ) {
              reply.status(401).send({
                message: "Only the duel recipient can respond to a cancel request"
              })
              return;
            }
            const update = app.db.prepare(`
              UPDATE project_duels SET
                state=@state,
                updatedAt=@timestamp
              WHERE uuid=@duelId AND deleted=0
            `)
            update.run({
              duelId,
              state: accepted ? DuelState.Cancelled : DuelState.Accepted,
              timestamp
            })
            //TODO: insert event
            break;
          }
          case ChangeType.Victor: {
            const allowedStates = [
              DuelState.Accepted
            ]
            if( allowedStates.includes(duel.state) === false ){
              reply.status(400).send({ message: `Duel is not in the ${DuelState.Accepted} state`});
              return;
            }
            const { initiatorVictory } = req.body.payload;
            if( initiatorVictory === undefined ) {
              reply.status(400).send({ message: `initiatorVictory is a required property for change type ${req.body.changeType}`})
              return;
            }
            let nextState: DuelState;
            if( duel.initiatorUuid !== req.session.playerUuid )
              nextState = DuelState.PendingRecipientConfirm;
            else
              nextState = DuelState.PendingInitiatorConfirm;

            const update = app.db.prepare(`
              UPDATE project_duels SET
                state=@state,
                victorUuid=@victorUuid,
                updatedAt=@timestamp
              WHERE uuid=@duelId AND deleted=0
            `)
            update.run({
              duelId,
              state: nextState,
              victorUuid: initiatorVictory ? duel.initiatorUuid : duel.recipientUuid,
              timestamp
            })
            break;
          }
          case ChangeType.VictorConfirm: {
            const allowedStates = [
              DuelState.PendingInitiatorConfirm,
              DuelState.PendingRecipientConfirm
            ]
            if( allowedStates.includes(duel.state) === false ){
              reply.status(400).send({ message: `Duel is not in one of the following states: ${allowedStates.join(' ')}`});
              return;
            }

            if( duel.state === DuelState.PendingInitiatorConfirm ){
              if( req.session.playerUuid !== duel.initiatorUuid ){
                reply.status(401).send({ message: 'Expecting initiator to confirm result'})
                return;
              }
            }
            else {
              if( req.session.playerUuid !== duel.recipientUuid ){
                reply.status(401).send({ message: 'Expecting recipient to confirm result'})
                return;
              }
            }

            const { accepted } = req.body.payload;
            if( accepted === undefined ) {
              reply.status(400).send({ message: `accepted is a required property for change type ${req.body.changeType}`})
              return;
            }

            const nextState = req.body.payload.accepted ? DuelState.Complete : DuelState.Accepted;

            const update = app.db.prepare(`
              UPDATE project_duels SET
                state=@state,
                updatedAt=@timestamp
              WHERE uuid=@duelId AND deleted=0
            `)
            update.run({
              duelId,
              state: nextState,
              timestamp
            })

            break;
          }
          default: {
            reply.status(400).send({
              message: `${(req.body as any).changeType} is not a valid change type`
            })
            return;
          }
        }

        duel = getDuel.get({
          uuid: duelId,
        })
        reply.status(200).send(duel);
      })
      runTransaction();
    } catch (e) {
      console.error(e);
      reply.status(500).send({
        message: e.message
      })
    }
  })

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Reply: GamePlayer[] | { message: string };
  }>('/players', (req, reply) => {
    //TODO implement
    reply.status(200).send([])
  })

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Params: {
      playerUuid: string;
    },
    Reply: GamePlayer | { message: string };
  }>('/players/:playerUuid', (req, reply) => {
    try {
      const getPlayer = app.db.prepare(`
        SELECT * FROM project_players
        WHERE uuid=@uuid AND deleted=0
      `)
      const player = getPlayer.get({
        uuid: req.params.playerUuid
      }) as SavedPlayer
      reply.status(200).send(playerToGame(player))
    } catch (e) {
      console.error(e.message);
      reply.status(500).send({ message: e.message })
    }
  })

  done();
}