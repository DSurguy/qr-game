import { FastifyInstance } from "fastify";

export const getPlayerBalance = (app: FastifyInstance, projectUuid: string, playerUuid: string): number => {
  const select = app.db.prepare(`
    SELECT SUM(amount) as playerBalance FROM project_transactions
    WHERE projectUuid=@projectUuid AND playerUuid=@playerUuid
  `)
  let { playerBalance } = select.get({
    projectUuid,
    playerUuid
  }) as { playerBalance: number } | undefined
  if( !playerBalance ) playerBalance = 0;
  return playerBalance;
}