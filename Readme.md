# Required Stack
- pnpm: https://pnpm.io/installation
- node v16, you can manage node installations with one of the following:
  - https://github.com/nvm-sh/nvm
  - https://github.com/coreybutler/nvm-windows (this one kinda sucks)
  - https://volta.sh/
  - https://scoop.sh/

# Running the project
- run `pnpm install` at the root of the project
- open a new terminal window:
  - `cd server`
  - `pnpm dev`
- open a SECOND terminal window:
  - `cd admin-client`
  - `pnpm start`
- open YET A THIRD TERMINAL WINDOW:
  - `cd game-client`
  - `pnpm start`
- Visit `localhost:8080` and `localhost:8081` in your browser

A **sqlite** database will be created in the `runtime` folder of the project, and you can inspect/edit it with any normal sql/sqlite editor you choose.

Every time the server starts, it will attempt to bootstrap the database (creating it and/or tables if they don't exist), so if you want to start fresh, just delete the DB and restart the server.