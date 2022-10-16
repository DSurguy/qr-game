import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { CreatePlayerPayload, SavedPlayer, Tag } from "../../qr-types";
import { claimNewWordId } from "./claimNewWordId";

export function applyPlayerRoutes(app: FastifyInstance) {
  app.get<{
    Params: { projectUuid: string },
    Querystring: { deleted?: boolean },
    Reply: SavedPlayer[]
  }>('/projects/:projectUuid/players', (req, reply) => {
    try {
      const {
        deleted
      } = req.query;
      const {
        projectUuid
      } = req.params;
      const select = app.db.prepare(`
        SELECT * FROM project_players WHERE projectUuid=@projectUuid AND deleted=@deleted
      `)
      const players = select.all({
        deleted: deleted ? 1 : 0,
        projectUuid
      })
      reply.code(200).send(players)
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.get<{
    Params: { projectUuid: string, playerUuid: string },
    Reply: SavedPlayer[]
  }>('/projects/:projectUuid/players/:playerUuid', (req, reply) => {
    try {
      const {
        projectUuid,
        playerUuid
      } = req.params;
      const select = app.db.prepare(`
        SELECT * FROM project_players WHERE projectUuid=@projectUuid AND uuid=@playerUuid
      `)
      const player = select.get({
        projectUuid,
        playerUuid
      })
      reply.code(200).send(player)
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.put<{
    Params: { projectUuid: string, playerUuid: string },
    Body: SavedPlayer,
    Reply: SavedPlayer | string
  }>('/projects/:projectUuid/players/:playerUuid', (req, reply) => {
    try {
      const {
        claimed,
        name,
        projectUuid,
        uuid: playerUuid
      } = req.body;
      if( projectUuid !== req.params.projectUuid || playerUuid !== req.params.playerUuid ) {
        reply.code(400).send("Player and/or project uuids do not match");
      }
      const update = app.db.prepare(`
        UPDATE project_players
        SET claimed=@claimed, name=@name
        WHERE projectUuid=@projectUuid AND uuid=@playerUuid
      `);
      const result = update.run({
        claimed,
        name,
        projectUuid,
        playerUuid
      })
      if( result.changes === 0 ){
        //no change made, report this
        reply.code(404).send()
      }
      else {
        const getItem = app.db.prepare(`SELECT * FROM project_players WHERE uuid=@playerUuid AND projectUuid=@projectUuid`)
        const item = getItem.get({
          projectUuid,
          playerUuid
        });
        reply.code(200).send(item)
      }
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.post<{
    Params: { projectUuid: string },
    Body: CreatePlayerPayload,
  }>('/projects/:projectUuid/players', (req, reply) => {
    try {
      const { projectUuid } = req.params;
      const timestamp = Date.now();
      const insertPlayers = app.db.transaction(() => {
        const insertPlayer = app.db.prepare(`
          INSERT INTO project_players (projectUuid, uuid, wordId, name, claimed, deleted, createdAt, updatedAt)
          VALUES (@projectUuid, @uuid, @wordId, @name, 0, 0, @timestamp, @timestamp)
        `)
        for( let i=0; i<req.body.numPlayers; i++ ) {
          const playerUuid = randomUUID();
          const playerWordId = claimNewWordId(app, projectUuid);
          insertPlayer.run({
            projectUuid: projectUuid,
            uuid: playerUuid,
            wordId: playerWordId,
            name: "",
            timestamp
          })
        }
      })
      insertPlayers();
      reply.code(200).header("content-type", "none").send();
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.get<{
    Params: { projectUuid: string, playerUuid: string },
    Reply: Tag[] | { message: string } | undefined
  }>('/projects/:projectUuid/players/:playerUuid/tags', ( req, reply ) => {
    const { projectUuid, playerUuid } = req.params;

    try {
      const select = app.db.prepare(`
        SELECT * FROM player_tags
        WHERE projectUuid=@projectUuid AND playerUuid=@playerUuid
      `)
      const tags = select.all({
        projectUuid,
        playerUuid
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
      playerUuid: string;
    },
    Body: Tag,
    Reply: { message: string } | undefined
  }>('/projects/:projectUuid/players/:playerUuid/tags', ( req, reply ) => {
    const { projectUuid, playerUuid } = req.params;
    const { tag, value } = req.body;

    try {
      const update = app.db.prepare(`
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

      update.run({
        projectUuid,
        playerUuid,
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
      playerUuid: string;
      tag: string;
    },
    Body: { value: string },
    Reply: { message: string } | undefined
  }>('/projects/:projectUuid/players/:playerUuid/tags/:tag', ( req, reply ) => {
    const { projectUuid, playerUuid, tag } = req.params;
    const { value } = req.body;

    try {
      const update = app.db.prepare(`
        UPDATE player_tags SET
          value=@value
        WHERE
          projectUuid=@projectUuid AND
          playerUuid=@playerUuid AND
          tag=@tag
      `)

      update.run({
        projectUuid,
        playerUuid,
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
    Params: { projectUuid: string, playerUuid: string, tag: string },
    Reply: { message: string } | undefined
  }>('/projects/:projectUuid/players/:playerUuid/tags/:tag', ( req, reply ) => {
    const { projectUuid, playerUuid, tag } = req.params;

    try {
      const update = app.db.prepare(`
        DELETE FROM player_tags
        WHERE
          projectUuid=@projectUuid AND
          playerUuid=@playerUuid AND
          tag=@tag
      `)

      update.run({
        projectUuid,
        playerUuid,
        tag
      })

      reply.status(200).send();

    } catch (e) {
      console.error(e.message, e);
      reply.code(500).send({ message: e.message })
    }
  })
}