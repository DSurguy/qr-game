export type ProjectMeta = {
  uuid: string;
  wordId: string;
  name: string;
  description: string;
  updatedAt: unknown;
  createdAt: unknown;
}

export type ApiActionCallback = (actionWasSuccessful: boolean) => void;