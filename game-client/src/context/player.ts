import { createContext } from "react";
import { GamePlayer } from "../qr-types";

export type PlayerContextValue = {
  balance: number;
  player: null | GamePlayer;
  updateBalance: () => void;
}

const defaultValue: PlayerContextValue = {
  balance: 0,
  player: null,
  updateBalance: () => {}
}

export const PlayerContext = createContext<PlayerContextValue>(defaultValue);