import { Database } from "better-sqlite3";
import { randomUUID } from "crypto";

export default class SessionManager {
  private db: Database;
  constructor(db: Database) {
    this.db = db
  }

  /**
   * Attempt to log in a player by UUID. If the player is already logged in, the
   * old session will be removed, and a new session ID will be created.
   * @param {string} projectUuid The UUID of the project to login against
   * @param {string} playerUuid The UUID of the player attempting to login
   * @exception Will throw if database interaction fails
   * @returns {string} The UUID of the new session
   */
  public startSession(projectUuid: string, playerUuid: string): string {
    try {
      const newSession = randomUUID();
      const insert = this.db.prepare(`
        INSERT INTO project_sessions (projectUuid, playerUuid, sessionId)
        VALUES (@projectUuid, @playerUuid, @sessionId)
        ON CONFLICT (projectUuid, playerUuid) DO UPDATE SET
          projectUuid=@projectUuid,
          playerUuid=@playerUuid,
          sessionId=@sessionId
      `)
      insert.run({
        projectUuid: projectUuid,
        playerUuid: playerUuid,
        sessionId: newSession
      })
      return newSession;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * kill a player's session for a given project
   * @param projectUuid 
   * @param playerUuid 
   * @exception
   */
  public endPlayerSession(projectUuid: string, playerUuid: string): void {
    try {
      const remove = this.db.prepare(`
        DELETE FROM project_sessions WHERE projectUuid=@projectUuid AND playerUuid=@playerUuid
      `)
      remove.run({
        projectUuid,
        playerUuid
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Kill a specific session by ID, regardless of player
   * @param projectUuid 
   * @param sessionId 
   * @exception
   */
  public endSessionById(projectUuid: string, sessionId: string): void {
    try {
      const remove = this.db.prepare(`
        DELETE FROM project_sessions WHERE projectUuid=@projectUuid AND sessionId=@sessionId
      `)
      remove.run({
        projectUuid,
        sessionId
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Retrieve the UUID of the player currently connected to the given session ID.
   * @param {string} projectUuid 
   * @param {string} sessionId 
   * @returns {string|null} playerUuid or null if the player is not logged in
   * @exception
   */
  public getLoggedInPlayer(projectUuid: string, sessionId: string): string | null {
    try {
      const select = this.db.prepare(`
        SELECT playerUuid from project_sessions WHERE projectUuid=@projectUuid AND sessionId=@sessionId
      `)
      const { playerUuid } = select.get({
        projectUuid,
        sessionId
      });
      return playerUuid || null;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}