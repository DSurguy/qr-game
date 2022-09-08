interface SavedItemBase {
  updatedAt: number;
  createdAt: number;
  deleted: boolean;
}

interface ProjectSettingsBase {
  duels: {
    allow: boolean;
    allowRematch: boolean;
  },
  initialPlayerBalance: number;
}

export interface UnsavedProjectSettings extends ProjectSettingsBase {}

export interface ProjectSettings extends ProjectSettingsBase, SavedItemBase {}

interface ProjectBase {
  name: string;
  description: string;
}

export interface UnsavedProject extends ProjectBase {
  settings: UnsavedProjectSettings,
  numPlayers: number;
}

export interface SavedProject extends ProjectBase, SavedItemBase {
  uuid: string;
  wordId: string;
}

export interface GameProject extends ProjectBase {
  uuid: string;
  wordId: string;
}

interface ActivityBase {
  name: string;
  description: string;
  value: number;
  isRepeatable: boolean;
  repeatValue: number;
  isDuel: boolean;
}

export interface UnsavedActivity extends ActivityBase {}
export interface SavedActivity extends ActivityBase, SavedItemBase {
  projectUuid: string;
  uuid: string;
  wordId: string;
}

export interface PlayerBase {
  uuid: string;
  wordId: string;
  name: string;
  realName: string;
}

export interface SavedPlayer extends PlayerBase, SavedItemBase {
  projectUuid: string;
  claimed: number;
}

export interface GamePlayer extends PlayerBase {
  projectUuid: string;
  claimed: number;
}

export interface CreatePlayerPayload {
  numPlayers: number;
}

export enum GameEventType {
  ActivityCompleted = "ACTIVITY_COMPLETED",
  PlayerClaimed = "PLAYER_CLAIMED"
}

export type PlayerClaimedEventPayload = {
  playerUuid: string;
  displayName: string;
  realName: string;
}

export type ActivityCompletedEventPayload = {
  playerUuid: string;
  activityUuid: string;
  isRepeat: boolean;
}

export type GameEvent = {
  projectUuid: string;
  uuid: String;
  type: GameEventType;
  payload: PlayerClaimedEventPayload | ActivityCompletedEventPayload;
  primaryUuid?: string;
  secondaryUuid?: string;
  timestamp: number;
}

export const enum DuelState {
  Created = "CREATED",
  Pending = "PENDING_RESPONSE",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
  PendingCancel = "PENDING_CANCEL",
  Cancelled = "CANCELLED",
  PendingRecipientConfirm = "PENDING_RECIPIENT_CONFIRM",
  PendingInitiatorConfirm = "PENDING_INITIATOR_CONFIRM",
  Complete = "COMPLETE",
}

export interface UnsavedDuel {
  projectUuid: string;
  uuid: string;
  initiatorUuid: string;
  recipientUuid: string;
  activityUuid: string;
  state: DuelState;
  victorUuid: string;
}

export interface Duel extends UnsavedDuel, SavedItemBase {}

export const enum ChangeType {
  AddRecipient = "ADD_RECIPIENT",
  RecipientConfirm = "RECIPIENT_CONFIRM",
  Cancel = "CANCEL",
  CancelConfirm = "CANCEL_CONFIRM",
  Victor = "VICTOR",
  VictorConfirm = "VICTOR_CCONFIRM"
}

export type UpdateDuelAddRecipientPayload = {
  changeType: ChangeType.AddRecipient;
  payload: {
    recipientUuid: string;
  }
}

export type UpdateDuelRecipientConfirmPayload = {
  changeType: ChangeType.RecipientConfirm;
  payload: {
    accepted: boolean;
  }
}

export type UpdateDuelCancelPayload = {
  changeType: ChangeType.Cancel;
  payload: {}
}

export type UpdateDuelCancelConfirmPayload = {
  changeType: ChangeType.CancelConfirm;
  payload: {
    accepted: boolean;
  }
}

export type UpdateDuelVictorPayload = {
  changeType: ChangeType.Victor;
  payload: {
    initiatorVictory: boolean;
  }
}

export type UpdateDuelVictorConfirmPayload = {
  changeType: ChangeType.VictorConfirm;
  payload: {
    accepted: boolean;
  }
}

export type UpdateDuelPayload = 
UpdateDuelAddRecipientPayload |
UpdateDuelRecipientConfirmPayload |
UpdateDuelCancelPayload |
UpdateDuelCancelConfirmPayload |
UpdateDuelVictorPayload |
UpdateDuelVictorConfirmPayload;

export interface GameDuel extends Duel {
  activity: ActivityBase;
  initiator: null | PlayerBase;
  recipient: null | PlayerBase;
}

//v1.0.6