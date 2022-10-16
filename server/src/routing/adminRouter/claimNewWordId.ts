import { FastifyInstance } from "fastify";
import { getRandomInt } from "../../utils/random";
import animals from '../../lists/animals.js';
import adjectives from '../../lists/adjectives.js';

const getRandomListItem = (list: string[]) => list[getRandomInt(0, list.length)];

export const claimNewWordId = (app: FastifyInstance, projectUuid: string): string => {
  let wordId = getRandomListItem(adjectives) + getRandomListItem(adjectives) + getRandomListItem(animals);
  const selectWordId = app.db.prepare(`
    SELECT * FROM project_wordIds
    WHERE projectUuid=@projectUuid AND wordId=@wordId
  `)
  const insertNewWordId = app.db.prepare(`
    INSERT INTO project_wordIds (projectUuid, wordId)
    VALUES (@projectUuid, @wordId)
  `)
  let existingId = selectWordId.get({ projectUuid, wordId })
  while(existingId) {
    wordId = getRandomListItem(adjectives) + getRandomListItem(adjectives) + getRandomListItem(animals);
    existingId = selectWordId.get({ projectUuid, wordId })
  }
  insertNewWordId.run({ projectUuid, wordId })
  return wordId;
}