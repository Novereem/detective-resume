import { ANCHOR } from "@/components/Game/anchors"
import type { PuzzleId, SecretFileId } from "@/components/Types/game"
import type { GameSnapshot } from "./state.data"
import { initialSnapshot } from "./state.data"
import {Vec3} from "@/components/Types/room";
import {PuzzleOverlayMeta, TextPuzzle} from "@/components/Types/inspectModels";

/**
 * Central game-state container for the detective-room puzzles.
 *
 * Responsibilities:
 * - Hold the canonical `GameSnapshot` with files, drawers, puzzles and boxes.
 * - Expose cheap selectors for UI and inspect overlays.
 * - Provide mutation methods that always:
 *   - create a new snapshot object (no in-place mutation of `GameSnapshot`),
 *   - trigger all subscribers after each change,
 *   - coordinate side-effects such as spawning poofs and unlocking puzzles.
 *
 * Used by:
 * - `gameState` singleton in `state.ts` and the hooks `useGameState` / `useGameActions`.
 * - Gameplay components that respond to secret-file opens, drawer changes, puzzle pins, etc.
 */
export class GameState {
    private _snapshot: GameSnapshot = initialSnapshot
    private listeners = new Set<() => void>()

    get snapshot(): Readonly<GameSnapshot> { return this._snapshot }
    subscribe(fn: () => void) {
        this.listeners.add(fn)
        return () => { this.listeners.delete(fn) }
    }
    private emit() { this.listeners.forEach(fn => fn()) }

    // -------- selectors --------

    /**
     * Build a lookup map from `solvedFromInspectId` → `PuzzleId`.
     *
     * Used by the inspect system to resolve which puzzle was solved from
     * the id of the inspect model (for example a text input result).
     *
     * Computed on demand from `puzzlesConfig` so the stored snapshot stays small.
     */
    get solveIdToPuzzle(): Record<string, PuzzleId> {
        const map: Record<string, PuzzleId> = {}
        for (const cfg of Object.values(this._snapshot.puzzlesConfig)) map[cfg.solvedFromInspectId] = cfg.id
        return map
    }

    /**
     * Return the inspect puzzle configuration plus derived metadata
     * for a given `PuzzleId`, or `null` if the puzzle does not exist.
     *
     * This is the main entry point used by the puzzle overlay UI to
     * render the text puzzle and show solved-state feedback.
     */
    getPuzzleOverlay(puzzleId: PuzzleId): {
        puzzle: TextPuzzle & { id: string }
        metadata: PuzzleOverlayMeta
    } | null {
        const cfg = this._snapshot.puzzlesConfig[puzzleId]
        if (!cfg) return null

        const status = this._snapshot.puzzleStatus[puzzleId]

        return {
            puzzle: cfg.view.inspect,
            metadata: {
                type: 'puzzle',
                puzzleId: cfg.id,
                solved: !!status?.solved,
                solvedAnswer: status?.solvedAnswer,
            },
        }
    }

    // -------- actions --------
    private poofSeq = 0

    /**
     * Generate a unique id for transient entities such as poofs.
     *
     * Prefers `crypto.randomUUID` when available, and falls back to
     * a time-based id that is still deterministic within a single run.
     */
    private newId = (prefix: string) => {
        // Prefer crypto UUID when available, else fall back to time + counter
        const rand = (globalThis.crypto && "randomUUID" in globalThis.crypto)
            ? (globalThis.crypto as any).randomUUID()
            : `${Date.now()}-${this.poofSeq++}`
        return `${prefix}-${rand}`
    }

    /**
     * Spawn a new poof visual effect at the given world position.
     *
     * - Appends a new `{ id, pos }` entry to `snapshot.poofs`.
     * - Emits to all subscribers after the snapshot update.
     */
    spawnPoof = (pos: Vec3) => {
        const id = this.newId("poof")
        this._snapshot = { ...this._snapshot, poofs: [...this._snapshot.poofs, { id, pos }] }
        this.emit()
    }

    /**
     * Remove a poof by id and emit a snapshot update.
     */
    removePoof = (id: string) => {
        this._snapshot = { ...this._snapshot, poofs: this._snapshot.poofs.filter(p => p.id !== id) }
        this.emit()
    }

    /**
     * Remove a world-space secret file by id and emit a snapshot update.
     *
     * Drawer files are handled separately via `handleSecretOpen`.
     */
    removeFile = (id: SecretFileId) => {
        this._snapshot = { ...this._snapshot, files: this._snapshot.files.filter(f => f.id !== id) }
        this.emit()
    }

