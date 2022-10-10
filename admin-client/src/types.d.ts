export type ProjectMeta = {
  uuid: string;
  wordId: string;
  name: string;
  description: string;
  updatedAt: unknown;
  createdAt: unknown;
}

export type ApiActionCallback = (actionWasSuccessful: boolean) => void;

declare global {
  const PROCESS_ENV_API_KEY: string;
  const PROCESS_ENV_SERVER_ORIGIN: string;
  const PROCESS_ENV_CLIENT_ORIGIN: string;
}