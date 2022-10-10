import { writeFile, rename, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "path";
import staticConfig from '../conf/staticConfig';

(async () => {
  const newApiKey = randomUUID();

  //back up the existing file first
  try {
    await rm(resolve(__dirname, '../.env.old'))
  } catch {}
  try {
    await rename(resolve(__dirname, '../.env'), resolve(__dirname, '../.env.old'))
  } catch (e) {
    console.warn("Unable to back up existing env, it may not exist", e.message);
  }

  const newEnv: [string, string|number][] = [
    ["API_KEY", newApiKey]
  ]

  Object.entries(staticConfig as Record<string,string|number>).forEach(entry => {
    newEnv.push([entry[0], entry[1]])
  })

  try {
    await writeFile(resolve(__dirname, '../.env'), newEnv.map(entry => `${entry[0]}=${entry[1]}\n`))
  } catch (e) {
    console.error("Unable to create nginx config block", e.message);
  }

  console.log("Done");
})()