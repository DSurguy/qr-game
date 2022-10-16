import { FastifyInstance } from "fastify";
import { ProjectSettings } from "../../qr-types";

export function applySettingsRoutes(app: FastifyInstance) {
  app.put<{ 
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
      const select = app.db.prepare(`
        SELECT jsonData FROM project_settings
        WHERE uuid=@projectUuid
      `)
      reply.code(200).send(JSON.parse(select.get({projectUuid: req.params.projectUuid}).jsonData));
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
        reply.code(201).send(JSON.parse(result.jsonData));
      else
        reply.code(404).send();
    } catch (e) {
      console.error(e);
      reply.code(500).send()
    }
  })
}