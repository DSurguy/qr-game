import { randomUUID } from 'node:crypto';
import { Database } from 'better-sqlite3';
import { DuelState, SavedPlayer, Tag } from '../qr-types';
import { toTitleCase } from '../utils/toTitleCase';
import { QrGamePlugin, ItemRedemptionHookHandler, ItemRedemptionHookPayload, ItemPreRedemptionHookPayload, ItemPreRedemptionHookHandler, DuelCompleteHookHandler, DuelCancelledHookHandler } from './pluginTypes';

export const QUEEN_TAG = 'queen';

const getDuelTags = (db: Database, projectUuid: string, duelUuid: string): Tag[] => {
  return db.prepare(`
    SELECT * FROM duel_tags
    WHERE projectUuid=@projectUuid AND duelUuid=@duelUuid
  `).all({ projectUuid, duelUuid })
}

const setupQueenDuel = (db: Database, projectUuid: string, initiatorUuid: string, recipientUuid: string, queenType: string) => {
  const duelUuid = randomUUID();
  const timestamp = Date.now();
  const createDuel = db.prepare(`
    INSERT INTO project_duels (
      projectUuid,
      uuid,
      initiatorUuid,
      recipientUuid,
      state,
      createdAt,
      updatedAt,
      deleted
    ) VALUES (
      @projectUuid,
      @duelUuid,
      @initiatorUuid,
      @recipientUuid,
      @state,
      @timestamp,
      @timestamp,
      0
    ) 
  `)
  createDuel.run({
    projectUuid,
    duelUuid,
    initiatorUuid,
    recipientUuid,
    state: DuelState.Created,
    timestamp
  })

  const createDuelTag = db.prepare(`
    INSERT INTO duel_tags (
      projectUuid,
      duelUuid,
      tag,
      value
    ) VALUES (
      @projectUuid,
      @duelUuid,
      @tag,
      @value
    )
  `)
  createDuelTag.run({
    projectUuid,
    duelUuid,
    tag: QUEEN_TAG,
    value: queenType
  })
}

const addQueenTag = (db: Database, projectUuid: string, playerUuid: string, queenType: string) => {
  const insertTag = db.prepare(`
    INSERT INTO player_tags (
      projectUuid,
      playerUuid,
      tag,
      value
    ) VALUES (
      @projectUuid,
      @playerUuid,
      @tag,
      @value
    )
  `)
  insertTag.run({
    projectUuid,
    playerUuid,
    tag: QUEEN_TAG,
    value: queenType
  })
}

const getCurrentQueen = (db: Database, queenType: string): SavedPlayer | undefined => {
  const select = db.prepare(`
    SELECT pp.* 
    FROM player_tags pt 
    LEFT JOIN project_players pp 
      ON pt.projectUuid = pp.projectUuid AND pt.playerUuid = pp.uuid
    WHERE tag = @tag AND value = @queenType
  `)
  return select.get({ tag: QUEEN_TAG, queenType })
}

const handleRedemption: ItemRedemptionHookHandler = (payload) => {
  const duelTag = payload.tags.find(tag => tag.tag === QUEEN_TAG);
  if( duelTag ){
    const queenType = duelTag.value;
    const currentQueen = getCurrentQueen(payload.db, queenType);

    if( currentQueen ) {
      //setup the duel
      setupQueenDuel(
        payload.db,
        payload.session.projectUuid,
        payload.session.playerUuid,
        currentQueen.uuid,
        queenType
      );
      return {
        message: `You are now dueling ${'player'} for the right to wear the ${'queen type'} crown! Find them and select a duel activity, and then FIGHT!`,
        icon: 'swords'
      }
    }
    else {
      //claim the crown
      addQueenTag(payload.db, payload.session.projectUuid, payload.session.playerUuid, queenType);
      return {
        message: `You have earned the right to claim the ${toTitleCase(queenType)} crown! Find a gamemaster to assist you in performing the coronation ceremony.`,
        icon: 'crown'
      }
    }
  }
}

const getCurrentDuelingType = ({ db, session: { projectUuid, playerUuid }}: ItemPreRedemptionHookPayload) => {
  const selectDuelTags = db.prepare(`
    SELECT dt.*
    FROM duel_tags dt
    LEFT JOIN project_duels pd
    ON
      dt.duelUuid = pd.uuid
    WHERE
      dt.tag=@queenTag AND
      pd.projectUuid=@projectUuid AND
      ( pd.initiatorUuid=@playerUuid OR pd.recipientUuid=@playerUuid )
  `)
  const tag = selectDuelTags.get({
    projectUuid,
    playerUuid,
    queenTag: QUEEN_TAG
  });
  return tag?.value;
}

const getCurrentPlayerQueenType = ({ db, session: { projectUuid, playerUuid }}: ItemPreRedemptionHookPayload): string | undefined => {
  const selectPlayerTags = db.prepare(`
    SELECT * FROM player_tags
    WHERE
      tag=@queenTag AND
      projectUuid=@projectUuid AND
      playerUuid=@playerUuid
  `)
  const tag = selectPlayerTags.get({
    projectUuid,
    playerUuid,
    queenTag: QUEEN_TAG
  });
  return tag?.value;
}

