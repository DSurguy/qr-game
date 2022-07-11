import { Static, Type } from '@sinclair/typebox'

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
  ...projectBase
})

export type UnsavedProjectType = Static<typeof UnsavedProject>
export type SavedProjectType = Static<typeof SavedProject>