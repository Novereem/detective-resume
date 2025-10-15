import { ANCHOR } from '@/components/Game/anchors'

export type AnchorKey = keyof typeof ANCHOR

export type PuzzleDef = {
    puzzleId: string
    solvedFromInspectId: string
    deskAnchorKey: AnchorKey
    wallAnchorKey: AnchorKey
}

export const PUZZLES: Record<string, PuzzleDef> = {
    'puzzle-house': {
        puzzleId: 'puzzle-house',
        solvedFromInspectId: 'frame-code-desk',
        deskAnchorKey: 'deskTopSpawn',
        wallAnchorKey: 'houseFrame',
    },

    "puzzle-photo-clue": {
        puzzleId: "puzzle-photo-clue",
        solvedFromInspectId: "photo-red-circle",
        deskAnchorKey: "deskTopSpawn",
        wallAnchorKey: "photoClueFrame",
    },
}