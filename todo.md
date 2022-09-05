[x] Load settings from server
[x] Create settings with project
[ ] Clean up auto-save, it's a little janky
[x] Use react-router for sub-routes on project
[x] Add projectUuid to all child objects? It could be needed for QR code validation
[x] Extract save/load hooks, they're largely the same
  - Allow to configure which actions you need
[x] Apply settings and generate players up front to eliminate need for patching
[ ] Fix all get endpoints to allow retrieving deleted
[ ] Add delete/restore action to the UI
  - Remove wordId from DB when item is deleted so it can be re-used
[x] Add searches to lists
  - [x] Add it to projects
[x] Add modal to create new project players
[x] Add editing project meta (name/descrip)
[x] Create game client :)
[ ] Apply auth concept to admin client useServerResource
[ ] Expire session manually since cookies don't work
[x] Abstract portal route parsing, since we want to use an embedded camera modal
  - [x] Also make the embedded camera modal
[x] Create game events table
[ ] Player profile
  - Display Name
  - Real Name
  - Picture
  - event on change
[x] Activity Claim
[x] Combine activity and duelActivity. Just add a stupid property for isDuel
[ ] Clean up session stuff. SessionID is golden and gives player + project + session.
  - Add an expiration
[ ] ? Prompt to claim activity, similar to player
[ ] ? Add complex markdown-based activity descriptions
[ ] Block duplicate duels with the same person
  - Need to use the concept of an "active" duel, being anything Accepted through terminal

### Notes
- If settings are changed when a game is running, need to cancel/handle related activities (such as duel allow)

Game Events
- projectUuid
- uuid
- type TEXT
  - Activity
  - Duel
    - Started
    - Cancelled
    - Complete
  - Profile Change
- payload JSON
- timestamp