export type ApiActionCallback<T> = (actionWasSuccessful: boolean, data?: T) => void;

declare global {
  const PROCESS_ENV_API_KEY: string;
  const PROCESS_ENV_SERVER_ORIGIN: string;
}
