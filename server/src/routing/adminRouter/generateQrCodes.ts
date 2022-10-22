import { toDataURL } from 'qrcode';
// @ts-ignore
import JSPDF from 'jspdf/dist/jspdf.node';
import { Database } from 'better-sqlite3';
import { QrGenerationPayload, ProjectItem, SavedPlayer, SavedActivity, ProjectSettings } from '../../qr-types';

const cardRatio = 3.5/2.5
const cardWidth = 2;
const cardHeight = 2*cardRatio;

const letterSizeRatio = 279/216; //in mm
const ptScale = 1000 / 279
const millisPerPoint = 0.352778 * ptScale;

const numBlocks = 3;
const blocksPerPage = numBlocks*numBlocks;
const blockWidth = 250;
const blockHeight = 350;
const qrSize = 200;
const gap = 10;
const margin = (1000 - (blockWidth * numBlocks + gap * (numBlocks - 1) ))/2;

const getData = (projectUuid: string, db: Database, payload: QrGenerationPayload): [players: SavedPlayer[], items: ProjectItem[], activities: SavedActivity[]] => {
  let players: SavedPlayer[], items: ProjectItem[], activities: SavedActivity[];

  if( payload.includePlayers ) {
    let playerSelectPayload = `
      SELECT * FROM project_players
      WHERE deleted = 0 AND projectUuid=@projectUuid
    `
    let dbPayload = { projectUuid } as Record<string|number, string>;
    if( payload.players?.length ) {
      playerSelectPayload += ` AND uuid IN (${
        payload.players.map((player, index) => `@${index}`).join(', ')
      })`
      payload.players.forEach((player, index) => dbPayload[index] = player.uuid);
    }
    players = db.prepare(playerSelectPayload).all(dbPayload)
  }

  if( payload.includeItems ) {
    let itemSelectPayload = `
      SELECT * FROM project_store_items
      WHERE deleted = 0 AND projectUuid=@projectUuid
      ORDER BY name
    `
    let dbPayload = { projectUuid } as Record<string|number, string>;
    if( payload.items?.length ) {
      itemSelectPayload += ` AND uuid IN (${
        payload.items.map((item, index) => `@${index}`).join(', ')
      })`
      payload.items.forEach((item, index) => dbPayload[index] = item.uuid);
    }
    items = db.prepare(itemSelectPayload).all(dbPayload)
  }

  if( payload.includeActivities ) {
    let activitySelectPayload = `
      SELECT * FROM project_activities
      WHERE deleted = 0 AND projectUuid=@projectUuid
      ORDER BY isDuel, name
    `
    let dbPayload = { projectUuid } as Record<string|number, string>;
    if( payload.activities?.length ) {
      activitySelectPayload += ` AND uuid IN (${
        payload.activities.map((activity, index) => `@${index}`).join(', ')
      })`
      payload.activities.forEach((activity, index) => dbPayload[index] = activity.uuid);
    }
    activities = db.prepare(activitySelectPayload).all(dbPayload)
  }

  return [players, items, activities]
}

const getGameClientHost = (projectUuid: string, db: Database): string => {
  const selectSettings = db.prepare(`
    SELECT * FROM project_settings
    WHERE uuid=@projectUuid
  `)
  const settings = selectSettings.get({ projectUuid });
  const { gameClientHost } = JSON.parse(settings.jsonData) as ProjectSettings;
  return gameClientHost;
}

const renderPlayerToDoc = async (doc: JSPDF, player: SavedPlayer, gameClientHost: string, blockXPos: number, blockYPos: number): Promise<void> => {
  let qrCodeDataUrl;
  try {
    qrCodeDataUrl = await toDataURL(
      `${gameClientHost}/portal?type=player&projectUuid=${player.projectUuid}&uuid=${player.uuid}`,
      { margin: 1 }
    )
  } catch (e) {
    console.log("Error creating qr code data url");
    throw e;
  }
  doc.setFillColor('black')
  doc.rect(blockXPos, blockYPos, blockWidth, blockHeight, 'S')

  doc.setFontSize(60)
  doc.text(
    'PLAYER',
    blockXPos + blockWidth/2,
    blockYPos + 30,
    {
      align: 'center',
      baseline: 'middle'
    }
  )

  doc.addImage(
    qrCodeDataUrl,
    'JPEG',
    blockXPos + blockWidth/2 - qrSize/2,
    blockYPos + blockHeight/2 - qrSize/2,
    qrSize,
    qrSize
  )
  
  doc.setFontSize(40)
  doc.text(
    player.wordId,
    blockXPos + blockWidth/2,
    blockYPos + blockHeight - 30,
    {
      align: 'center',
      baseline: 'middle'
    }
  )
}

