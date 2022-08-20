This package now has to be built every time it changes. The build copies the index.ts file as `qr-types.ts` into the `/src` folder of every sub-project.

There's some weird issue with enums and symlinks that I'm working through.

Even in game-client, the loaders are still confused.