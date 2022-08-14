import { Static, Type } from '@sinclair/typebox'

const savedItemBase = {
  updatedAt: Type.Number(),
  createdAt: Type.Number(),
  deleted: Type.Boolean(),
}

export const ProjectSettings = Type.Object({
  duels: Type.Object({
    allow: Type.Boolean(),
    allowRematch: Type.Boolean(),
  })
});

export type ProjectSettingsType = Static<typeof ProjectSettings>;

const projectBase = {
  name: Type.String(),
  description: Type.String()
}

export const UnsavedProject = Type.Object({
  ...projectBase,
  settings: ProjectSettings,
  numPlayers: Type.Number()
})
export const SavedProject = Type.Object({
  uuid: Type.String(),
  wordId: Type.String(),
  ...savedItemBase,
  ...projectBase
})

export const GameProject = Type.Object({
  uuid: Type.String(),
  wordId: Type.String(),
  ...projectBase
})

export type UnsavedProjectType = Static<typeof UnsavedProject>
export type SavedProjectType = Static<typeof SavedProject>
export type GameProjectType = Static<typeof GameProject>

const activityBase = {
  name: Type.String(),
  description: Type.String(),
  value: Type.Number(),
  isRepeatable: Type.Boolean(),
  repeatValue: Type.Number()
}

export const UnsavedActivity = Type.Object({
  ...activityBase
})
export const SavedActivity = Type.Object({
  projectUuid: Type.String(),
  uuid: Type.String(),
  wordId: Type.String(),
  ...savedItemBase,
  ...activityBase
})

export type UnsavedActivityType = Static<typeof UnsavedActivity>
export type SavedActivityType = Static<typeof SavedActivity>

export const UnsavedDuelActivity = Type.Object({
  ...activityBase
})
export const SavedDuelActivity = Type.Object({
  projectUuid: Type.String(),
  uuid: Type.String(),
  wordId: Type.String(),
  ...savedItemBase,
  ...activityBase
})

export type UnsavedDuelActivityType = Static<typeof UnsavedDuelActivity>
export type SavedDuelActivityType = Static<typeof SavedDuelActivity>

export const SavedPlayer = Type.Object({
  projectUuid: Type.String(),
  uuid: Type.String(),
  wordId: Type.String(),
  name: Type.String(),
  realName: Type.String(),
  claimed: Type.Number(),
  ...savedItemBase
})

export const GamePlayer = Type.Object({
  projectUuid: Type.String(),
  uuid: Type.String(),
  wordId: Type.String(),
  name: Type.String(),
  realName: Type.String(),
  claimed: Type.Number(),
})

export type SavedPlayerType = Static<typeof SavedPlayer>
export type GamePlayerType = Static<typeof GamePlayer>

export const CreatePlayerPayload = Type.Object({
  numPlayers: Type.Number()
})

export type CreatePlayerPayloadType = Static<typeof CreatePlayerPayload>;