const renderItemToDoc = async (doc: JSPDF, item: ProjectItem, gameClientHost: string, blockXPos: number, blockYPos: number): Promise<void> => {
  let qrCodeDataUrl;
  try {
    qrCodeDataUrl = await toDataURL(
      `${gameClientHost}/portal?type=item&projectUuid=${item.projectUuid}&uuid=${item.uuid}`,
      { margin: 1 }
    )
  } catch (e) {
    console.log("Error creating qr code data url");
    throw e;
  }
  doc.setFillColor('black')
  doc.rect(blockXPos, blockYPos, blockWidth, blockHeight, 'S')

  doc.setFontSize(60)
  doc.text(
    'ITEM',
    blockXPos + blockWidth/2,
    blockYPos + 30,
    {
      align: 'center',
      baseline: 'middle'
    }
  )

  doc.addImage(
    qrCodeDataUrl,
    'JPEG',
    blockXPos + blockWidth/2 - qrSize/2,
    blockYPos + blockHeight/2 - qrSize/2,
    qrSize,
    qrSize
  )

  doc.setFontSize(50)
  doc.text(
    item.name,
    blockXPos + blockWidth/2,
    blockYPos + blockHeight - 40,
    {
      align: 'center',
      baseline: 'middle',
      maxWidth: 220
    }
  )
}

const renderActivityToDoc = async (doc: JSPDF, activity: SavedActivity, gameClientHost: string, blockXPos: number, blockYPos: number): Promise<void> => {
  let qrCodeDataUrl;
  try {
    qrCodeDataUrl = await toDataURL(
      `${gameClientHost}/portal?type=activity&projectUuid=${activity.projectUuid}&uuid=${activity.uuid}`,
      { margin: 1 }
    )
  } catch (e) {
    console.log("Error creating qr code data url");
    throw e;
  }
  doc.setFillColor('black')
  doc.rect(blockXPos, blockYPos, blockWidth, blockHeight, 'S')

  doc.setFontSize(60)
  doc.text(
    activity.isDuel ? 'DUEL' : 'ACTIVITY',
    blockXPos + blockWidth/2,
    blockYPos + 30,
    {
      align: 'center',
      baseline: 'middle'
    }
  )

  doc.addImage(
    qrCodeDataUrl,
    'JPEG',
    blockXPos + blockWidth/2 - qrSize/2,
    blockYPos + blockHeight/2 - qrSize/2,
    qrSize,
    qrSize
  )

  doc.setFontSize(50)
  doc.text(
    activity.name,
    blockXPos + blockWidth/2,
    blockYPos + blockHeight - 40,
    {
      align: 'center',
      baseline: 'middle',
      maxWidth: 220
    }
  )
}

enum RenderableDataType {
  player,
  item,
  activity
}

export async function generateQrCodes(projectUuid: string, db: Database, payload: QrGenerationPayload): Promise<ArrayBuffer> {
  const [players, items, activities] = getData(projectUuid, db, payload);
  const gameClientHost = getGameClientHost(projectUuid, db);

  const thingsToRender = [
    ...players.map(player => ({ type: RenderableDataType.player, data: player })),
    ...items.map(item => ({ type: RenderableDataType.item, data: item })),
    ...activities.map(activity => ({ type: RenderableDataType.activity, data: activity }))
  ]

  try {
    const pageFormat = [1000, letterSizeRatio*1000];
    const doc = new JSPDF({
      format: pageFormat
    })

    for( let i=0; i<thingsToRender.length; i++ ){
      const { type, data } = thingsToRender[i];
      if( i%(numBlocks*numBlocks) === 0 && i > 0 ) doc.addPage(pageFormat)
      const pageContextIndex = i % blocksPerPage;

      const blockXPos = Math.floor(pageContextIndex%numBlocks) * blockWidth + margin + gap * Math.floor(pageContextIndex%numBlocks);
      const blockYPos = Math.floor(pageContextIndex/numBlocks) * blockHeight + margin + gap * Math.floor(pageContextIndex/numBlocks);

      switch(type) {
        case RenderableDataType.player: await renderPlayerToDoc(doc, data as SavedPlayer, gameClientHost, blockXPos, blockYPos); break;
        case RenderableDataType.item: await renderItemToDoc(doc, data as ProjectItem, gameClientHost, blockXPos, blockYPos); break;
        case RenderableDataType.activity: await renderActivityToDoc(doc, data as SavedActivity, gameClientHost, blockXPos, blockYPos); break;
      }
    }
    
    return doc.output("arraybuffer")
  } catch (e) {
    console.log("Error creating and writing to pdf", e);
    throw e;
  }
}