import { randomUUID } from 'crypto';
import { UnsavedProjectType, SavedProjectType, UnsavedActivityType, SavedActivityType, ProjectSettings } from '@qr-game/types';
import { FastifyPluginCallback } from 'fastify/types/plugin'
import { getRandomInt } from '../utils/random';
import animals from '../lists/animals.js';
import adjectives from '../lists/adjectives.js';

export const adminRouter: FastifyPluginCallback = (app, options, done) => {
  app.get('/health', (req, reply) => {
    try {
      //See if we can access and pragma the database
      const info = app.db.pragma('table_info')
      setTimeout(() => {
        reply.code(200).send()
      }, 1000);
    } catch (e) {
      reply.code(500).send();
    }
  })

  app.post<{ Body: UnsavedProjectType, Reply: SavedProjectType }>('/projects', (req, reply) => {
    const {
      name,
      description
    } = req.body;
    const uuid = randomUUID();
    const getRandomListItem = (list: string[]) => list[getRandomInt(0, list.length)];
    const wordId = getRandomListItem(adjectives) + getRandomListItem(adjectives) + getRandomListItem(animals);
    const timestamp = Date.now();
    const insert = app.db.prepare(`INSERT INTO projects (uuid, wordId, name, description, deleted, createdAt, updatedAt) VALUES (?,?,?,?, 0, ?,?)`)
    try {
      insert.run(uuid, wordId, name, description, timestamp, timestamp)
      reply.status(201).send({
        uuid,
        wordId,
        name,
        description,
        deleted: false,
        updatedAt: timestamp,
        createdAt: timestamp
      });
    } catch (e) {
      console.error(e);
      reply.status(500).send()
    }
  })

  //TODO: Paginate
  app.get<{ Reply: SavedProjectType[], Querystring: { deleted?: boolean } }>('/projects', (req, reply) => {
    try {
      const retrieve = app.db.prepare(`SELECT * FROM projects WHERE deleted = ?`);
      const results = retrieve.all(req.query.deleted !== undefined ? 1 : 0);
      reply.status(200).send(results);
    } catch (e) {
      console.error(e);
      reply.status(500).send();
    }
  })

  app.get<{ Reply: SavedProjectType, Params: { projectUuid: string } }>('/projects/:projectUuid', (req, reply) => {
    try {
      const retrieve = app.db.prepare(`SELECT * FROM projects WHERE uuid = ?`);
      reply.status(200).send(retrieve.get(req.params.projectUuid));
    } catch (e) {
      console.error(e);
      reply.status(500).send();
    }
  })

  app.put<{ Body: SavedProjectType, Reply: SavedProjectType, Params: { projectUuid: string } }>('/projects/:projectUuid', {
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
        reply.status(404).send()
      }
      else {
        const getItem = app.db.prepare(`SELECT * FROM projects WHERE uuid=?`)
        const item = getItem.get(uuid);
        reply.status(200).send(item)
      }
    } catch (e) {
      console.error(e);
      reply.status(500).send()
    }
  })

  app.delete<{ Params: { projectUuid: string } }>('/projects/:projectUuid', (req, reply) => {
    try {
      const del = app.db.prepare(`UPDATE projects SET deleted = 1 WHERE uuid = ? AND deleted = 0`)
      const result = del.run(req.params.projectUuid);
      if( result.changes === 0 ) reply.status(404).send()
      else reply.status(200).send()
    } catch (e) {
      console.error(e);
      reply.status(500).send();
    }
  })

  app.post<{ Body: { uuid: string }}>('/projects/restore', (req, reply) => {
    try {
      const undelete = app.db.prepare(`UPDATE projects SET deleted = 0 WHERE uuid = ? AND deleted = 1`)
      const result = undelete.run(req.body.uuid)
      if( result.changes === 0 ) reply.status(404).send()
      else reply.status(200).send()
    } catch (e) {
      console.error(e);
      reply.status(500).send()
    }
  })
  
  app.post<{ 
    Body: UnsavedActivityType,
    Reply: SavedActivityType
  }>('/projects/:projectUuid/activity', (req, reply) => {
    const {
      name,
      description,
      value
    } = req.body;
    const uuid = randomUUID();
    const getRandomListItem = (list: string[]) => list[getRandomInt(0, list.length)];
    const wordId = getRandomListItem(adjectives) + getRandomListItem(adjectives) + getRandomListItem(animals);
    const timestamp = Date.now();
    const insert = app.db.prepare(`INSERT INTO activities (uuid, wordId, name, description, value, deleted, createdAt, updatedAt) VALUES (?,?,?,?,?, 0, ?,?)`)
    try {
      insert.run(uuid, wordId, name, description, value, timestamp, timestamp)
      reply.status(201).send({
        uuid,
        wordId,
        name,
        description,
        value,
        deleted: false,
        updatedAt: timestamp,
        createdAt: timestamp
      });
    } catch (e) {
      console.error(e);
      reply.status(500).send()
    }
  })

  app.post<{ 
    Body: ProjectSettings,
    Params: { projectUuid: string }
  }>('/projects/:projectUuid/settings', (req, reply) => {
    const insert = app.db.prepare(`
      INSERT INTO project_settings (uuid, jsonData, updatedAt)
      VALUES (@uuid, @jsonData, @updatedAt)
      ON CONFLICT (uuid) DO UPDATE SET
        jsonData=@jsonData,
        updatedAt=@updatedAt
    `)
    try {
      insert.run({
        uuid: req.params.projectUuid,
        jsonData: JSON.stringify(req.body),
        updatedAt: Date.now()
      })
      reply.status(200).send();
    } catch (e) {
      console.error(e);
      reply.status(500).send()
    }
  })

  app.get<{ 
    Params: { projectUuid: string }
  }>('/projects/:projectUuid/settings', (req, reply) => {
    const select = app.db.prepare(`
      SELECT jsonData FROM project_settings WHERE uuid=@uuid
    `)
    try {
      const result = select.get({
        uuid: req.params.projectUuid,
      })
      if( result ) 
        reply.status(201).send(result.jsonData);
      else
        reply.status(404).send();
    } catch (e) {
      console.error(e);
      reply.status(500).send()
    }
  })

  done()
}
