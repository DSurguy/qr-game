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

export interface SavedPlayer extends SavedItemBase {
  projectUuid: string;
  uuid: string;
  wordId: string;
  name: string;
  realName: string;
  claimed: number;
}

export interface GamePlayer {
  projectUuid: string;
  uuid: string;
  wordId: string;
  name: string;
  realName: string;
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

export enum DuelState {
  Created = "CREATED",
  Pending = "PENDING",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
  Cancelled = "CANCELLED",
  Complete = "COMPLETE",
}

export interface UnsavedDuel {
  projectUuid: string;
  uuid: string;
  initiatorUuid: string;
  recipientUuid: string;
  activityUuid: string;
  state: string;
  victorUuid: string;
}

export interface Duel extends UnsavedDuel, SavedItemBase {}

//v1.0.2