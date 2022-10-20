import { randomUUID } from 'node:crypto';
import { ActivityCompletedEventPayload, GameEventType, SavedActivity } from '../qr-types';
import { PortalActivityHookHandler, PortalActivityHookPayload, QrGamePlugin } from './pluginTypes';

enum ClaimType {
  none,
  new,
  repeat
}

const claimActivity = ({ db, session, activity }: PortalActivityHookPayload, amount: number, isRepeat: boolean) => {
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

const getActivityClaimType = ({ db, session, activity }: PortalActivityHookPayload): ClaimType => {
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

const handleIfSession: PortalActivityHookHandler = payload => {
  const claimType = getActivityClaimType(payload);
  if( claimType === ClaimType.none ) return;
  else {
    const isRepeat = claimType === ClaimType.repeat;
    const amount = isRepeat ? payload.activity.repeatValue : payload.activity.value;
    claimActivity(payload, amount, isRepeat);
    return {
      message: getMessage(payload.activity, amount, isRepeat),
      icon: 'diamond'
    }
  }
}

export const createClaimActivityPlugin = (): QrGamePlugin => ({ addPortalActivityHook }) => {
  addPortalActivityHook(handleIfSession);
}