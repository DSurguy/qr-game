import { createContext } from "react";

export type PlayerBalanceContextValue = {
  balance: number;
  updateBalance: () => void;
}

const defaultValue = {
  balance: 0,
  updateBalance: () => {}
}

export const PlayerBalanceContext = createContext<PlayerBalanceContextValue>(defaultValue);