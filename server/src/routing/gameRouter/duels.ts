import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { ChangeType, Duel, DuelState, GameDuel, PluginModifiedPayloadResponse, UpdateDuelPayload } from "../../qr-types";
import { confirmCancel, confirmVictor } from "./utils/completeDuel";

export function applyDuelRoutes(app: FastifyInstance) {

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
      recipient?: string;
      missingActivity?: boolean;
      missingRecipient?: boolean;
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
          pa.repeatValue as 'activity.repeatValue',
          pInit.uuid as 'initiator.uuid',
          pInit.wordId as 'initiator.wordId',
          pInit.name as 'initiator.name',
          pInit.realName as 'initiator.realName',
          rRecip.uuid as 'recipient.uuid',
          rRecip.wordId as 'recipient.wordId',
          rRecip.name as 'recipient.name',
          rRecip.realName as 'recipient.realName'
        FROM project_duels pd 
          LEFT JOIN project_activities pa ON pd.activityUuid = pa.uuid
          LEFT JOIN project_players pInit ON pd.initiatorUuid = pInit.uuid
          LEFT JOIN project_players rRecip ON pd.recipientUuid = rRecip.uuid
        WHERE
        pd.projectUuid=@projectUuid
          AND (pd.initiatorUuid=@playerUuid OR pd.recipientUuid=@playerUuid)
      `]
      if( req.query.state ) parts.push('AND state=@state')
      if( req.query.active !== undefined ) {
        const activeQuery = 'AND pd.state IN ('
          + activeDuelStates.map(state => `'${state}'`).join(',')
          + ')';
        parts.push(activeQuery)
      }
      if( req.query.activity ) {
        parts.push('AND pd.activityUuid=@activity')
      }
      if( req.query.recipient ) {
        parts.push('AND pd.recipientUuid=@recipient')
      }
      if( req.query.missingActivity ) {
        parts.push('AND pd.activityUuid IS NULL')
      }
      if( req.query.missingRecipient ) {
        parts.push('AND pd.recipientUuid IS NULL')
      }
      const getDuels = app.db.prepare(parts.join(' '))
      const duels = getDuels.all({
        projectUuid: req.session.projectUuid,
        playerUuid: req.session.playerUuid,
        state: req.query.state,
        activity: req.query.activity,
        recipient: req.query.recipient
      });

      let gameDuels = duels.map(duel => {
        const transformedDuel = {
          activity: {},
          initiator: {},
          recipient: {}
        } as any;
        Object.keys(duel).forEach(key => {
          if( key.startsWith('activity.') ){
            transformedDuel.activity[key.split('.')[1]] = duel[key]
          }
          if( key.startsWith('initiator.') ){
            transformedDuel.initiator[key.split('.')[1]] = duel[key]
          }
          if( key.startsWith('recipient.') ){
            transformedDuel.recipient[key.split('.')[1]] = duel[key]
          }
          else transformedDuel[key] = duel[key]
        })
        return transformedDuel;
      })

      const selectTags = app.db.prepare(`
        SELECT * FROM duel_tags
        WHERE projectUuid=@projectUuid AND duelUuid IN (${
          gameDuels.map((duel, index) => `@${index}`).join(',')
        })
      `)
      const tags = selectTags.all({
        projectUuid: req.session.projectUuid,
        ...gameDuels.reduce((aggregate, duel, index) => {
          aggregate[index] = duel.uuid;
          return aggregate;
        }, {})
      })
      const tagsByDuelUuid = tags.reduce((aggregate, tag) => {
        if( !aggregate[tag.duelUuid] ) aggregate[tag.duelUuid] = [];
        aggregate[tag.duelUuid].push({
          tag: tag.tag,
          value: tag.value
        })
        return aggregate;
      }, {})
      gameDuels.forEach(duel => {
        duel.tags = tagsByDuelUuid[duel.uuid] || [];
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
      recipientUuid?: string;
      activityUuid?: string;
    },
    Reply: Duel | { message: string };
  }>('/duels', (req, reply) => {
    try {
      if( !req.body.activityUuid && !req.body.recipientUuid ) {
        reply.status(400).send({ message: "activityUuid or recipientUuid is required."});
        return;
      }

      //Reject if recipient is provided and the player is already dueling them
      if( req.body.recipientUuid ) {
        const selectMatchingDuel = app.db.prepare(`
          SELECT * FROM project_duels
          WHERE
            recipientUuid=@recipientUuid 
            AND initiatorUuid=@initiatorUuid
            AND state IN (${
              activeDuelStates.map(state => `'${state}'`).join(',')
            })
        `)
        const activeDuel = selectMatchingDuel.get({
          recipientUuid: req.body.recipientUuid,
          initiatorUuid: req.session.playerUuid
        });
        if( activeDuel ) {
          reply.status(400).send({
            message: 'You are already dueling this player'
          })
          return;
        }
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
          @recipientUuid,
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
        recipientUuid: req.body.recipientUuid || null,
        activityUuid: req.body.activityUuid || null,
        state: req.body.recipientUuid && req.body.activityUuid ? DuelState.Pending : DuelState.Created,
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
    Reply: { duel: Duel } & PluginModifiedPayloadResponse | { message: string };
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

            //Determine if the session user already has a duel with this player
            const selectMatchingDuel = app.db.prepare(`
              SELECT * FROM project_duels
              WHERE
                (recipientUuid=@recipientUuid 
                  OR initiatorUuid=@recipientUuid)
                AND (recipientUuid=@playerUuid 
                  OR initiatorUuid=@playerUuid)
                AND state IN (${
                  activeDuelStates.map(state => `'${state}'`).join(',')
                })
            `)
            const activeDuel = selectMatchingDuel.get({
              recipientUuid: req.body.payload.recipientUuid,
              playerUuid: req.session.playerUuid
            });
            if( activeDuel ) {
              reply.status(400).send({
                message: 'You are already dueling this player'
              })
              return;
            }

            const updateDuel = app.db.prepare(`
              UPDATE project_duels SET
                recipientUuid=@recipientUuid,
                updatedAt=@timestamp,
                state=@state
              WHERE uuid=@duelId AND deleted=0
            `)
            updateDuel.run({
              duelId,
              recipientUuid,
              state: DuelState.Pending,
              timestamp
            })
            break;
          }
          case ChangeType.AddActivity: {
            const { activityUuid } = req.body.payload;
            if( !activityUuid ) {
              reply.status(400).send({ message: "activityUuid is required."});
              return;
            }
            const updateDuel = app.db.prepare(`
              UPDATE project_duels SET
                activityUuid=@activityUuid,
                updatedAt=@timestamp,
                state=@state
              WHERE projectUuid=@projectUuid AND uuid=@duelUuid
            `)
            updateDuel.run({
              projectUuid: req.session.projectUuid,
              duelUuid: duelId,
              activityUuid,
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
            const error = confirmCancel(req.session, app.db, duelId, req.body)
            if( error ) {
              reply.status(error.statusCode).send({
                message: error.message
              })
            }
            else {
              duel = getDuel.get({
                uuid: duelId,
              })
              const hookResponses = app.plugins.runDuelCancelledHook({
                session: req.session,
                db: app.db,
                duel
              })

              reply.status(200).send({
                duel,
                hooks: {
                  duelCancelled: hookResponses
                }
              });
            }
            return;
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
            if( duel.initiatorUuid === req.session.playerUuid )
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
            const error = confirmVictor(req.session, app, duelId, req.body)
            if( error ) {
              reply.status(error.statusCode).send({
                message: error.message
              })
            }
            else {
              duel = getDuel.get({
                uuid: duelId,
              })
              const hookResponses = app.plugins.runDuelCompleteHook({
                session: req.session,
                db: app.db,
                duel
              })

              reply.status(200).send({
                duel,
                hooks: {
                  duelComplete: hookResponses
                }
              });
            }
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
        reply.status(200).send({
          duel,
          hooks: {}
        });
      })
      runTransaction();
    } catch (e) {
      console.error(e);
      reply.status(500).send({
        message: e.message
      })
    }
  })
}