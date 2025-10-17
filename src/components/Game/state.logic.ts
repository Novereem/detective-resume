import { ANCHOR } from "@/components/Game/anchors"
import type { PuzzleId, SecretFileId } from "@/components/Types/game"
import type { GameSnapshot } from "./state.data"
import { initialSnapshot } from "./state.data"
import {Vec3} from "@/components/Types/room";

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
    get solveIdToPuzzle(): Record<string, PuzzleId> {
        const map: Record<string, PuzzleId> = {}
        for (const cfg of Object.values(this._snapshot.puzzlesConfig)) map[cfg.solvedFromInspectId] = cfg.id
        return map
    }

    // -------- actions --------
    private poofSeq = 0

    private newId = (prefix: string) => {
        // Prefer crypto UUID when available, else fall back to time + counter
        const rand = (globalThis.crypto && "randomUUID" in globalThis.crypto)
            ? (globalThis.crypto as any).randomUUID()
            : `${Date.now()}-${this.poofSeq++}`
        return `${prefix}-${rand}`
    }

    spawnPoof = (pos: Vec3) => {
        const id = this.newId("poof")
        this._snapshot = { ...this._snapshot, poofs: [...this._snapshot.poofs, { id, pos }] }
        this.emit()
    }

    removePoof = (id: string) => {
        this._snapshot = { ...this._snapshot, poofs: this._snapshot.poofs.filter(p => p.id !== id) }
        this.emit()
    }

    removeFile = (id: SecretFileId) => {
        this._snapshot = { ...this._snapshot, files: this._snapshot.files.filter(f => f.id !== id) }
        this.emit()
    }

    setDrawer = (key: keyof GameSnapshot["drawers"], patch: Partial<GameSnapshot["drawers"][typeof key]>) => {
        this._snapshot = {
            ...this._snapshot,
            drawers: { ...this._snapshot.drawers, [key]: { ...this._snapshot.drawers[key], ...patch } }
        }
        this.emit()
    }

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

    pinPuzzle = (id: PuzzleId, on: boolean) => {
        this._snapshot = {
            ...this._snapshot,
            puzzleStatus: { ...this._snapshot.puzzleStatus, [id]: { ...this._snapshot.puzzleStatus[id], pinned: on } }
        }
        this.emit()
    }

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
}