import { randomUUID } from 'crypto';
import { FastifyPluginCallback } from 'fastify/types/plugin'
import { getRandomInt } from '../utils/random';
import { UnsavedProjectType, SavedProjectType } from './adminRouter.types';
import animals from '../lists/animals.js';
import adjectives from '../lists/adjectives.js';

export const adminRouter: FastifyPluginCallback = (app, options, done) => {
  app.get('/health', (req, reply) => {
    try {
      //See if we can access and pragma the database
      const info = app.db.pragma('table_info')
      setTimeout(() => {
        reply.code(200).send()
      }, 1000);
    } catch (e) {
      reply.code(500).send();
    }
  })
  app.post<{ Body: UnsavedProjectType, Reply: SavedProjectType }>('/project', (req, reply) => {
    const {
      name,
      description
    } = req.body;
    const uuid = randomUUID();
    const getRandomListItem = (list: string[]) => list[getRandomInt(0, list.length)];
    const wordId = getRandomListItem(adjectives) + getRandomListItem(adjectives) + getRandomListItem(animals);
    const insert = app.db.prepare(`INSERT INTO projects (uuid, wordId, name, description) VALUES (?,?,?,?)`)
    try {
      insert.run(uuid, wordId, name, description)
      reply.status(201).send({
        uuid,
        wordId,
        name,
        description
      });
    } catch (e) {
      console.error(e);
      reply.status(500).send()
    }
  })
  done()
}
