import { Database } from "better-sqlite3";
import { randomUUID } from "crypto";
import { ActivityCompletedEventPayload, GameEventType, SavedActivity } from "../../../qr-types";
import { GameSession } from "../../../types";

export enum ClaimType {
  none,
  new,
  repeat
}

const createEventAndTransaction = (activity: SavedActivity, db: Database, session: GameSession, amount: number, isRepeat: boolean) => {
  const eventUuid = randomUUID();
  const eventPayload: ActivityCompletedEventPayload = {
    playerUuid: session.playerUuid,
    activityUuid: activity.uuid,
    isRepeat,
    amount
  }
  const timestamp = Date.now();

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
    uuid: eventUuid,
    type: GameEventType.ActivityCompleted,
    payload: JSON.stringify(eventPayload),
    primaryUuid: activity.uuid,
    secondaryUuid: session.playerUuid,
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
    playerUuid: session.playerUuid,
    eventUuid,
    amount: isRepeat ? activity.repeatValue : activity.value,
    timestamp
  })
}

export const getActivityClaimType = (activity: SavedActivity, db: Database, session: GameSession): ClaimType => {
  const selectEvents = db.prepare(`
    SELECT * FROM project_events
    WHERE
      projectUuid=@projectUuid AND
      primaryUuid=@activityUuid AND
      secondaryUuid=@playerUuid AND
      type=@eventType
  `)
  const event = selectEvents.get({
    projectUuid: session.projectUuid,
    activityUuid: activity.uuid,
    playerUuid: session.playerUuid,
    eventType: GameEventType.ActivityCompleted
  })

  if( event ) {
    if( activity.isRepeatable ) {
      return ClaimType.repeat;
    }
    else return ClaimType.none;
  } else {
    return ClaimType.new;
  }
}

const getMessage = (activity: SavedActivity, amount: number, isRepeat: boolean) => {
  const parts = [`You have claimed ${activity.name} for ${amount} points!`];
  if( isRepeat ) {
    //TODO: cooldown tag
    parts.push(`You can claim this item again later for ${activity.repeatValue} more points.`)
  }
  return parts.join('\n\n');
}

export function claimActivity(activity: SavedActivity, db: Database, session: GameSession, claimType: ClaimType) {
    if( claimType === ClaimType.none ) return;
    else {
      const isRepeat = claimType === ClaimType.repeat;
      const amount = isRepeat ? activity.repeatValue : activity.value;
      createEventAndTransaction(activity, db, session, amount, isRepeat);
      return {
        message: getMessage(activity, amount, isRepeat),
        icon: 'diamond'
      }
    }
}