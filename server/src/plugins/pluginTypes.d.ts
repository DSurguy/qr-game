import { Database } from "better-sqlite3";
import { Duel, PluginHookResponse, PluginPreHookResponse, ProjectItem, Tag } from "../qr-types"
import { GameSession } from "../types";

export interface StandardHookPayload {
  session: GameSession;
  db: Database;
}

export interface ItemPreRedemptionHookPayload extends StandardHookPayload {
  item: ProjectItem;
  tags: Tag[];
}

export interface ItemRedemptionHookPayload extends StandardHookPayload {
  item: ProjectItem;
  redemptionEventUuid: string;
  tags: Tag[];
}

export interface DuelCompleteHookPayload extends StandardHookPayload {
  duel: Duel;
}

export interface DuelCancelledHookPayload extends StandardHookPayload {
  duel: Duel;
}

export type ItemRedemptionHookHandler = (payload: ItemRedemptionHookPayload) => PluginHookResponse | void;
export type ItemPreRedemptionHookHandler = (payload: ItemPreRedemptionHookPayload) => PluginPreHookResponse | void;
export type DuelCompleteHookHandler = (payload: DuelCompleteHookPayload) => PluginHookResponse | void;
export type DuelCancelledHookHandler = (payload: DuelCancelledHookPayload) => PluginHookResponse | void;

type PluginPayload = {
  addItemRedemptionHook: (handler: ItemRedemptionHookHandler) => void;
  removeItemRedemptionHook: (handler: ItemRedemptionHookHandler) => void;
  addItemPreRedemptionHook: (handler: ItemPreRedemptionHookHandler) => void;
  removeItemPreRedemptionHook: (handler: ItemPreRedemptionHookHandler) => void;
  addDuelCompleteHook: (handler: DuelCompleteHookHandler) => void;
  removeDuelCompleteHook: (handler: DuelCompleteHookHandler) => void;
  addDuelCancelledHook: (handler: DuelCancelledHookHandler) => void;
  removeDuelCancelledHook: (handler: DuelCancelledHookHandler) => void;
}

export type QrGamePlugin = (payload: PluginPayload) => void;