const getCurrentDuelingPlayer = ({ db, session: { projectUuid }, tags }: ItemPreRedemptionHookPayload): string | undefined => {
  const itemQueenType = tags.find(tag => tag.tag === 'queen').value;
  const selectPlayerName = db.prepare(`
    SELECT pp.name as name FROM duel_tags dt
    LEFT JOIN project_duels pd
    LEFT JOIN project_players pp
    ON
      dt.duelUuid = pd.uuid AND pd.projectUuid=@projectUuid AND
      pd.initiatorUuid = pp.uuid AND pp.projectUuid=@projectUuid
    WHERE
      dt.projectUuid=@projectUuid AND
      dt.tag = @queenTag AND
      dt.value = @queenType
  `)
  return selectPlayerName.get({
    projectUuid,
    queenTag: QUEEN_TAG,
    queenType: itemQueenType
  })?.name
}

const handlePreRedemption: ItemPreRedemptionHookHandler = (payload: ItemPreRedemptionHookPayload) => {
  const itemQueenType = payload.tags.find(tag => tag.tag === 'queen')?.value;
  if( !itemQueenType ) return;

  const currentQueenType = getCurrentPlayerQueenType(payload)
  if(
    currentQueenType
  ) {
    return {
      failure: true,
      failureReason: `You are already the ${toTitleCase(currentQueenType)} queen`
    }
  }

  const currentQueenDuelType = getCurrentDuelingType(payload)
  if(
    currentQueenDuelType
  ) {
    return {
      failure: true,
      failureReason: `You are already dueling for the right to be ${toTitleCase(currentQueenDuelType)} queen`
    }
  }

  const currentDuelingPlayer = getCurrentDuelingPlayer(payload);
  if( currentDuelingPlayer ) {
    return {
      failure: true,
      failureReason: `${currentDuelingPlayer} is already dueling for the right to be ${toTitleCase(itemQueenType)} queen.\n\nOnce their duel is complete, you can redeem this item and duel the current queen.`
    }
  }
}

const handleDuelComplete: DuelCompleteHookHandler = (payload) => {
  const tags = getDuelTags(payload.db, payload.session.projectUuid, payload.duel.uuid)
  const duelTag = tags.find(tag => tag.tag === QUEEN_TAG);
  if( !duelTag ) return;
  
  const queenType = duelTag.value;
  const [victorUuid, loserUuid] = payload.duel.victorUuid === payload.duel.initiatorUuid 
    ? [payload.duel.initiatorUuid, payload.duel.recipientUuid]
    : [payload.duel.recipientUuid, payload.duel.initiatorUuid];

  payload.db.prepare(`
    DELETE FROM player_tags
    WHERE
      projectUuid=@projectUuid AND
      playerUuid=@playerUuid AND
      tag=@queenTag
  `).run({
    projectUuid: payload.session.projectUuid,
    playerUuid: loserUuid,
    queenTag: QUEEN_TAG
  })
  
  payload.db.prepare(`
    INSERT INTO player_tags (
      projectUuid,
      playerUuid,
      tag,
      value
    ) VALUES (
      @projectUuid,
      @playerUuid,
      @tag,
      @value
    )
  `).run({
    projectUuid: payload.session.projectUuid,
    playerUuid: victorUuid,
    tag: QUEEN_TAG,
    value: queenType
  })

  if( payload.session.playerUuid === payload.duel.victorUuid ) {
    if( payload.session.playerUuid === payload.duel.initiatorUuid ) {
      return {
        message: `You have defeated the ${toTitleCase(queenType)} Queen, and earned the right to wear the crown. Claim your prize!`,
        icon: 'crown'
      }
    }
    else return {
      message: `You have defended the ${toTitleCase(queenType)} Queen crown. Flaunt your victory!`,
      icon: 'crown'
    }
  } else {
    if( payload.session.playerUuid === payload.duel.initiatorUuid ) {
      return {
        message: `You have failed to capture the ${toTitleCase(queenType)} Queen crown. You are ashamed, and must earn more points to purchase another attempt at the crown.`,
        icon: 'crown-off'
      }
    }
    else return {
      message: `You have been defeated, and have lost the right to wear the ${toTitleCase(queenType)} Queen crown. Relinquish your throne to the victor!`,
      icon: 'crown-off'
    }
  }
}

const handleDuelCancelled: DuelCancelledHookHandler = (payload) => {
  const tags = getDuelTags(payload.db, payload.session.projectUuid, payload.duel.uuid)
  const duelTag = tags.find(tag => tag.tag === QUEEN_TAG);
  if( !duelTag ) return;
  
  const queenType = duelTag.value;
  
  const selectItem = payload.db.prepare(`
    SELECT itemUuid FROM store_item_tags
    WHERE tag=@queenTag AND value=@queenType
  `)
  const itemUuid = selectItem.get({
    queenTag: QUEEN_TAG,
    queenType
  }).itemUuid

  payload.db.prepare(`
    UPDATE project_player_inventory
    SET quantityRedeemed = quantityRedeemed - 1
    WHERE
      projectUuid=@projectUuid AND
      playerUuid=@playerUuid AND
      itemUuid=@itemUuid
  `).run({
    projectUuid: payload.session.projectUuid,
    playerUuid: payload.duel.initiatorUuid,
    itemUuid
  })
  
  if( payload.session.playerUuid === payload.duel.initiatorUuid )
    return {
      message: `You have cancelled your duel with the ${toTitleCase(queenType)} Queen. Your item has been restored.`
    }
  else
    return {
      message: `The duel against you has been cancelled, and you retain your crown. The other player's item has been restored.`
    }
}

export const createQueenPlugin = (): QrGamePlugin => ({
  addItemRedemptionHook,
  addItemPreRedemptionHook,
  addDuelCompleteHook,
  addDuelCancelledHook
}) => {
  addItemPreRedemptionHook(handlePreRedemption);
  addItemRedemptionHook(handleRedemption);
  addDuelCompleteHook(handleDuelComplete);
  addDuelCancelledHook(handleDuelCancelled);
}