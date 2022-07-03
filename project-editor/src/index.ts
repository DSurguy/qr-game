import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import animals from './lists/animals.js';
import adjectives from './lists/adjectives.js';

const allowDuels = true;
const numPlayers = 50;
const numTeams = 3;
const activities = [
  {
    name: "Test Activity",
    description: "asdf asdf asdf asdf",
    value: 1
  }
]
const duelActivities = [
  {
    name: "Test Duel Activity",
    description: "fkljasdif as;dkljf aslkdjfh aklsdjhf asdlf",
    value: 1
  }
]

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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

(async () => {
  const animalList = animals.slice(0);
  const adjectiveList = adjectives.slice(0);

  let consumedWords = new Set<string>();

  const getRandomListItem = (list: string[]) => list[getRandomInt(0, list.length)];
  const generateNextWordId = () => {
    let generatedWord = getRandomListItem(adjectiveList) + getRandomListItem(adjectiveList) + getRandomListItem(animalList);
    while(consumedWords.has(generatedWord)){
      generatedWord = getRandomListItem(adjectiveList) + getRandomListItem(adjectiveList) + getRandomListItem(animalList);
    }

    return generatedWord;
  }
  const project: ProjectDefinition = {
    uuid: randomUUID(),
    name: "test project",
    settings: {
      allowDuels
    },
    players: [],
    activities: [],
    duelActivities: []
  };
  for( let i=0; i<numPlayers; i++ ) {
    project.players.push({
      uuid: randomUUID(),
      wordId: generateNextWordId()
    })
  }
  for( let activity of activities ) {
    project.activities.push({
      uuid: randomUUID(),
      wordId: generateNextWordId(),
      name: activity.name,
      description: activity.description,
      value: activity.value
    })
  }
  for( let activity of duelActivities ) {
    project.duelActivities.push({
      uuid: randomUUID(),
      wordId: generateNextWordId(),
      name: activity.name,
      description: activity.description,
      value: activity.value
    })
  }

  try {
    if( ! existsSync(resolve(__dirname, 'output'))) await mkdir(resolve(__dirname, 'output'))
    await writeFile(resolve(__dirname, `output/${project.uuid}.json`), JSON.stringify(project, null, 2));
  } catch (e) {
    console.log("Unable to write project definition to file");
    console.error(e);
    process.exit(1);
  }
})();