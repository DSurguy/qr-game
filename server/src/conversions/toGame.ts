import { GamePlayer, GameProject, SavedPlayer, SavedProject } from "../qr-types";

export function projectToGame(project: SavedProject): GameProject {
  return {
    uuid: project.uuid,
    wordId: project.wordId,
    name: project.name,
    description: project.description
  };
}

export function playerToGame(player: SavedPlayer): GamePlayer {
  return {
    projectUuid: player.projectUuid,
    uuid: player.uuid,
    wordId: player.wordId,
    name: player.name,
    realName: player.realName,
    claimed: player.claimed
  };
}