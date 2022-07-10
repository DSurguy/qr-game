type Player = {
  uuid: string;
  wordId: string;
  name?: string;
}

type Team = {
  uuid: string;
  wordId: string;
  name?: string;
  color: string;
}

type Activity = {
  uuid: string;
  wordId: string;
  name: string;
  description?: string;
  value: number;
}

type ProjectDefinition = {
  uuid: string;
  name: string;
  settings: {
    allowDuels: boolean;
  },
  teams?: Team[];
  players: Player[];
  activities: Activity[];
  duelActivities?: Activity[];
}