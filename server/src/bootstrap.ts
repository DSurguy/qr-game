import { resolve } from 'node:path';
import Database from 'better-sqlite3';

export function bootstrap(path: string = "") {
  try {
    //create database if not exist
    const db = new Database(resolve(path, "qrgame.db"))

    //create tables if not exist
    const bootstrapTransaction = db.transaction(() => {
      let stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS projects (
          uuid TEXT PRIMARY KEY,
          wordId TEXT,
          deleted INTEGER,
          name TEXT,
          description TEXT,
          createdAt INTEGER,
          updatedAt INTEGER
        )
      `)
      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_settings (
          uuid TEXT PRIMARY KEY REFERENCES projects(uuid),
          jsonData TEXT,
          updatedAt INTEGER
        )
      `)
      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_activities (
          projectUuid TEXT REFERENCES projects(uuid),
          uuid TEXT,
          wordId TEXT,
          deleted INTEGER,
          name TEXT,
          description TEXT,
          value INTEGER,
          isRepeatable INTEGER,
          isDuel INTEGER,
          repeatValue INTEGER,
          createdAt INTEGER,
          updatedAt INTEGER,
          PRIMARY KEY (projectUuid, uuid)
        )
      `)
      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_players (
          projectUuid TEXT REFERENCES projects(uuid),
          uuid TEXT,
          wordId TEXT,
          deleted INTEGER,
          name TEXT,
          realName TEXT,
          claimed INTEGER,
          createdAt INTEGER,
          updatedAt INTEGER,
          PRIMARY KEY (projectUuid, uuid)
        )
      `)
      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_wordIds (
          projectUuid TEXT REFERENCES projects(uuid),
          wordId TEXT
        )
      `)
      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_sessions (
          projectUuid TEXT,
          playerUuid TEXT,
          sessionId TEXT,
          UNIQUE (projectUuid, playerUuid),
          UNIQUE (projectUuid, sessionId),
          FOREIGN KEY ( projectUuid, playerUuid ) REFERENCES project_players ( projectUuid, uuid ),
          PRIMARY KEY ( sessionId )
        )
      `)
      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_events (
          projectUuid TEXT NOT NULL,
          uuid TEXT NOT NULL,
          type TEXT NOT NULL,
          payload TEXT,
          primaryUuid TEXT,
          secondaryUuid TEXT,
          timestamp INTEGER,
          UNIQUE (projectUuid, uuid),
          FOREIGN KEY ( projectUuid ) REFERENCES projects ( uuid )
        )
      `)
      stmt.run()

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_transactions (
          projectUuid TEXT,
          playerUuid TEXT,
          eventUuid TEXT,
          amount INTEGER,
          timestamp INTEGER,
          FOREIGN KEY ( projectUuid, playerUuid ) REFERENCES project_players ( projectUuid, uuid ),
          FOREIGN KEY ( projectUuid, eventUuid ) REFERENCES project_events ( projectUuid, uuid )
        )
      `)
      stmt.run();
      
      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_duels (
          projectUuid TEXT,
          uuid TEXT,
          initiatorUuid TEXT,
          recipientUuid TEXT,
          activityUuid TEXT,
          state TEXT,
          victorUuid TEXT,
          createdAt INTEGER,
          updatedAt INTEGER,
          deleted INTEGER,
          PRIMARY KEY ( projectUuid, uuid ),
          FOREIGN KEY ( projectUuid, initiatorUuid ) REFERENCES project_players ( projectUuid, uuid ),
          FOREIGN KEY ( projectUuid, recipientUuid ) REFERENCES project_players ( projectUuid, uuid ),
          FOREIGN KEY ( projectUuid, victorUuid ) REFERENCES project_players ( projectUuid, uuid ),
          FOREIGN KEY ( projectUuid, activityUuid ) REFERENCES project_activities ( projectUuid, uuid )
        )
      `)
      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_store_items (
          projectUuid TEXT,
          uuid TEXT,
          name TEXT,
          description TEXT,
          cost INTEGER,
          imageBase64 TEXT,
          availableForPurchase INTEGER,
          canPurchaseMultiple INTEGER,
          redemptionChallenge TEXT,
          createdAt INTEGER,
          updatedAt INTEGER,
          deleted INTEGER,
          PRIMARY KEY (projectUuid, uuid)
        )
      `)

      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS project_player_inventory (
          projectUuid TEXT,
          playerUuid TEXT,
          itemUuid TEXT,
          quantity INTEGER,
          quantityRedeemed INTEGER,
          FOREIGN KEY ( projectUuid, itemUuid ) REFERENCES project_store_items (projectUuid, uuid ),
          FOREIGN KEY ( projectUuid, playerUuid ) REFERENCES project_players (projectUuid, uuid ),
          PRIMARY KEY ( projectUuid, playerUuid, itemUuid )
        )
      `)

      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS store_item_tags (
          projectUuid TEXT,
          itemUuid TEXT,
          tag TEXT,
          value TEXT,
          FOREIGN KEY ( projectUuid, itemUuid ) REFERENCES project_store_items ( projectUuid, uuid ),
          PRIMARY KEY ( projectUuid, itemUuid, tag )
        )
      `)

      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS duel_tags (
          projectUuid TEXT,
          duelUuid TEXT,
          tag TEXT,
          value TEXT,
          FOREIGN KEY ( projectUuid, duelUuid ) REFERENCES project_duels ( projectUuid, uuid ),
          PRIMARY KEY ( projectUuid, duelUuid, tag )
        )
      `)

      stmt.run();

      stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS player_tags (
          projectUuid TEXT,
          playerUuid TEXT,
          tag TEXT,
          value TEXT,
          FOREIGN KEY ( projectUuid, playerUuid ) REFERENCES project_players ( projectUuid, uuid ),
          PRIMARY KEY ( projectUuid, playerUuid, tag )
        )
      `)

      stmt.run();
    })
    bootstrapTransaction();

    console.log("Database bootstrapped");

    return db;

  } catch (e) {
    console.log("Failed to bootstrap");
    console.error(e);
    process.exit(1);
  }
}