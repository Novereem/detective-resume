import { ANCHOR } from "./anchors"
import type { Vec3, SecretFileSpawn } from "@/components/Types/room"
import * as React from "react"

type Listener = () => void

export type DrawerKey = string;
export type PuzzleKey = string;

type DrawerState = { fileAlive?: boolean }

type GameSnapshot = {
    files: SecretFileSpawn[]
    drawers: Record<DrawerKey, DrawerState>
    puzzles: Record<PuzzleKey, boolean>
    poofs: { id: string; pos: Vec3 }[]
}

class GameState {
    private snapshot: GameSnapshot = {
        files: [
            { id: "sf-ransom", pos: [-0.6, 0.7, 2.4], rot: [0, Math.PI/4, 0], message: "Case File: Ransom Note", persistAfterOpen: false },
            { id: "sf-badge",  pos: [ 0.4, 0.7, 2.1], rot: [0,-Math.PI/8, 0], message: "Case File: Missing Badge", persistAfterOpen: true  },
        ],
        drawers: {
            leftTop: { fileAlive: true },
        },
        puzzles: {
            "puzzle-house": false,
        },
        poofs: [],
    }

    private listeners = new Set<Listener>()

    subscribe(fn: Listener) {
        this.listeners.add(fn)
        return () => { this.listeners.delete(fn) }
    }

    get(): Readonly<GameSnapshot> { return this.snapshot }

    private emit() { this.listeners.forEach(fn => fn()) }

    spawnPoof(pos: Vec3 | null | undefined) {
        if (!pos) return
        const id = `poof-${Math.random().toString(36).slice(2)}`
        this.snapshot = { ...this.snapshot, poofs: [...this.snapshot.poofs, { id, pos }] }
        this.emit()
    }
    removePoof(id: string) {
        this.snapshot = { ...this.snapshot, poofs: this.snapshot.poofs.filter(p => p.id !== id) }
        this.emit()
    }

    removeFile(id: string) {
        this.snapshot = { ...this.snapshot, files: this.snapshot.files.filter(f => f.id !== id) }
        this.emit()
    }

    setDrawer(key: DrawerKey, next: DrawerState) {
        this.snapshot = {
            ...this.snapshot,
            drawers: { ...this.snapshot.drawers, [key]: { ...this.snapshot.drawers[key], ...next } }
        }
        this.emit()
    }

    setPuzzle(id: PuzzleKey, alive: boolean) {
        this.snapshot = { ...this.snapshot, puzzles: { ...this.snapshot.puzzles, [id]: alive } }
        this.emit()
    }

    handleSecretOpen(meta: { id: string; worldPos?: Vec3 | null }) {
        const { id, worldPos } = meta

        if (id === "sf-in-drawer") {
            this.setDrawer("leftTop", { fileAlive: false })
            this.setPuzzle("puzzle-house", true)

            this.spawnPoof(ANCHOR.deskTopSpawn.position)

            this.spawnPoof(worldPos ?? ANCHOR.drawerLeftTopContent.position)
            return
        }

        if (id === "sf-ransom") {
            this.removeFile(id)
            if (worldPos) this.spawnPoof(worldPos)
            return
        }

        if (id === "sf-badge") {
            if (worldPos) this.spawnPoof(worldPos)
            return
        }
    }
}

export const game = new GameState()

export function useGameState(): Readonly<GameSnapshot> {
    const [, force] = React.useReducer(n => n + 1, 0)
    React.useEffect(() => game.subscribe(force), [])
    return game.get()
}

export function useGameActions() {
    return {
        spawnPoof: (pos: Vec3 | null | undefined) => game.spawnPoof(pos),
        removePoof: (id: string) => game.removePoof(id),
        removeFile: (id: string) => game.removeFile(id),
        setDrawer: (key: DrawerKey, next: DrawerState) => game.setDrawer(key, next),
        setPuzzle: (id: PuzzleKey, v: boolean) => game.setPuzzle(id, v),
        handleSecretOpen: (meta: { id: string; worldPos?: Vec3 | null }) => game.handleSecretOpen(meta),
    }
}