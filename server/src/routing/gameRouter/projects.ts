import { FastifyInstance } from "fastify";
import { projectToGame } from "../../conversions/toGame";
import { GameProject, SavedProject } from "../../qr-types";
import { ProjectSession } from "../../types";

export function applyProjectRoutes(app: FastifyInstance) {
  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Reply: GameProject | undefined;
  }>('/project', (req, reply) => {
    try {
      const select = app.db.prepare('SELECT * FROM project_sessions WHERE sessionId=@sessionId')
      let possibleSession = select.get({ sessionId: req.session.sessionId });
      if( !possibleSession || !possibleSession.projectUuid ) {
        reply.status(401).send();
        return;
      }
      const session = possibleSession as ProjectSession;

      const getProject = app.db.prepare('SELECT * FROM projects WHERE uuid=@projectUuid AND deleted=0')
      const project = getProject.get({
        projectUuid: session.projectUuid
      }) as SavedProject | undefined;

      if( !project ) {
        reply.status(404).send();
        return;
      }

      else reply.status(200).send(projectToGame(project));
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })
}