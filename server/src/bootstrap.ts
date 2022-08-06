import { resolve } from 'node:path';
import Database from 'better-sqlite3';

export function bootstrap(path: string = "") {
  try {
    //create database if not exist
    const db = new Database(resolve(path, "qrgame.db"))

    //create tables if not exist
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
        createdAt INTEGER,
        updatedAt INTEGER,
        PRIMARY KEY (projectUuid, uuid)
      )
    `)
    stmt.run();

    stmt = db.prepare(`
      CREATE TABLE IF NOT EXISTS project_duel_activities (
        projectUuid TEXT REFERENCES projects(uuid),
        uuid TEXT,
        wordId TEXT,
        deleted INTEGER,
        name TEXT,
        description TEXT,
        value INTEGER,
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
        claimed INTEGER,
        createdAt INTEGER,
        updatedAt INTEGER,
        UNIQUE (projectUuid, uuid)
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
        FOREIGN KEY ( projectUuid, playerUuid ) REFERENCES project_players ( projectUuid, uuid )
      )
    `)
    stmt.run();

    console.log("Database bootstrapped");

    return db;

  } catch (e) {
    console.log("Failed to bootstrap");
    console.error(e);
    process.exit(1);
  }
}