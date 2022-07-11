import { resolve } from 'node:path';
import Database from 'better-sqlite3';

export function bootstrap(path: string = "") {
  try {
    //create database if not exist
    const db = new Database(resolve(path, "qrgame.db"))

    //create tables if not exist
    let stmt = db.prepare("CREATE TABLE IF NOT EXISTS projects (uuid TEXT PRIMARY KEY, wordId TEXT, deleted INTEGER, name TEXT, description TEXT)")
    stmt.run();

    console.log("Database bootstrapped");

    return db;

  } catch (e) {
    console.log("Failed to bootstrap");
    console.error(e);
    process.exit(1);
  }
}