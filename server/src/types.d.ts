import { Database } from 'better-sqlite3';
import fastify from 'fastify';

declare module 'fastify' {
  export interface FastifyInstance{
    db: Database;
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
