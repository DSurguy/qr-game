[x] Load settings from server
[x] Create settings with project
[ ] Clean up auto-save, it's a little janky
[x] Use react-router for sub-routes on project
[x] Add projectUuid to all child objects? It could be needed for QR code validation
[ ] Extract save/load hooks, they're largely the same
  - Allow to configure which actions you need
[ ] Apply settings and generate players up front to eliminate need for patching

### Notes
- If settings are changed when a game is running, need to cancel/handle related activities (such as duel allow)