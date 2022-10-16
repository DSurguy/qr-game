import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { SavedActivity, UnsavedActivity } from "../../qr-types";
import { claimNewWordId } from "./claimNewWordId";

export function applyActivityRoutes(app: FastifyInstance) {
  app.post<{ 
    Body: UnsavedActivity,
    Reply: SavedActivity,
    Params: { projectUuid: string }
  }>('/projects/:projectUuid/activities', (req, reply) => {
    const {
      name,
      description,
      value,
      isRepeatable,
      repeatValue,
      isDuel
    } = req.body;
    const uuid = randomUUID();
    const { projectUuid } = req.params;
    const wordId = claimNewWordId(app, projectUuid);
    const timestamp = Date.now();
    const insert = app.db.prepare(`
      INSERT INTO project_activities (projectUuid, uuid, wordId, name, description, value, isRepeatable, repeatValue, isDuel, deleted, createdAt, updatedAt)
      VALUES (@projectUuid, @uuid, @wordId, @name, @description, @value, @isRepeatable, @repeatValue, @isDuel, 0, @timestamp, @timestamp)`)
    try {
      insert.run({projectUuid, uuid, wordId, name, description, value, isRepeatable: (isRepeatable ? 1 : 0), repeatValue, isDuel: (isDuel ? 1 : 0), timestamp})
      reply.code(201).send({
        projectUuid,
        uuid,
        wordId,
        name,
        description,
        value,
        isRepeatable,
        repeatValue,
        isDuel,
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
    Body: SavedActivity,
    Reply: SavedActivity | string,
    Params: { projectUuid: string, activityUuid: string }
  }>('/projects/:projectUuid/activities/:activityUuid', (req, reply) => {
    const {
      projectUuid,
      uuid: activityUuid,
      name,
      description,
      value,
      isRepeatable,
      repeatValue,
      isDuel
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
        repeatValue=@repeatValue,
        updatedAt=@timestamp,
        isDuel=@isDuel
      WHERE projectUuid=@projectUuid AND uuid=@activityUuid AND deleted=0`)
    try {
      const result = update.run({
        projectUuid,
        activityUuid,
        name,
        description,
        value,
        isRepeatable: (isRepeatable ? 1 : 0),
        repeatValue,
        isDuel: (isDuel ? 1 : 0),
        timestamp
      })
      if( result.changes === 0 ){
        //no change made, report this
        reply.code(404).send()
      }
      else {
        const getActivity = app.db.prepare(`SELECT * FROM project_activities WHERE uuid=@activityUuid AND projectUuid=@projectUuid`)
        const activity = getActivity.get({
          projectUuid,
          activityUuid
        });
        reply.code(200).send(({
          ...activity,
          isRepeatable: !!activity.isRepeatable,
          isDuel: !!activity.isDuel
        }))
      }
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })

  app.get<{
    Reply: SavedActivity[],
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
      }) as SavedActivity[]
      reply.code(200).send(activities.map(activity => ({
        ...activity,
        isRepeatable: !!activity.isRepeatable,
        isDuel: !!activity.isDuel
      })));
    } catch (e) {
      console.error(e.message);
      reply.code(500).send();
    }
  })

  app.get<{
    Reply: SavedActivity,
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
          isRepeatable: !!activity.isRepeatable,
          isDuel: !!activity.isDuel
        });
      } else {
        reply.code(404).send()
      }
    } catch (e) {
      console.error(e.message);
      reply.code(500).send();
    }
  })
}