import { Database } from 'better-sqlite3';
import fastify from 'fastify';
import { PluginManager } from './plugins/pluginManager';
import SessionManager from './sessionManager';

declare module 'fastify' {
  export interface FastifyInstance{
    db: Database;
    sessions: SessionManager;
    plugins: PluginManager;
    //FIXME: Find out why the types aren't loading from the plugin
    /**
     * Unsigns the specified cookie using the secret provided.
     * @param value Cookie value
     */
     unsignCookie(value: string): {
      valid: boolean;
      renew: boolean;
      value: string | null;
    };
    /**
     * Manual cookie parsing method
     * @docs https://github.com/fastify/fastify-cookie#manual-cookie-parsing
     * @param cookieHeader Raw cookie header value
     */
    parseCookie(cookieHeader: string): {
      [key: string]: string;
    };
    /**
     * Manual cookie signing method
     * @docs https://github.com/fastify/fastify-cookie#manual-cookie-parsing
     * @param value cookie value
     */
    signCookie(value: string): string;
  }
  //TODO: Somehow scope this
  export interface FastifyRequest {
    session?: GameSession;
  }
}

export type Player = {
  uuid: string;
  wordId: string;
  name?: string;
}

export type Team = {
  uuid: string;
  wordId: string;
  name?: string;
  color: string;
}

export type Activity = {
  uuid: string;
  wordId: string;
  name: string;
  description?: string;
  value: number;
}

export type ProjectDefinition = {
  uuid: string;
  name: string;
  settings: {
    allowDuels: boolean;
  },
  teams?: Team[];
  players: Player[];
  activities: Activity[];
  duelActivities?: Activity[];
}

export type ProjectSession = {
  projectUuid: string;
  playerUuid: string;
  sessionId: string;
}

export type GameSession = {
  projectUuid: string;
  playerUuid: string;
  sessionId: string;
}
