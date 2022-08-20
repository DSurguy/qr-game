import { copyFile } from 'node:fs/promises';

(async() => {
  try {
    await copyFile('index.ts', '../server/src/qr-types.ts')
    await copyFile('index.ts', '../admin-client/src/qr-types.ts')
    await copyFile('index.ts', '../game-client/src/qr-types.ts')
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})()