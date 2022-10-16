import { Database } from 'better-sqlite3';
import { QrGamePlugin, ItemRedemptionHookHandler, ItemRedemptionHookPayload } from './pluginTypes';

const TAG_NAME = 'redeem-points';

const createPointTransaction = (db: Database, projectUuid: string, playerUuid: string, eventUuid: string, amount: number): string => {
  const timestamp = Date.now();

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
    projectUuid,
    playerUuid,
    eventUuid,
    amount,
    timestamp
  })

  return eventUuid;
}

const givePointsOnRedeem = ({ db, session, redemptionEventUuid, tags}: ItemRedemptionHookPayload) => {
  const amount = parseInt(tags.find(tag => tag.tag === TAG_NAME)?.value);
  createPointTransaction(
    db,
    session.projectUuid,
    session.playerUuid,
    redemptionEventUuid,
    isNaN(amount) ? 0 : amount
  )
}

const handleIfTagPresent: ItemRedemptionHookHandler = (payload) => {
  if( payload.tags.some(tag => tag.tag === TAG_NAME) ){
    givePointsOnRedeem(payload);
  }
}

export const createRedemptionPointsPlugin = (): QrGamePlugin => ({ addItemRedemptionHook }) => {
  addItemRedemptionHook(handleIfTagPresent);
}