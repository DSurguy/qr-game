import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { GameEventType, InventoryItem, PluginModifiedPayloadResponse, RedeemItemPayload } from "../../qr-types";

export function applyInventoryRoutes(app: FastifyInstance) {
  app.get<{
    Header: {
      authorization: string | undefined;
    };
    Reply: InventoryItem[] | undefined | { message: string };
  }>('/inventory', (req, reply) => {
    try {
      const { projectUuid, playerUuid } = req.session;

      const select = app.db.prepare(`
        SELECT
          ppi.*,
          psi.name as 'item.name',
          psi.description as 'item.description',
          psi.imageBase64 as 'item.imageBase64',
          psi.redemptionChallenge as 'item.redemptionChallenge'
        FROM project_player_inventory ppi
        LEFT JOIN project_store_items psi
        ON ppi.projectUuid = psi.projectUuid AND ppi.itemUuid = psi.uuid
        WHERE ppi.projectUuid = @projectUuid AND ppi.playerUuid = @playerUuid
      `)
      const results = select.all({
        projectUuid,
        playerUuid
      });

      const items = results.map(result => {
        const item: any = {};
        const inventoryRecord: any = {};
        Object.entries(result).forEach(([key, value]) => {
          if( key.startsWith('item.') ){
            const itemKey = key.replace('item.', '');
            if( itemKey === 'redemptionChallenge' )
              item['hasRedemptionChallenge'] = !!((value as string)?.length)
            else item[itemKey] = value;
          }
          else inventoryRecord[key] = value;
        })
        return {
          ...inventoryRecord,
          item
        }
      }) as InventoryItem[];

      reply.status(200).send(items);
    } catch(e) {
      console.error(e.message, e.stack);
      reply.status(500).send({ message: e.message })
    }
  })

  app.get<{
    Header: {
      authorization: string | undefined;
    };
    Params: {
      itemUuid: string;
    };
    Reply: InventoryItem | undefined | { message: string };
  }>('/inventory/:itemUuid', (req, reply) => {
    try {
      const { projectUuid, playerUuid } = req.session;
      const { itemUuid } = req.params;
      
      const select = app.db.prepare(`
        SELECT
          ppi.*,
          psi.name as 'item.name',
          psi.description as 'item.description',
          psi.imageBase64 as 'item.imageBase64',
          psi.redemptionChallenge as 'item.redemptionChallenge'
        FROM project_player_inventory ppi
        LEFT JOIN project_store_items psi
        ON ppi.projectUuid = psi.projectUuid AND ppi.itemUuid = psi.uuid
        WHERE ppi.projectUuid = @projectUuid AND ppi.playerUuid = @playerUuid AND ppi.itemUuid = @itemUuid
      `)
      const result = select.get({
        projectUuid,
        playerUuid,
        itemUuid
      });

      const item: any = {};
      const inventoryRecord: any = {};
      Object.entries(result).forEach(([key, value]) => {
        if( key.startsWith('item.') ){
          const itemKey = key.replace('item.', '');
          if( itemKey === 'redemptionChallenge' )
            item['hasRedemptionChallenge'] = !!((value as string)?.length)
          else item[itemKey] = value;
        }
        else inventoryRecord[key] = value;
      })
      inventoryRecord.item = item;

      reply.status(200).send(inventoryRecord as InventoryItem);
    } catch(e) {
      console.error(e.message, e.stack);
      reply.status(500).send({ message: e.message })
    }
  })

  app.post<{
    Header: {
      authorization: string | undefined;
    };
    Body: RedeemItemPayload;
    Reply: undefined | { message: string } | PluginModifiedPayloadResponse
  }>('/inventory/redeem', (req, reply) => {
    const { projectUuid, playerUuid } = req.session;
    const { itemUuid, challenge } = req.body;

    try {
      //TRANSACT
      const dbTransaction = app.db.transaction(() => {
        //Can the user redeem more of this item?
        const selectUserInventoryForItem = app.db.prepare(`
          SELECT *
          FROM project_player_inventory
          WHERE
            projectUuid=@projectUuid AND
            playerUuid=@playerUuid AND
            itemUuid=@itemUuid
        `)
        const inventoryRecord = selectUserInventoryForItem.get({
          projectUuid,
          playerUuid,
          itemUuid
        }) as InventoryItem;
        if( !inventoryRecord ) {
          reply.status(404).send();
          return;
        }

        if( inventoryRecord.quantityRedeemed >= inventoryRecord.quantity ) {
          reply.status(400).send({
            message: "No remaining quantity to redeem"
          })
          return;
        }
        
        //Does this item require a redemption challenge?
        //Did the user pass redemption challenge?
        const selectStoreItem = app.db.prepare(`
          SELECT *
          FROM project_store_items
          WHERE
            projectUuid=@projectUuid AND
            uuid=@itemUuid
        `)
        const storeItem = selectStoreItem.get({
          projectUuid,
          itemUuid
        })

        if( storeItem.redemptionChallenge && challenge != storeItem.redemptionChallenge) {
          reply.status(400).send({
            message: "Challenge response incorrect"
          })
          return;
        }

        const selectTags = app.db.prepare(`
          SELECT * FROM store_item_tags
          WHERE itemUuid = @itemUuid
        `)
        const tags = selectTags.all({ itemUuid })

        const preHookResponses = app.plugins.runItemPreRedemptionHook({
          db: app.db,
          session: req.session,
          item: storeItem,
          tags,
        })

        if( preHookResponses.some(response => response.failure) ) {
          reply.status(400).send({
            hooks: {
              preItemRedemption: preHookResponses.filter(response => response.failure)
            }
          })
          return;
        }

        //Add an event
        const eventUuid = randomUUID();
        const timestamp = Date.now();

        const insert = app.db.prepare(`
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
          projectUuid,
          uuid: eventUuid,
          type: GameEventType.ItemRedeemed,
          payload: JSON.stringify({
            challenge
          }),
          primaryUuid: playerUuid,
          secondaryUuid: itemUuid,
          timestamp
        })

        //Redeem the item
        const updateRedeem = app.db.prepare(`
          UPDATE project_player_inventory
          SET quantityRedeemed = quantityRedeemed + 1
          WHERE
            projectUuid=@projectUuid AND
            playerUuid=@playerUuid AND
            itemUuid=@itemUuid
        `)
        updateRedeem.run({
          projectUuid,
          playerUuid,
          itemUuid
        })

        //Run hooks

        const hookResponses = app.plugins.runItemRedemptionHook({
          db: app.db,
          redemptionEventUuid: eventUuid,
          session: req.session,
          item: storeItem,
          tags,
        })

        reply.status(200).send({
          hooks: {
            itemRedemption: hookResponses
          }
        });
      });

      dbTransaction();
    } catch (e) {
      console.error(e.message, e.stack);
      reply.status(500).send({ message: e.message })
    }
  })
}