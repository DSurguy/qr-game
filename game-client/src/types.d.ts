export type ApiActionCallback = (actionWasSuccessful: boolean) => void;

declare global {
  const PROCESS_ENV_API_KEY: string;
}