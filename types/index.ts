import { Static, Type } from '@sinclair/typebox'

const savedItemBase = {
  updatedAt: Type.Number(),
  createdAt: Type.Number(),
  deleted: Type.Boolean(),
}

const projectBase = {
  name: Type.String(),
  description: Type.String()
}

export const UnsavedProject = Type.Object({
  ...projectBase
})
export const SavedProject = Type.Object({
  uuid: Type.String(),
  wordId: Type.String(),
  ...savedItemBase,
  ...projectBase
})

export type UnsavedProjectType = Static<typeof UnsavedProject>
export type SavedProjectType = Static<typeof SavedProject>

const activityBase = {
  name: Type.String(),
  description: Type.String(),
  value: Type.Number(),
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

export type ProjectSettings = {
  numPlayers: number;
  duels: {
    allow: boolean;
    allowRematch: boolean;
  }
}