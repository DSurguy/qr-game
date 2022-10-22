import { createContext } from "react";
import { PluginHookResponse, PluginPreHookResponse } from "../qr-types";

export interface HookResponseWithId extends PluginHookResponse {
  id: string;
}

export type HookResponseContextValue = {
  responses: HookResponseWithId[],
  addResponses: (responses: PluginHookResponse[]) => void;
  addPreResponses: (responses: PluginPreHookResponse[]) => void;
  removeResponse: (responseId: string) => void;
}

const defaultValue = {
  responses: [] as HookResponseWithId[],
  addResponses: () => {},
  addPreResponses: () => {},
  removeResponse: () => {}
}

export const HookResponseContext = createContext<HookResponseContextValue>(defaultValue);