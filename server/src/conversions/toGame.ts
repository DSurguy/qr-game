import { GameProjectType, SavedProjectType } from "@qr-game/types";

export function projectToGame(project: SavedProjectType): GameProjectType {
  return {
    uuid: project.uuid,
    wordId: project.wordId,
    name: project.name,
    description: project.description
  };
}