import { GameProjectType, SavedProjectType } from "@qr-game/types";
import { FastifyPluginCallback } from "fastify"
import { projectToGame } from "../conversions/toGame";
import { ProjectSession } from "../types";

// BASE /api/game/* <authenticated>
// GET  /api/game - project info
// GET  /api/game/me - current authenticated player info
// GET  /api/game/players - all claimed players
// GET  /api/game/players/:playerUuid - specific player info
export const gameRouter: FastifyPluginCallback = (app, options, done) => {

  app.get<{
    Cookies: {
      qrGameSession: string | undefined;
    },
    Reply: GameProjectType | undefined;
  }>('/', (req, reply) => {
    try {
      //TODO: Move cookie and session validation to some hook, expose { project, player, session } directly somehow
      const sessionCookie = app.unsignCookie(req.cookies.qrGameSession);
      if( !sessionCookie.valid ) {
        reply.status(401).send();
        return;
      }
      const select = app.db.prepare('SELECT * FROM project_sessions WHERE sessionId=@sessionId')
      let possibleSession = select.get({ sessionId: sessionCookie.value });
      if( !possibleSession || !possibleSession.projectUuid ) {
        reply.status(401).send();
        return;
      }
      const session = possibleSession as ProjectSession;

      const getProject = app.db.prepare('SELECT * FROM projects WHERE uuid=@projectUuid AND deleted=0')
      const project = getProject.get({
        projectUuid: session.projectUuid
      }) as SavedProjectType | undefined;

      if( !project ) {
        reply.status(404).send();
        return;
      }

      else reply.status(200).send(projectToGame(project));
    } catch (e) {
      reply.status(500).send();
    }
  })

  done();
}