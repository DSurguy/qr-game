import { Database } from "better-sqlite3";
import { Duel, PluginHookResponse, PluginPreHookResponse, ProjectItem, SavedActivity, SavedPlayer, Tag } from "../qr-types"
import { GameSession } from "../types";

export interface StandardHookPayload {
  session: GameSession;
  db: Database;
}

export interface UnauthenticatedHookPayload {
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

export interface PortalActivityHookPayload extends StandardHookPayload {
  session: GameSession;
  activity: SavedActivity;
}

export interface ClaimPlayerHookPayload extends UnauthenticatedHookPayload {
  player: SavedPlayer
}

export type ItemRedemptionHookHandler = (payload: ItemRedemptionHookPayload) => PluginHookResponse | void;
export type ItemPreRedemptionHookHandler = (payload: ItemPreRedemptionHookPayload) => PluginPreHookResponse | void;
export type DuelCompleteHookHandler = (payload: DuelCompleteHookPayload) => PluginHookResponse | void;
export type DuelCancelledHookHandler = (payload: DuelCancelledHookPayload) => PluginHookResponse | void;
export type PortalActivityHookHandler = (payload: PortalActivityHookPayload) => PluginHookResponse | void;
export type ClaimPlayerHookHandler = (payload: ClaimPlayerHookPayload) => PluginHookResponse | void;

type PluginPayload = {
  addItemRedemptionHook: (handler: ItemRedemptionHookHandler) => void;
  removeItemRedemptionHook: (handler: ItemRedemptionHookHandler) => void;
  addItemPreRedemptionHook: (handler: ItemPreRedemptionHookHandler) => void;
  removeItemPreRedemptionHook: (handler: ItemPreRedemptionHookHandler) => void;
  addDuelCompleteHook: (handler: DuelCompleteHookHandler) => void;
  removeDuelCompleteHook: (handler: DuelCompleteHookHandler) => void;
  addDuelCancelledHook: (handler: DuelCancelledHookHandler) => void;
  removeDuelCancelledHook: (handler: DuelCancelledHookHandler) => void;
  addPortalActivityHook: (handler: PortalActivityHookHandler) => void;
  removePortalActivityHook: (handler: PortalActivityHookHandler) => void;
  addClaimPlayerHook: (handler: ClaimPlayerHookHandler) => void;
  removeClaimPlayerHook: (handler: ClaimPlayerHookHandler) => void;
}

export type QrGamePlugin = (payload: PluginPayload) => void;