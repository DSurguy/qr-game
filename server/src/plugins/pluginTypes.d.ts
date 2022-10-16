import { Database } from "better-sqlite3";
import { ProjectItem, Tag } from "../qr-types"
import { GameSession } from "../types";

export interface StandardHookPayload {
  session: GameSession;
  db: Database;
}

export interface ItemRedemptionHookPayload extends StandardHookPayload {
  item: ProjectItem;
  redemptionEventUuid: string;
  tags: Tag[];
}
export type ItemRedemptionHookHandler = (payload: ItemRedemptionHookPayload) => void;

type PluginPayload = {
  addItemRedemptionHook: (handler: ItemRedemptionHookHandler) => void;
  removeItemRedemptionHook: (handler: ItemRedemptionHookHandler) => void;
}

export type QrGamePlugin = (payload: PluginPayload) => void;