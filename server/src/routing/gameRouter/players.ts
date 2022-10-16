import { FastifyInstance } from "fastify";
import { playerToGame } from "../../conversions/toGame";
import { GamePlayer, SavedPlayer } from "../../qr-types";

export function applyPlayerRoutes(app: FastifyInstance) {
  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Reply: GamePlayer[] | { message: string };
  }>('/players', (req, reply) => {
    //TODO implement
    reply.status(200).send([])
  })

  app.get<{
    Header: {
      authorization: string | undefined;
    },
    Params: {
      playerUuid: string;
    },
    Reply: GamePlayer | { message: string };
  }>('/players/:playerUuid', (req, reply) => {
    try {
      const getPlayer = app.db.prepare(`
        SELECT * FROM project_players
        WHERE uuid=@uuid AND deleted=0
      `)
      const player = getPlayer.get({
        uuid: req.params.playerUuid
      }) as SavedPlayer
      reply.status(200).send(playerToGame(player))
    } catch (e) {
      console.error(e.message);
      reply.status(500).send({ message: e.message })
    }
  })
}