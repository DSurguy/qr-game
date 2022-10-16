import { Database } from "better-sqlite3";
import { GameEventType } from "../../../qr-types";

export function hasCompletedActivityBefore(db: Database, projectUuid: string, playerUuid: string, activityUuid: string): boolean {
  const getPreviousActivityEvent = db.prepare(`
    SELECT * FROM project_events WHERE projectUuid=@projectUuid AND type=@type AND primaryUuid=@primaryUuid AND secondaryUuid=@secondaryUuid
  `)
  const previousEvent = getPreviousActivityEvent.get({
    projectUuid,
    type: GameEventType.ActivityCompleted,
    primaryUuid: activityUuid,
    secondaryUuid: playerUuid
  })
  return !!previousEvent;
}

export function hasCompletedDuelActivityBefore(db: Database, projectUuid: string, playerUuid: string, activityUuid: string): boolean {
  const getPreviousActivityEvent = db.prepare(`
    SELECT * FROM project_events WHERE projectUuid=@projectUuid AND type=@type AND primaryUuid=@primaryUuid AND secondaryUuid=@secondaryUuid
  `)
  const previousEvents = getPreviousActivityEvent.all({
    projectUuid,
    type: GameEventType.DuelComplete,
    primaryUuid: playerUuid,
    secondaryUuid: activityUuid
  })
  return previousEvents.some(event => JSON.parse(event.payload)?.victor === playerUuid);
}