    /**
     * Shallow-merge a patch into a single drawer entry.
     *
     * Used by gameplay code when a drawer file is taken or when drawer
     * state is updated from other interactions.
     */
    setDrawer = (key: keyof GameSnapshot["drawers"], patch: Partial<GameSnapshot["drawers"][typeof key]>) => {
        this._snapshot = {
            ...this._snapshot,
            drawers: { ...this._snapshot.drawers, [key]: { ...this._snapshot.drawers[key], ...patch } }
        }
        this.emit()
    }

    /**
     * Set a puzzle as available/unavailable.
     *
     * When flipping from `available=false` → `true`, this also:
     * - spawns a poof at the desk anchor for that puzzle (if present),
     *   so the player gets a visual cue that something appeared.
     */
    setPuzzleAvailable = (id: PuzzleId, on: boolean) => {
        const prev = this._snapshot.puzzleStatus[id]?.available
        this._snapshot = {
            ...this._snapshot,
            puzzleStatus: { ...this._snapshot.puzzleStatus, [id]: { ...this._snapshot.puzzleStatus[id], available: on } }
        }
        if (!prev && on) {
            const cfg = this._snapshot.puzzlesConfig[id]
            const anchor = ANCHOR[cfg.deskAnchorKey]
            if (anchor?.position) this.spawnPoof(anchor.position as Vec3)
        }
        this.emit()
    }

    /**
     * Pin or unpin a puzzle on the puzzle wall.
     *
     * - When `pinned=true`, the puzzle is also marked as solved and the
     *   `solvedAnswer` is updated (if provided).
     * - When `pinned=false`, solved state is preserved so the game
     *   remembers completed puzzles even after unpinning.
     */
    pinPuzzle = (id: PuzzleId, pinned: boolean, solvedAnswer?: string) => {
        const prev = this._snapshot.puzzleStatus[id] ?? { available: false, pinned: false }
        this._snapshot = {
            ...this._snapshot,
            puzzleStatus: {
                ...this._snapshot.puzzleStatus,
                [id]: {
                    ...prev,
                    pinned,
                    solved: pinned ? true : prev.solved,
                    solvedAnswer: pinned ? (solvedAnswer ?? prev.solvedAnswer) : prev.solvedAnswer,
                },
            },
        }
        this.emit()
    }

    /**
     * Handle opening a secret file, either world-space or from a drawer.
     *
     * Side effects:
     * - Unlock a puzzle when the file declares `unlocksPuzzleId`.
     * - Spawn a poof at `worldPos` or file position when allowed by
     *   `persistAfterOpen` / `poofOnOpen`.
     * - Remove non-persistent files from `files` / `drawer_files`.
     * - Mark drawer entries as `fileAlive=false` when a drawer file is taken.
     */
    handleSecretOpen = ({ id, worldPos }: { id: SecretFileId; worldPos?: Vec3 | null }) => {
        const file  = this._snapshot.files.find(f => f.id === id)
        const dfile = this._snapshot.drawer_files.find(f => f.id === id)
        const unlockId = (file?.unlocksPuzzleId ?? dfile?.unlocksPuzzleId) as PuzzleId | undefined
        if (unlockId) this.setPuzzleAvailable(unlockId, true)

        const shouldPoof = (file ? file.poofOnOpen !== false : true) && (dfile ? dfile.poofOnOpen !== false : true)
        if (shouldPoof) {
            const p = worldPos ?? file?.pos ?? null
            if (p) this.spawnPoof(p)
        }

        if (file && file.persistAfterOpen !== true) this.removeFile(id)
        if (dfile && dfile.persistAfterOpen !== true) {
            this._snapshot = { ...this._snapshot, drawer_files: this._snapshot.drawer_files.filter(x => x.id !== id) }
            this.emit()
            this.setDrawer(dfile.drawerKey, { fileAlive: false })
        }
    }

    /**
     * Request that a cardboard box transitions from `closed` → `opening`.
     *
     * - Lazily creates an entry if the box was unseen.
     * - Increments `openNonce` to give animations a stable change token.
     */
    requestOpenCardboardBox = (id: string) => {
        const prev = this._snapshot.cardboardBoxes[id] ?? { status: 'closed', openNonce: 0 }
        this._snapshot = {
            ...this._snapshot,
            cardboardBoxes: {
                ...this._snapshot.cardboardBoxes,
                [id]: { ...prev, status: 'opening', openNonce: prev.openNonce + 1 },
            },
        }
        this.emit()
    }

    /**
     * Mark a previously opening cardboard box as fully opened.
     *
     * No-op if the box is unknown, so callers can safely call this from
     * animation complete callbacks.
     */
    finishOpenCardboardBox = (id: string) => {
        const prev = this._snapshot.cardboardBoxes[id]
        if (!prev) return
        this._snapshot = {
            ...this._snapshot,
            cardboardBoxes: {
                ...this._snapshot.cardboardBoxes,
                [id]: { ...prev, status: 'opened' },
            },
        }
        this.emit()
    }
}