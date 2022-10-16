import { Database } from "better-sqlite3";
import { randomUUID } from "crypto";
import { ChangeType, Duel, DuelState, GameEventType, SavedActivity, UpdateDuelCancelConfirmPayload, UpdateDuelVictorConfirmPayload } from "../../../qr-types";
import { GameSession } from "../../../types";
import { hasCompletedDuelActivityBefore } from "./hasCompletedBefore";

class ErrorWithStatusCode extends Error {
  constructor(message: string, public statusCode: number){ super(message) }
}

type RouteMethodResponse = {
  statusCode: number;
  message: string;
}

export function confirmCancel(session: GameSession, db: Database, duelId: string, payload: UpdateDuelCancelConfirmPayload): RouteMethodResponse | void {
  const transaction = db.transaction(() => {
    const getDuel = db.prepare(`SELECT * FROM project_duels WHERE uuid=@uuid`)
    let duel = getDuel.get({
      uuid: duelId,
    }) as Duel;

    const { accepted } = payload.payload;
    if( accepted === undefined ) {
      throw new ErrorWithStatusCode(`accepted is a required property for change type ${ChangeType.CancelConfirm}`, 400)
    }

    if( duel.recipientUuid !== session.playerUuid ) {
      throw new ErrorWithStatusCode("Only the duel recipient can respond to a cancel request", 401)
    }

    const timestamp = Date.now();

    const update = db.prepare(`
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

    const initiatorEventUuid = randomUUID();
    const recipientEventUuid = randomUUID();

    const insert = db.prepare(`
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
      uuid: initiatorEventUuid,
      type: GameEventType.DuelComplete,
      payload: JSON.stringify({
        cancelled: true
      }),
      primaryUuid: duel.initiatorUuid,
      secondaryUuid: duel.activityUuid,
      timestamp
    })

    insert.run({
      projectUuid: session.projectUuid,
      uuid: recipientEventUuid,
      type: GameEventType.DuelComplete,
      payload: JSON.stringify({
        cancelled: true
      }),
      primaryUuid: duel.recipientUuid,
      secondaryUuid: duel.activityUuid,
      timestamp
    })

  })

  try {
    transaction();
  } catch (e: unknown) {
    let error = e as ErrorWithStatusCode;
    return {
      statusCode: error.statusCode || 500,
      message: error.message
    }
  }
}

export function confirmVictor(session: GameSession, db: Database, duelId: string, payload: UpdateDuelVictorConfirmPayload): RouteMethodResponse | void {
  const transaction = db.transaction(() => {
    const getDuel = db.prepare(`SELECT * FROM project_duels WHERE uuid=@uuid`)
    let duel = getDuel.get({
      uuid: duelId,
    }) as Duel;

    const allowedStates = [
      DuelState.PendingInitiatorConfirm,
      DuelState.PendingRecipientConfirm
    ]

    if( allowedStates.includes(duel.state) === false ){
      throw new ErrorWithStatusCode(`Duel is not in one of the following states: ${allowedStates.join(' ')}`, 400);
    }

    if( duel.state === DuelState.PendingInitiatorConfirm ){
      if( session.playerUuid !== duel.initiatorUuid ){
        throw new ErrorWithStatusCode('Expecting initiator to confirm result', 401);
      }
    }
    else {
      if( session.playerUuid !== duel.recipientUuid ){
        throw new ErrorWithStatusCode('Expecting recipient to confirm result', 401)
      }
    }

    const { accepted } = payload.payload;
    if( accepted === undefined ) {
      throw new ErrorWithStatusCode(`accepted is a required property for change type ${ChangeType.VictorConfirm}`, 400)
    }

    const nextState = accepted ? DuelState.Complete : DuelState.Accepted;

    const timestamp = Date.now();

    const update = db.prepare(`
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

    const getActivity = db.prepare(`SELECT * FROM project_activities WHERE projectUuid=@projectUuid AND uuid=@activityUuid AND deleted=0`)
    const activity = getActivity.get({
      projectUuid: session.projectUuid,
      activityUuid: duel.activityUuid
    }) as SavedActivity

    const hasCompletedBefore = hasCompletedDuelActivityBefore(db, session.projectUuid, duel.victorUuid, duel.activityUuid)

    const insert = db.prepare(`
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

    const initiatorEventUuid = randomUUID();
    const recipientEventUuid = randomUUID();

    insert.run({
      projectUuid: session.projectUuid,
      uuid: initiatorEventUuid,
      type: GameEventType.DuelComplete,
      payload: JSON.stringify({
        victor: duel.victorUuid
      }),
      primaryUuid: duel.initiatorUuid,
      secondaryUuid: duel.activityUuid,
      timestamp
    })

    insert.run({
      projectUuid: session.projectUuid,
      uuid: recipientEventUuid,
      type: GameEventType.DuelComplete,
      payload: JSON.stringify({
        victor: duel.victorUuid
      }),
      primaryUuid: duel.recipientUuid,
      secondaryUuid: duel.activityUuid,
      timestamp
    })

    const insertTransaction = db.prepare(`
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
      playerUuid: duel.victorUuid,
      eventUuid: duel.victorUuid === duel.initiatorUuid ? initiatorEventUuid : recipientEventUuid,
      amount: hasCompletedBefore ? activity.repeatValue : activity.value,
      timestamp
    })

  })

  try {
    transaction();
  } catch (e: unknown) {
    let error = e as ErrorWithStatusCode;
    return {
      statusCode: error.statusCode || 500,
      message: error.message
    }
  }
}