import { GamePlayerType, GameProjectType, SavedPlayerType, SavedProjectType } from "@qr-game/types";

export function projectToGame(project: SavedProjectType): GameProjectType {
  return {
    uuid: project.uuid,
    wordId: project.wordId,
    name: project.name,
    description: project.description
  };
}

export function playerToGame(player: SavedPlayerType): GamePlayerType {
  return {
    projectUuid: player.projectUuid,
    uuid: player.uuid,
    wordId: player.wordId,
    name: player.name,
    realName: player.realName,
    claimed: player.claimed
  };
}