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
  let amount = parseInt(tags.find(tag => tag.tag === TAG_NAME)?.value);
  if( isNaN(amount) ) amount = 0;
  createPointTransaction(
    db,
    session.projectUuid,
    session.playerUuid,
    redemptionEventUuid,
    amount
  )
  return amount;
}

const handleIfTagPresent: ItemRedemptionHookHandler = (payload) => {
  if( payload.tags.some(tag => tag.tag === TAG_NAME) ){
    const amount = givePointsOnRedeem(payload);
    return {
      message: `You received ${amount} points for redeeming ${payload.item.name}!`,
      icon: 'award'
    }
  }
}

export const createRedemptionPointsPlugin = (): QrGamePlugin => ({ addItemRedemptionHook }) => {
  addItemRedemptionHook(handleIfTagPresent);
}