import { FastifyInstance } from "fastify";

export function applyPlayerRoutes(app: FastifyInstance) {
  app.post<{
    Querystring: {
      playerUuid: string;
      projectUuid: string;
    },
    Headers: {
      authorization?: string;
    }
  }>('/player', (req, reply) => {
    try {
      const { playerUuid, projectUuid } = req.query;

      const getPlayer = app.db.prepare(`SELECT * FROM project_players WHERE projectUuid=@projectUuid AND uuid=@playerUuid AND deleted=0`);
      const player = getPlayer.get({ projectUuid, playerUuid })
      if( !player ) return reply.status(404).send();

      const sessionHeader = req.headers.authorization && app.unsignCookie(req.headers.authorization).value;
      const session = sessionHeader && app.sessions.getSession(sessionHeader);
      //TODO: maybe force log out if session expired? Don't want people to accidentally log in.
      if( session ) {
        if( player.uuid === session.playerUuid ) {
          reply.status(200).send({
            target: '/game/me'
          });
        }
        else {
          reply.status(200).send({
            target: `/game/player/${player.uuid}`,
          });
        }
      }
      else{
        if( player.claimed ) {
          const sessionId = app.sessions.startSession(projectUuid, playerUuid)
          const signedSessionId = app.signCookie(sessionId);
          reply.status(200).send({
            target: '/game/me',
            setAuth: signedSessionId
          });
        } else {
          reply.status(200).send({
            target: `/player?game=${projectUuid}&player=${playerUuid}`
          })
        }
      }
    } catch (e) {
      reply.status(500).send();
    }
  })
}