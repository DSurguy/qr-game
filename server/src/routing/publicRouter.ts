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

  app.post<{
    Params: {
      playerUuid: string;
    },
    Body: {
      projectUuid: string;
      displayName: string;
      realName: string;
      //avatar: string;
    }
    Reply: GamePlayerType | undefined;
  }>('/player/:playerUuid/claim', (req, reply) => {
    try {
      const { playerUuid } = req.params;
      const { projectUuid, displayName, realName } = req.body;
      console.log({
        projectUuid, playerUuid, displayName, realName
      })

      const getPlayer = app.db.prepare(`
        SELECT * FROM project_players
        WHERE
          projectUuid=@projectUuid AND
          uuid=@playerUuid AND
          claimed=0 AND
          deleted=0
      `);
      const player = getPlayer.get({ projectUuid, playerUuid })
      if( !player ) {
        reply.status(404).send();
        return;
      }
      
      const claimPlayer = app.db.prepare(`
        UPDATE project_players
        SET name=@name, realName=@realName, claimed=1, updatedAt=@timestamp
        WHERE projectUuid=@projectUuid AND uuid=@playerUuid AND deleted = 0
      `)
      claimPlayer.run({
        projectUuid,
        playerUuid,
        name: displayName,
        realName,
        timestamp: Date.now()
      })

      const getUpdatedPlayer = app.db.prepare(`
        SELECT * FROM project_players
        WHERE
          projectUuid=@projectUuid AND
          uuid=@playerUuid AND
          claimed=1 AND
          deleted=0
      `);

      const updatedPlayer = getUpdatedPlayer.get({
        projectUuid,
        playerUuid
      })

      reply.status(200).send(playerToGame(updatedPlayer))

    } catch (e) {
      console.error(e.message);
      reply.status(500).send();
    }
  })

  done();
}