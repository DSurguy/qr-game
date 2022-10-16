import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { GameEventType, PurchaseItemPayload, StoreItem } from "../../qr-types";
import { getPlayerBalance } from "./utils/getPlayerBalance";

export function applyStoreRoutes(app: FastifyInstance) {
  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Reply: StoreItem[] | { message: string };
  }>('/store/items', (req, reply) => {
    try {
      const getItems = app.db.prepare(`
        SELECT * FROM project_store_items
        WHERE projectUuid=@projectUuid AND deleted=0 AND availableForPurchase=1
      `)
      const items = getItems.all({
        projectUuid: req.session.projectUuid
      })
      reply.status(200).send(items.map(item => ({
        projectUuid: item.projectUuid,
        uuid: item.uuid,
        name: item.name,
        description: item.description,
        cost: item.cost,
        imageBase64: item.imageBase64,
        canPurchaseMultiple: !!item.canPurchaseMultiple,
        hasRedemptionChallenge: !!(item.redemptionChallenge?.length)
      } as StoreItem)))
    } catch (e) {
      console.error(e.message);
      reply.status(500).send({ message: e.message })
    }
  })

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Params: {
      itemUuid: string;
    },
    Reply: StoreItem | undefined | { message: string };
  }>('/store/items/:itemUuid', (req, reply) => {
    const { itemUuid } = req.params;
    try {
      const select = app.db.prepare(`
        SELECT * FROM project_store_items
        WHERE projectUuid=@projectUuid AND uuid=@itemUuid AND deleted=0 AND availableForPurchase=1
      `)
      const item = select.get({
        projectUuid: req.session.projectUuid,
        itemUuid
      })
      if( !item ) reply.status(404).send()
      else reply.status(200).send({
        projectUuid: item.projectUuid,
        uuid: item.uuid,
        name: item.name,
        description: item.description,
        cost: item.cost,
        imageBase64: item.imageBase64,
        canPurchaseMultiple: !!item.canPurchaseMultiple,
        hasRedemptionChallenge: !!(item.redemptionChallenge?.length)
      } as StoreItem)
    } catch (e) {
      console.error(e.message);
      reply.status(500).send({ message: e.message })
    }
  })

  app.post<{
    Header: {
      authorization: string | undefined;
    };
    Body: PurchaseItemPayload;
    Reply: undefined | { message: string };
  }>('/store/purchase', (req, reply) => {
    const { itemUuid } = req.body;
    const { projectUuid, playerUuid } = req.session;
    try {
      const dbTransaction = app.db.transaction(() => {
        const timestamp = Date.now();

        //How much does this item cost
        const selectItem = app.db.prepare(`
          SELECT * FROM project_store_items
          WHERE projectUuid=@projectUuid AND uuid=@itemUuid AND deleted=0 AND availableForPurchase=1
        `)
        const item = selectItem.get({
          projectUuid,
          itemUuid
        })
        if( !item ) {
          reply.status(404).send()
          return;
        }

        //Does the player have enough currency to complete this purchase?
        const balance = getPlayerBalance(app, req.session.projectUuid, req.session.playerUuid);
        if( item.cost > balance ){
          reply.status(400).send({
            message:'Player balance too low'
          })
          return;
        }

        //TODO: Has the player purchased this before, and can they purchase multiple?

        //Create an event
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

        const eventUuid = randomUUID();

        insert.run({
          projectUuid,
          uuid: eventUuid,
          type: GameEventType.ItemPurchased,
          payload: JSON.stringify({}),
          primaryUuid: playerUuid,
          secondaryUuid: itemUuid,
          timestamp
        })

        //Add a transaction and add an item to their inventory (increment if exists)
        const insertTransaction = app.db.prepare(`
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
          amount: -item.cost,
          timestamp
        })

        const insertInventory = app.db.prepare(`
          INSERT INTO project_player_inventory (
            projectUuid,
            playerUuid,
            itemUuid,
            quantity,
            quantityRedeemed  
          ) VALUES (
            @projectUuid,
            @playerUuid,
            @itemUuid,
            1,
            0
          )
          ON CONFLICT (projectUuid, playerUuid, itemUuid) DO UPDATE SET quantity = quantity + 1
        `)

        insertInventory.run({
          projectUuid,
          playerUuid,
          itemUuid
        })

        reply.status(200).send();
      });

      dbTransaction();
    } catch (e) {
      console.error(e.message, e.stack);
      reply.status(500).send({ message: e.message })
    }
  })
}