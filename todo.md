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
[ ] Add searches to lists
[ ] Add editing project meta (name/descrip)
[ ] Create game client :)

### Notes
- If settings are changed when a game is running, need to cancel/handle related activities (such as duel allow)