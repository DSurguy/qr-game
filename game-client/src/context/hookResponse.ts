import { createContext } from "react";
import { PluginHookResponse } from "../qr-types";

export interface HookResponseWithId extends PluginHookResponse {
  id: string;
}

export type HookResponseContextValue = {
  responses: HookResponseWithId[],
  addResponses: (responses: PluginHookResponse[]) => void;
  removeResponse: (responseId: string) => void;
}

const defaultValue = {
  responses: [] as HookResponseWithId[],
  addResponses: () => {},
  removeResponse: () => {}
}

export const HookResponseContext = createContext<HookResponseContextValue>(defaultValue);