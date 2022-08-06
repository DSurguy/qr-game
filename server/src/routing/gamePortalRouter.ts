import { FastifyPluginCallback } from "fastify"

// /api/admin/*
// ----
// BASE /api/game/portal/*
// POST /api/game/portal/player?playerUuid&projectUuid
// ----
// BASE /api/game/* <authenticated>
// GET  /api/game - project info
// GET  /api/game/me - current authenticated player info
// GET  /api/game/players - all claimed players
// GET  /api/game/players/:playerUuid - specific player info


// /portal
export const gamePortalRouter: FastifyPluginCallback = (app, options, done) => {
  // /player
  //   - if( not authenticated && claimed ) login
  //   - if( not authenticated && not claimed ) claim [client-side]
  //   - if( logged in as same ) view same profile [client-side]
  //   - if( logged in as other && duel pending ) connect duel
  //   - if( logged in as other && other claimed ) view other profile [client-side]
  
  // /activity
  //   - if( not authenticated ) view activity details [client-side]
  //   - if(  )

  app.post<{
    Querystring: {
      playerUuid: string;
      projectUuid: string;
    },
    Cookies: {
      qrGameSession: string | undefined;
    }
  }>('/player', (req, reply) => {
    try {
      const { playerUuid, projectUuid } = req.query;
      //const { qrGameSession } = req.cookies;
      //TODO: don't overwrite session
      const sessionId = app.sessions.startSession(projectUuid, playerUuid)
      const signedSessionId = app.signCookie(sessionId);
      reply.status(200).send({
        target: '/game/me',
        setAuth: signedSessionId
      });
    } catch (e) {
      reply.status(500).send();
    }
  })

  done()
}