import { GamePlayerType, SavedPlayerType } from "@qr-game/types";
import { FastifyPluginCallback } from "fastify";
import { playerToGame } from "../conversions/toGame";

export const publicRouter: FastifyPluginCallback = (app, options, done) => {
  app.get<{
    Querystring: {
      projectUuid: string;
    },
    Params: {
      playerUuid: string;
    }
    Reply: GamePlayerType | undefined;
  }>('/player/:playerUuid', (req, reply) => {
    try {
      const { projectUuid } = req.query;
      const { playerUuid } = req.params;
      const getPlayer = app.db.prepare(`
        SELECT * FROM project_players
        WHERE projectUuid=@projectUuid AND uuid=@playerUuid AND deleted=0
      `)
      const player = getPlayer.get({
        projectUuid: projectUuid,
        playerUuid: playerUuid
      }) as SavedPlayerType | undefined;

      if( !player ) {
        reply.status(404).send();
        return;
      }

      else reply.status(200).send(playerToGame(player));
    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })

  done();
}