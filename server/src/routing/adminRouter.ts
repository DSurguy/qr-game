import { randomUUID } from 'crypto';
import { UnsavedProjectType, SavedProjectType, UnsavedActivityType, SavedActivityType, ProjectSettingsType, SavedPlayerType, UnsavedDuelActivityType, SavedDuelActivityType, CreatePlayerPayloadType } from '@qr-game/types';
import { FastifyPluginCallback } from 'fastify/types/plugin'
import { getRandomInt } from '../utils/random';
import animals from '../lists/animals.js';
import adjectives from '../lists/adjectives.js';

const getRandomListItem = (list: string[]) => list[getRandomInt(0, list.length)];

export const adminRouter: FastifyPluginCallback = (app, options, done) => {
  const claimNewWordId = (projectUuid): string => {
    let wordId = getRandomListItem(adjectives) + getRandomListItem(adjectives) + getRandomListItem(animals);
    const selectWordId = app.db.prepare(`
      SELECT * FROM project_wordIds
      WHERE projectUuid=@projectUuid AND wordId=@wordId
    `)
    const insertNewWordId = app.db.prepare(`
      INSERT INTO project_wordIds (projectUuid, wordId)
      VALUES (@projectUuid, @wordId)
    `)
    let existingId = selectWordId.get({ projectUuid, wordId })
    while(existingId) {
      wordId = getRandomListItem(adjectives) + getRandomListItem(adjectives) + getRandomListItem(animals);
      existingId = selectWordId.get({ projectUuid, wordId })
    }
    insertNewWordId.run({ projectUuid, wordId })
    return wordId;
  }

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

  app.post<{
    Body: UnsavedProjectType,
    Reply: SavedProjectType
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
        const playerWordId = claimNewWordId(uuid);
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
      const wordId = claimNewWordId(uuid)
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
    Reply: SavedProjectType[],
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
    Reply: SavedProjectType,
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
    Body: SavedProjectType,
    Reply: SavedProjectType,
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
  
  app.post<{ 
    Body: UnsavedActivityType,
    Reply: SavedActivityType,
    Params: { projectUuid: string }
  }>('/projects/:projectUuid/activities', (req, reply) => {
    const {
      name,
      description,
      value,
      isRepeatable,
      repeatValue
    } = req.body;
    const uuid = randomUUID();
    const { projectUuid } = req.params;
    const wordId = claimNewWordId(projectUuid);
    const timestamp = Date.now();
    const insert = app.db.prepare(`
      INSERT INTO project_activities (projectUuid, uuid, wordId, name, description, value, isRepeatable, repeatValue, deleted, createdAt, updatedAt)
      VALUES (@projectUuid, @uuid, @wordId, @name, @description, @value, @isRepeatable, @repeatValue, 0, @timestamp, @timestamp)`)
    try {
      insert.run({projectUuid, uuid, wordId, name, description, value, isRepeatable: (isRepeatable ? 1 : 0), repeatValue, timestamp})
      reply.code(201).send({
        projectUuid,
        uuid,
        wordId,
        name,
        description,
        value,
        isRepeatable,
        repeatValue,
        deleted: false,
        updatedAt: timestamp,
        createdAt: timestamp
      });
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.put<{ 
    Body: SavedActivityType,
    Reply: SavedActivityType | string,
    Params: { projectUuid: string, activityUuid: string }
  }>('/projects/:projectUuid/activities/:activityUuid', (req, reply) => {
    const {
      projectUuid,
      uuid: activityUuid,
      name,
      description,
      value,
      isRepeatable,
      repeatValue
    } = req.body;
    if( projectUuid !== req.params.projectUuid || activityUuid !== req.params.activityUuid ) {
      reply.code(400).send("Activity and/or project uuids do not match");
    }
    const timestamp = Date.now();
    const update = app.db.prepare(`
      UPDATE project_activities SET
        name=@name,
        description=@description,
        value=@value,
        isRepeatable=@isRepeatable,
        repeatValue=@repeatvalue,
        updatedAt=@timestamp
      WHERE projectUuid=@projectUuid AND uuid=@activityUuid AND deleted=0`)
    try {
      const result = update.run({projectUuid, activityUuid, name, description, value, isRepeatable: (isRepeatable ? 1 : 0), repeatValue, timestamp})
      if( result.changes === 0 ){
        //no change made, report this
        reply.code(404).send()
      }
      else {
        const getItem = app.db.prepare(`SELECT * FROM project_activities WHERE uuid=@activityUuid AND projectUuid=@projectUuid`)
        const item = getItem.get({
          projectUuid,
          activityUuid
        });
        reply.code(200).send(({
          ...item,
          isRepeatable: !!item.isRepeatable
        }))
      }
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.get<{
    Reply: SavedActivityType[],
    Params: { projectUuid: string }
  }>('/projects/:projectUuid/activities', (req, reply) => {
    try {
      const { projectUuid } = req.params;
      const select = app.db.prepare(`
        SELECT * FROM project_activities
        WHERE projectUuid=@projectUuid
      `)
      const activities = select.all({
        projectUuid
      }) as SavedActivityType[]
      reply.code(200).send(activities.map(activity => ({
        ...activity,
        isRepeatable: !!activity.isRepeatable
      })));
    } catch (e) {
      console.error(e.message);
      reply.code(500).send();
    }
  })

  app.get<{
    Reply: SavedActivityType,
    Params: { projectUuid: string, activityUuid: string }
  }>('/projects/:projectUuid/activities/:activityUuid', (req, reply) => {
    try {
      const { projectUuid, activityUuid } = req.params;
      const select = app.db.prepare(`
        SELECT * FROM project_activities
        WHERE projectUuid=@projectUuid
        AND uuid=@activityUuid
      `)
      const activity = select.get({
        projectUuid,
        activityUuid
      })
      if( activity ) {
        reply.code(200).send({
          ...activity,
          isRepeatable: !!activity.isRepeatable
        });
      } else {
        reply.code(404).send()
      }
    } catch (e) {
      console.error(e.message);
      reply.code(500).send();
    }
  })

  app.post<{ 
    Body: UnsavedDuelActivityType,
    Reply: SavedDuelActivityType,
    Params: { projectUuid: string }
  }>('/projects/:projectUuid/duelActivities', (req, reply) => {
    const {
      name,
      description,
      value,
      isRepeatable,
      repeatValue
    } = req.body;
    const uuid = randomUUID();
    const { projectUuid } = req.params;
    const wordId = claimNewWordId(projectUuid);
    const timestamp = Date.now();
    const insert = app.db.prepare(`
      INSERT INTO project_duel_activities (projectUuid, uuid, wordId, name, description, value, isRepeatable, repeatValue, deleted, createdAt, updatedAt)
      VALUES (@projectUuid, @uuid, @wordId, @name, @description, @value, @isRepeatable, @repeatValue, 0, @timestamp, @timestamp)`)
    try {
      insert.run({projectUuid, uuid, wordId, name, description, value, isRepeatable: isRepeatable ? 1 : 0, repeatValue, timestamp})
      reply.code(201).send({
        projectUuid,
        uuid,
        wordId,
        name,
        description,
        value,
        isRepeatable,
        repeatValue,
        deleted: false,
        updatedAt: timestamp,
        createdAt: timestamp
      });
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.put<{ 
    Body: SavedDuelActivityType,
    Reply: SavedDuelActivityType | string,
    Params: { projectUuid: string, duelActivityUuid: string }
  }>('/projects/:projectUuid/duelActivities/:duelActivityUuid', (req, reply) => {
    const {
      projectUuid,
      uuid: duelActivityUuid,
      name,
      description,
      value,
      isRepeatable,
      repeatValue
    } = req.body;
    if( projectUuid !== req.params.projectUuid || duelActivityUuid !== req.params.duelActivityUuid ) {
      reply.code(400).send("Duel activity and/or project uuids do not match");
    }
    const timestamp = Date.now();
    const update = app.db.prepare(`
      UPDATE project_duel_activities SET
        name=@name,
        description=@description,
        value=@value,
        updatedAt=@timestamp
        isRepeatable=@isRepeatable,
        repeatValue=@repeatValue
      WHERE projectUuid=@projectUuid AND uuid=@duelActivityUuid AND deleted=0`)
    try {
      const result = update.run({projectUuid, duelActivityUuid, name, description, value, isRepeatable: isRepeatable ? 1 : 0, repeatValue, timestamp})
      if( result.changes === 0 ){
        //no change made, report this
        reply.code(404).send()
      }
      else {
        const getItem = app.db.prepare(`SELECT * FROM project_duel_activities WHERE uuid=@duelActivityUuid AND projectUuid=@projectUuid`)
        const item = getItem.get({
          projectUuid,
          duelActivityUuid
        });
        reply.code(200).send({
          ...item,
          isRepeatable: !!item.isRepeatable
        })
      }
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.get<{
    Reply: SavedDuelActivityType[],
    Params: { projectUuid: string }
  }>('/projects/:projectUuid/duelActivities', (req, reply) => {
    try {
      const { projectUuid } = req.params;
      const select = app.db.prepare(`
        SELECT * FROM project_duel_activities
        WHERE projectUuid=@projectUuid
      `)
      const duelActivities = select.all({
        projectUuid
      }) as SavedDuelActivityType[]
      reply.code(200).send(duelActivities.map(activity => ({
        ...activity,
        isRepeatable: !!activity.isRepeatable
      })));
    } catch (e) {
      console.error(e.message);
      reply.code(500).send();
    }
  })

  app.get<{
    Reply: SavedDuelActivityType,
    Params: { projectUuid: string, duelActivityUuid: string }
  }>('/projects/:projectUuid/duelActivities/:duelActivityUuid', (req, reply) => {
    try {
      const { projectUuid, duelActivityUuid } = req.params;
      const select = app.db.prepare(`
        SELECT * FROM project_duel_activities
        WHERE projectUuid=@projectUuid
        AND uuid=@duelActivityUuid
      `)
      const activity = select.get({
        projectUuid,
        duelActivityUuid
      })
      if( activity ) {
        reply.code(200).send({
          ...activity,
          isRepeatable: !!activity.isRepeatable
        });
      } else {
        reply.code(404).send()
      }
    } catch (e) {
      console.error(e.message);
      reply.code(500).send();
    }
  })

  app.put<{ 
    Body: ProjectSettingsType,
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
      const select = app.db.prepare(`
        SELECT jsonData FROM project_settings
        WHERE uuid=@projectUuid
      `)
      reply.code(200).send(select.get({projectUuid: req.params.projectUuid}).jsonData);
    } catch (e) {
      console.error(e);
      reply.code(500).send()
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
        reply.code(201).send(result.jsonData);
      else
        reply.code(404).send();
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.get<{
    Params: { projectUuid: string },
    Querystring: { deleted?: boolean },
    Reply: SavedPlayerType[]
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
    Reply: SavedPlayerType[]
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
    Body: SavedPlayerType,
    Reply: SavedPlayerType | string
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
    Body: CreatePlayerPayloadType,
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
          const playerWordId = claimNewWordId(projectUuid);
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

  done()
}
