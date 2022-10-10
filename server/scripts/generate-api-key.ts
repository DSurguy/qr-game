import { writeFile, rename, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "path";

(async () => {
  const newKey = randomUUID();

  //back up the existing file first
  try {
    await rm(resolve(__dirname, '../conf/nginx-api-key.old'))
  } catch {}
  try {
    await rename(resolve(__dirname, '../conf/nginx-api-key'), resolve(__dirname, '../conf/nginx-api-key.old'))
  } catch (e) {
    console.warn("Unable to back up existing nginx conf, it may not exist", e.message);
  }

  try {
    await writeFile(resolve(__dirname, '../conf/nginx-api-key'),
`if ($http_api-key != "${newKey}") {
  return 401;
}
`)
  } catch (e) {
    console.error("Unable to create nginx config block", e.message);
  }

  console.log("Done");
})()