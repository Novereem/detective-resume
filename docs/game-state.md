# Game State (puzzles, files, poofs)

Core files:

- `src/components/Game/state.data.ts` – static configuration and `initialSnapshot`.
- `src/components/Game/state.logic.ts` – `GameState` class with selectors and actions.
- `src/components/Game/state.ts` – singleton `gameState` and React hooks.
- `src/components/Game/usePuzzleInspect.ts` – helper to merge puzzle data into inspect overlays.

This doc is for developers who want to change puzzle logic, add new puzzles, or hook
into the game state from UI / gameplay components.

---

## GameSnapshot & configuration

**File:** `state.data.ts`

`GameSnapshot` is the canonical state shape for the detective room:

- `files: PositionedSecretFile[]` – world-space secret files on the desk / room.
- `drawer_files: DrawerFileSpawn[]` – files that exist inside drawers.
- `poofs: { id: string; pos: Vec3 }[]` – transient visual effects.
- `drawers: Partial<Record<DrawerKey, { fileAlive?: boolean }>>` – drawer state.
- `puzzlesConfig: Record<PuzzleId, PuzzleConfig>` – static puzzle definitions.
- `puzzleStatus: Record<PuzzleId, PuzzleStatus>` – runtime puzzle state.
- `cardboardBoxes: CardboardBoxesState` – opening/opened status per box.

`initialSnapshot` wires this all together using the room `ANCHOR` data:

- Places starting files (`Ransom`, `Badge`, `PhotoClue`) in the room.
- Configures the text puzzles (prompts, answers, feedback, multiple answers, etc.).
- Connects puzzles via `connectsTo` so solving one can unlock the next.
- Sets which puzzles are available at the start and which are locked.

---

## GameState

**File:** `state.logic.ts`

`GameState` wraps `GameSnapshot` in an observable class:

- Holds a private `_snapshot` that is always replaced with new objects on updates.
- Exposes `snapshot` as a read-only view for React components.
- Provides a simple subscription API:
    - `subscribe(fn)` – register a listener.
    - Returns an unsubscribe function.
- Calls `emit()` after every state change so hooks can re-render.

### Selectors

- `solveIdToPuzzle: Record<string, PuzzleId>`  
  Build a lookup from `solvedFromInspectId` (inspect model id) to `PuzzleId`.
  Used when the text-puzzle system reports “id X was solved” and the game needs
  to find which puzzle that corresponds to.

- `getPuzzleOverlay(puzzleId)`  
  Returns the `TextPuzzle` configuration and a `PuzzleOverlayMeta` object:
    - `metadata.type = 'puzzle'`
    - `metadata.puzzleId`
    - `metadata.solved` / `metadata.solvedAnswer` derived from `puzzleStatus`.

### Poofs & files

- `spawnPoof(pos)`  
  Append a new `{ id, pos }` to `snapshot.poofs` and emit. The id is generated
  via `newId("poof")` using `crypto.randomUUID` when available.

- `removePoof(id)`  
  Remove a poof entry by id.

- `removeFile(id)`  
  Remove a world-space file from `snapshot.files`. Drawer files are handled in
  `handleSecretOpen`.

### Drawers & puzzles

- `setDrawer(key, patch)`  
  Shallow-merge a patch into a drawer entry (e.g. `{ fileAlive: false }`).

- `setPuzzleAvailable(id, on)`  
  Toggle puzzle availability. When flipping from `false` → `true`, a poof is
  spawned at the desk anchor position for that puzzle (from `ANCHOR[cfg.deskAnchorKey]`).

- `pinPuzzle(id, pinned, solvedAnswer?)`  
  Pin/unpin a puzzle on the wall. Pinning marks the puzzle as solved and updates
  `solvedAnswer` if provided; unpinning keeps the solved state.

### Secret file open flow

- `handleSecretOpen({ id, worldPos })`

  Orchestrates what happens when a secret file is opened:

    - Finds the file in `files` and/or `drawer_files`.
    - If it has `unlocksPuzzleId`, calls `setPuzzleAvailable` for that puzzle
      (which may spawn a poof at the desk anchor).
    - Based on `poofOnOpen` and `persistAfterOpen`, decides whether to spawn a poof
      at `worldPos` or the file’s original position.
    - Removes non-persistent files from `files` / `drawer_files`.
    - Marks drawer entries as `fileAlive=false` via `setDrawer`.

This is the central place to extend when adding new behaviors that should happen
when a secret is opened (e.g. logging, achievements, analytics).

### Cardboard boxes

- `requestOpenCardboardBox(id)`  
  Transition a box from `closed` → `opening` and increment `openNonce`.

- `finishOpenCardboardBox(id)`  
  Transition a known box from `opening` → `opened`. No-op if the box is unknown.

---

## React integration

**File:** `state.ts`

- `gameState = new GameState()` – shared singleton instance.
- `useGameState()` – subscribes to `gameState`, forces a re-render on updates and
  returns `gameState.snapshot`.
- `useGameActions()` – returns the `gameState` instance so components can call
  mutation methods.

**File:** `usePuzzleInspect.ts`

- `usePuzzleInspect(puzzleId, openInspect)` – wraps an `openInspect` callback
  and automatically merges puzzle-specific config:
    - overrides `pixelSize` / `inspectDistance` when the puzzle defines them,
    - injects the puzzle’s `inspect` model,
    - adds puzzle metadata (`type: 'puzzle'`, `puzzleId`, `solved`, `solvedAnswer`).
---

