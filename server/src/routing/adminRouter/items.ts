import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { CreateProjectItemPayload, ProjectItem, Tag } from "../../qr-types";

export function applyItemRoutes(app: FastifyInstance) {
  app.get<{
    Params: { projectUuid: string },
    Querystring: { deleted?: boolean },
    Reply: ProjectItem[] | { message: string }
  }>('/projects/:projectUuid/items', (req, reply) => {
    try {
      const {
        deleted
      } = req.query;
      const {
        projectUuid
      } = req.params;
      const select = app.db.prepare(`
        SELECT * FROM project_store_items WHERE projectUuid=@projectUuid AND deleted=@deleted
      `)
      const items = select.all({
        deleted: deleted ? 1 : 0,
        projectUuid
      })
      reply.code(200).send((items || []).map(item => ({
        ...item,
        availableForPurchase: !!item.availableForPurchase,
        canPurchaseMultiple: !!item.canPurchaseMultiple,
        deleted: !!item.deleted
      })))
    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })

  app.get<{
    Params: { projectUuid: string, itemUuid: string },
    Reply: ProjectItem | { message: string } | undefined
  }>('/projects/:projectUuid/items/:itemUuid', (req, reply) => {
    try {
      const {
        projectUuid,
        itemUuid
      } = req.params;
      const select = app.db.prepare(`
        SELECT * FROM project_store_items WHERE projectUuid=@projectUuid AND uuid=@itemUuid
      `)
      const item = select.get({
        projectUuid,
        itemUuid
      })
      if( !item ) reply.code(404).send()
      else reply.code(200).send({
        ...item,
        availableForPurchase: !!item.availableForPurchase,
        canPurchaseMultiple: !!item.canPurchaseMultiple,
        deleted: !!item.deleted
      } as ProjectItem)
    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })

  app.post<{
    Params: { projectUuid: string },
    Body: CreateProjectItemPayload,
    Reply: ProjectItem | { message: string }
  }>('/projects/:projectUuid/items', ( req, reply ) => {
    const {
      name,
      description,
      cost,
      imageBase64,
      availableForPurchase,
      canPurchaseMultiple,
      redemptionChallenge,
      inventoryDescription,
      redeemedDescription
    } = req.body;
    const uuid = randomUUID();
    const { projectUuid } = req.params;
    const timestamp = Date.now();
    const insert = app.db.prepare(`
      INSERT INTO project_store_items (
        projectUuid,
        uuid,
        name,
        description,
        inventoryDescription,
        redeemedDescription,
        cost,
        imageBase64,
        availableForPurchase,
        canPurchaseMultiple,
        redemptionChallenge,
        deleted,
        createdAt,
        updatedAt
      ) VALUES (
        @projectUuid,
        @uuid,
        @name,
        @description,
        @inventoryDescription,
        @redeemedDescription,
        @cost,
        @imageBase64,
        @availableForPurchase,
        @canPurchaseMultiple,
        @redemptionChallenge,
        0,
        @timestamp,
        @timestamp
      )`)
    try {
      insert.run({
        projectUuid,
        uuid,
        name,
        description,
        inventoryDescription,
        redeemedDescription,
        cost,
        imageBase64,
        availableForPurchase: availableForPurchase ? 1 : 0,
        canPurchaseMultiple: canPurchaseMultiple ? 1 : 0,
        redemptionChallenge,
        timestamp
      })
      reply.code(201).send({
        projectUuid,
        uuid,
        name,
        description,
        inventoryDescription,
        redeemedDescription,
        cost,
        imageBase64,
        availableForPurchase,
        canPurchaseMultiple,
        redemptionChallenge,
        deleted: false,
        updatedAt: timestamp,
        createdAt: timestamp
      } as ProjectItem);
    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })

  app.put<{
    Params: { projectUuid: string, itemUuid: string },
    Body: ProjectItem,
    Reply: ProjectItem | { message: string } | undefined
  }>('/projects/:projectUuid/items/:itemUuid', ( req, reply ) => {
    const {
      name,
      description,
      inventoryDescription,
      redeemedDescription,
      cost,
      imageBase64,
      availableForPurchase,
      canPurchaseMultiple,
      redemptionChallenge
    } = req.body;
    const { projectUuid, itemUuid } = req.params;
    const timestamp = Date.now();
    const update = app.db.prepare(`
      UPDATE project_store_items SET
        name=@name,
        description=@description,
        inventoryDescription=@inventoryDescription,
        redeemedDescription=@redeemedDescription,
        cost=@cost,
        imageBase64=@imageBase64,
        availableForPurchase=@availableForPurchase,
        canPurchaseMultiple=@canPurchaseMultiple,
        redemptionChallenge=@redemptionChallenge,
        updatedAt=@timestamp
      WHERE projectUuid=@projectUuid AND uuid=@itemUuid`
    )
    try {
      update.run({
        projectUuid,
        itemUuid,
        name,
        description,
        inventoryDescription,
        redeemedDescription,
        cost,
        imageBase64,
        availableForPurchase: availableForPurchase ? 1 : 0,
        canPurchaseMultiple: canPurchaseMultiple ? 1 : 0,
        redemptionChallenge,
        timestamp
      })
      const select = app.db.prepare(`SELECT * FROM project_store_items WHERE projectUuid=@projectUuid AND uuid=@itemUuid`)
      const item = select.get({
        projectUuid,
        itemUuid
      })
      reply.code(200).send({
        ...item,
        availableForPurchase: !!item.availableForPurchase,
        canPurchaseMultiple: !!item.canPurchaseMultiple,
        deleted: !!item.deleted
      } as ProjectItem);
    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })

  app.delete<{
    Params: { projectUuid: string, itemUuid: string },
    Reply: { message: string } | undefined
  }>('/projects/:projectUuid/items/:itemUuid', ( req, reply ) => {
    const { projectUuid, itemUuid } = req.params;
    const timestamp = Date.now();
    const update = app.db.prepare(`
      update project_store_items SET
        deleted=1,
        updatedAt=@timestamp
      WHERE projectUuid=@projectUuid AND uuid=@itemUuid`
    )
    try {
      update.run({
        projectUuid,
        itemUuid,
        timestamp
      })
      reply.code(200).send();
    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })

  app.get<{
    Params: { projectUuid: string, itemUuid: string },
    Reply: Tag[] | { message: string } | undefined
  }>('/projects/:projectUuid/items/:itemUuid/tags', ( req, reply ) => {
    const { projectUuid, itemUuid } = req.params;

    try {
      const select = app.db.prepare(`
        SELECT * FROM store_item_tags
        WHERE projectUuid=@projectUuid AND itemUuid=@itemUuid
      `)
      const tags = select.all({
        projectUuid,
        itemUuid
      })

      reply.status(200).send(tags.map(record => ({
        tag: record.tag,
        value: record.value
      })));
    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })

  app.post<{
    Params: {
      projectUuid: string;
      itemUuid: string;
    },
    Body: Tag,
    Reply: { message: string } | undefined
  }>('/projects/:projectUuid/items/:itemUuid/tags', ( req, reply ) => {
    const { projectUuid, itemUuid } = req.params;
    const { tag, value } = req.body;

    try {
      const update = app.db.prepare(`
        INSERT INTO store_item_tags (
          projectUuid,
          itemUuid,
          tag,
          value
        ) VALUES (
          @projectUuid,
          @itemUuid,
          @tag,
          @value
        )
      `)

      update.run({
        projectUuid,
        itemUuid,
        tag,
        value
      })

      reply.status(200).send();

    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })

  app.put<{
    Params: {
      projectUuid: string;
      itemUuid: string;
      tag: string;
    },
    Body: { value: string },
    Reply: { message: string } | undefined
  }>('/projects/:projectUuid/items/:itemUuid/tags/:tag', ( req, reply ) => {
    const { projectUuid, itemUuid, tag } = req.params;
    const { value } = req.body;

    try {
      const update = app.db.prepare(`
        UPDATE store_item_tags SET
          value=@value
        WHERE
          projectUuid=@projectUuid AND
          itemUuid=@itemUuid AND
          tag=@tag
      `)

      update.run({
        projectUuid,
        itemUuid,
        tag,
        value
      })

      reply.status(200).send();

    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })

  app.delete<{
    Params: { projectUuid: string, itemUuid: string, tag: string },
    Reply: { message: string } | undefined
  }>('/projects/:projectUuid/items/:itemUuid/tags/:tag', ( req, reply ) => {
    const { projectUuid, itemUuid, tag } = req.params;

    try {
      const update = app.db.prepare(`
        DELETE FROM store_item_tags
        WHERE
          projectUuid=@projectUuid AND
          itemUuid=@itemUuid AND
          tag=@tag
      `)

      update.run({
        projectUuid,
        itemUuid,
        tag
      })

      reply.status(200).send();

    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })
}