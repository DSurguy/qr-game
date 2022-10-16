import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { CreatePlayerPayload, SavedPlayer } from "../../qr-types";
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
}