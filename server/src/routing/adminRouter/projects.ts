import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { claimNewWordId } from "./claimNewWordId";
import { SavedProject, UnsavedProject } from "../../qr-types";

export function applyProjectRoutes(app: FastifyInstance) {
  app.post<{
    Body: UnsavedProject,
    Reply: SavedProject
  }>('/projects', (req, reply) => {
    const {
      name,
      description,
      numPlayers,
      settings
    } = req.body;
    const uuid = randomUUID();
    
    const timestamp = Date.now();
    const insertProject = app.db.prepare(`
      INSERT INTO projects (uuid, wordId, name, description, deleted, createdAt, updatedAt)
      VALUES (@uuid, @wordId, @name, @description, 0, @timestamp, @timestamp)
    `)
    const updateProjectWordId = app.db.prepare(`
      UPDATE projects SET wordId=@wordId WHERE uuid=@uuid
    `)
    const insertSettings = app.db.prepare(`
      INSERT INTO project_settings (uuid, jsonData, updatedAt)
      VALUES (@uuid, @jsonData, @timestamp)
    `)
    const insertPlayers = app.db.transaction(() => {
      const insertPlayer = app.db.prepare(`
        INSERT INTO project_players (projectUuid, uuid, wordId, name, claimed, deleted, createdAt, updatedAt)
        VALUES (@projectUuid, @uuid, @wordId, @name, 0, 0, @timestamp, @timestamp)
      `)
      for( let i=0; i<numPlayers; i++ ) {
        const playerUuid = randomUUID();
        const playerWordId = claimNewWordId(app, uuid);
        insertPlayer.run({
          projectUuid: uuid,
          uuid: playerUuid,
          wordId: playerWordId,
          name: "",
          timestamp
        })
      }
    })
    const transaction = app.db.transaction(() => {
      insertProject.run({uuid, wordId: "", name, description, timestamp})
      const wordId = claimNewWordId(app, uuid)
      updateProjectWordId.run({ wordId, uuid })
      insertSettings.run({
        uuid,
        jsonData: JSON.stringify(settings),
        timestamp
      })
      insertPlayers();
    })
    try {
      transaction();
      const selectProject = app.db.prepare(`SELECT * FROM projects WHERE uuid=@uuid`)
      reply.code(201).send(selectProject.get({uuid}));
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  //TODO: Paginate
  app.get<{
    Reply: SavedProject[],
    Querystring: { deleted?: boolean }
  }>('/projects', (req, reply) => {
    try {
      const retrieve = app.db.prepare(`SELECT * FROM projects WHERE deleted = ?`);
      const results = retrieve.all(req.query.deleted !== undefined ? 1 : 0);
      reply.code(200).send(results);
    } catch (e) {
      console.error(e);
      reply.code(500).send();
    }
  })

  app.get<{
    Reply: SavedProject,
    Params: { projectUuid: string }
  }>('/projects/:projectUuid', (req, reply) => {
    try {
      const retrieve = app.db.prepare(`SELECT * FROM projects WHERE uuid = ?`);
      reply.code(200).send(retrieve.get(req.params.projectUuid));
    } catch (e) {
      console.error(e);
      reply.code(500).send();
    }
  })

  app.put<{
    Body: SavedProject,
    Reply: SavedProject,
    Params: { projectUuid: string }
  }>('/projects/:projectUuid', {
    preHandler: (req, reply, done) => {
      if( req.body.uuid !== req.params.projectUuid ) done(new Error("uuid in payload does not match URL"))
      else done();
    }
  }, (req, reply) => {
    try {
      const {
        uuid,
        name,
        description
      } = req.body;
      const timestamp = Date.now();
      const update = app.db.prepare(`UPDATE projects SET name=?, description=?, updatedAt=? WHERE uuid = ? AND deleted = 0`)
      const result = update.run(name, description, timestamp, uuid)
      if( result.changes === 0 ){
        //no change made, report this
        reply.code(404).send()
      }
      else {
        const getItem = app.db.prepare(`SELECT * FROM projects WHERE uuid=?`)
        const item = getItem.get(uuid);
        reply.code(200).send(item)
      }
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.delete<{
    Params: { projectUuid: string }
  }>('/projects/:projectUuid', (req, reply) => {
    try {
      const del = app.db.prepare(`UPDATE projects SET deleted = 1 WHERE uuid = ? AND deleted = 0`)
      const result = del.run(req.params.projectUuid);
      if( result.changes === 0 ) reply.code(404).send()
      else reply.code(200).send()
    } catch (e) {
      console.error(e);
      reply.code(500).send();
    }
  })

  app.post<{
    Body: { uuid: string }
  }>('/projects/restore', (req, reply) => {
    try {
      const undelete = app.db.prepare(`UPDATE projects SET deleted = 0 WHERE uuid = ? AND deleted = 1`)
      const result = undelete.run(req.body.uuid)
      if( result.changes === 0 ) reply.code(404).send()
      else reply.code(200).send()
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })
}