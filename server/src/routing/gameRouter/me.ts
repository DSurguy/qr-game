import { FastifyInstance } from "fastify";
import { playerToGame } from "../../conversions/toGame";
import { GamePlayer, SavedPlayer } from "../../qr-types";
import { ProjectSession } from "../../types";
import { getPlayerBalance } from "./utils/getPlayerBalance";

export function applyMeRoutes(app: FastifyInstance) {
  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Reply: GamePlayer | undefined;
  }>('/me', (req, reply) => {
    try {
      const select = app.db.prepare('SELECT * FROM project_sessions WHERE sessionId=@sessionId')
      let possibleSession = select.get({ sessionId: req.session.sessionId });
      if( !possibleSession || !possibleSession.projectUuid ) {
        reply.status(401).send();
        return;
      }
      const session = possibleSession as ProjectSession;

      const getPlayer = app.db.prepare(`
        SELECT * FROM project_players
        WHERE projectUuid=@projectUuid AND uuid=@playerUuid AND deleted=0
      `)
      const player = getPlayer.get({
        projectUuid: session.projectUuid,
        playerUuid: session.playerUuid
      }) as SavedPlayer | undefined;

      if( !player ) {
        reply.status(404).send();
        return;
      }

      reply.status(200).send(playerToGame(player));
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Reply: number | undefined;
  }>('/me/balance', (req, reply) => {
    try {
      const balance = getPlayerBalance(app, req.session.projectUuid, req.session.playerUuid);
      reply.status(200).send(balance);
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })
}