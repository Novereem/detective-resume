import { ANCHOR } from "@/components/Game/anchors"
import type { PuzzleId, SecretFileId, DrawerKey, AnchorKey } from "@/components/Types/game"
import type { TextPuzzle } from "@/components/Types/inspectModels"
import { Vec3 } from "@/components/Types/room"

/**
 * Core ids + snapshot for the detective-room puzzle system.
 *
 * High-level flow for adding a new puzzle:
 * 1. Add a new entry to `PZ` with a stable string id
 *    (for example: "puzzle-my-new-thing").
 * 2. (Optional) Add a `FileId` and a new entry in `files` / `drawer_files`
 *    with `unlocksPuzzleId` pointing to your `PZ` entry if a secret file
 *    should unlock the puzzle.
 * 3. Add a matching entry to `initialSnapshot.puzzlesConfig`:
 *    - id: the PZ entry you just added
 *    - solvedFromInspectId: the inspect model id that will report solves
 *    - deskAnchorKey / wallAnchorKey: where the puzzle shows up in the room
 *    - view: framed view config + the TextPuzzle (or other inspect model).
 * 4. Add a matching entry to `initialSnapshot.puzzleStatus` to define its
 *    starting availability / pinned state.
 *
 * The invariants in `state.data.test.ts` enforce that these pieces stay in
 * sync, so extending the puzzle system is safe for future developers.
 */
export const asPuzzleId = <T extends string>(s: T) => s as unknown as PuzzleId
export const asFileId   = <T extends string>(s: T) => s as unknown as SecretFileId

export const PZ = {
    PhotoClue: asPuzzleId("puzzle-photo-clue"),

    HboIct: asPuzzleId("puzzle-hbo-ict"),
    Semester: asPuzzleId("puzzle-semester"),
    GroupProjects: asPuzzleId("puzzle-group-projects"),
    MugInitials: asPuzzleId("puzzle-mug-initials"),
} as const

export const FileId = {
    Ransom: asFileId("sf-ransom"),
    Badge: asFileId("sf-badge"),
    PhotoClue: asFileId("sf-photo-clue"),
    InDrawer: asFileId("sf-in-drawer"),
} as const

export type PositionedSecretFile = {
    id: SecretFileId
    pos: Vec3
    rot?: Vec3
    message?: string
    persistAfterOpen?: boolean
    unlocksPuzzleId?: PuzzleId
    poofOnOpen?: boolean
}
export type DrawerFileSpawn = {
    id: SecretFileId
    drawerKey: DrawerKey
    message?: string
    persistAfterOpen?: boolean
    unlocksPuzzleId?: PuzzleId
    poofOnOpen?: boolean
}

export type FramedViewConfig = {
    kind: "framed"
    width: number
    height: number
    border?: number
    textureUrl: string
    textureFit?: "stretch" | "contain"
    rotateY180WhenPinned?: boolean
    pixelSize?: number
    inspectDistance?: number
    inspect: TextPuzzle & { id: string }
}

export type PuzzleConfig = {
    id: PuzzleId
    solvedFromInspectId: string
    deskAnchorKey: AnchorKey
    wallAnchorKey: AnchorKey
    view: FramedViewConfig
    connectsTo?: PuzzleId[]
    deskFramed?: boolean
}

export type PuzzleStatus = {
    available: boolean
    pinned: boolean
    solved?: boolean
    solvedAnswer?: string
}

export type GameSnapshot = {
    files: PositionedSecretFile[]
    drawer_files: DrawerFileSpawn[]
    poofs: { id: string; pos: Vec3 }[]
    drawers: Partial<Record<DrawerKey, { fileAlive?: boolean }>>
    puzzlesConfig: Record<PuzzleId, PuzzleConfig>
    puzzleStatus: Record<PuzzleId, PuzzleStatus>
    cardboardBoxes: CardboardBoxesState
}

export type CardboardBoxEntry = {
    status: 'closed' | 'opening' | 'opened'
    openNonce: number
}

export type CardboardBoxesState = Record<string, CardboardBoxEntry>

export const initialSnapshot: GameSnapshot = {
    files: [
        { id: FileId.Ransom, pos: [-0.6, -0.7, 2.4], rot: [0, Math.PI/4, 0], message: "Case File: Ransom Note", persistAfterOpen: false },
        { id: FileId.Badge,  pos: [ 0.76, -0.7, 2.1], rot: [0, -Math.PI/8, 0], message: "Case File: Missing Badge", persistAfterOpen: true },
        { id: FileId.PhotoClue, pos: ANCHOR.mugshotSecretFile.position, rot: ANCHOR.mugshotSecretFile.rotation,
            message: "Photo Clue — new puzzle available.", persistAfterOpen: false, unlocksPuzzleId: PZ.PhotoClue },
    ],
    drawer_files: [
        {
            id: FileId.InDrawer,
            drawerKey: "leftTop",
            message: "Case File: Group Projects | new puzzle available.",
            persistAfterOpen: false,
            unlocksPuzzleId: PZ.GroupProjects,
            poofOnOpen: true,
        },
    ],
    poofs: [],
    drawers: { leftTop: { fileAlive: true } },

    puzzlesConfig: {
        [PZ.PhotoClue]: {
            id: PZ.PhotoClue,
            solvedFromInspectId: "photo-red-circle",
            deskAnchorKey: "mugshotSpawn",
            wallAnchorKey: "photoClueFrame",
            connectsTo: [PZ.HboIct],
            view: {
                kind: "framed",
                width: 0.20, height: 0.30, border: 0.010,
                textureUrl: "/textures/puzzle_profilephoto.jpg",
                textureFit: "stretch",
                rotateY180WhenPinned: true,
                pixelSize: 0.5,
                inspectDistance: 0.45,
                inspect: {
                    type: "text",
                    id: "photo-red-circle",
                    prompt: "What's the full name of this person?",
                    answers: ["Noah Overeem", /noah\s+overeem/i],
                    normalize: "trim-lower",
                    feedback: { correct: "That's it!", incorrect: "It should be here somewhere..." },
                }
            }
        },

        [PZ.HboIct]: {
            id: PZ.HboIct,
            solvedFromInspectId: "puzzle-hbo-ict",
            deskAnchorKey: "hboIct",
            wallAnchorKey: "hboIctFrame",
            connectsTo: [PZ.Semester],
            view: {
                kind: "framed",
                width: 0.40,
                height: 0.20,
                border: 0.007,
                textureUrl: "/textures/puzzle_hboictpropedeuse.jpg",
                textureFit: "stretch",
                rotateY180WhenPinned: true,
                pixelSize: 0,
                inspectDistance: 0.43,
                inspect: {
                    type: "text",
                    id: "puzzle-hbo-ict",
                    prompt: "What is my current major?",
                    answers: [
                        "hbo ict",
                        "hbo-ict",
                        "ict",
                        /hbo\s*-?\s*ict/i,
                    ],
                    normalize: "trim-lower",
                    feedback: {
                        correct: "Exactly. HBO-ICT.",
                        incorrect: "Check the diploma again.",
                    },
                },
            },
        },


        [PZ.Semester]: {
            id: PZ.Semester,
            solvedFromInspectId: "puzzle-semester-7",
            deskAnchorKey: "semester7",
            wallAnchorKey: "semester7Frame",
            view: {
                kind: "framed",
                width: 0.20,
                height: 0.07,
                border: 0.008,
                textureUrl: "/textures/puzzle_semesterplanning.jpg",
                textureFit: "stretch",
                rotateY180WhenPinned: true,
                pixelSize: 0.5,
                inspectDistance: 0.25,
                inspect: {
                    type: "text",
                    id: "puzzle-semester-7",
                    prompt: "Which semester am I in right now?",
                    answers: ["7", "seven"],
                    normalize: "trim-lower",
                    feedback: {
                        correct: "Yep, semester 7.",
                        incorrect: "Check the study plan again.",
                    },
                },
            },
        },

        [PZ.GroupProjects]: {
            id: PZ.GroupProjects,
            solvedFromInspectId: "puzzle-group-projects",
            deskAnchorKey: "deskTopSpawn",
            wallAnchorKey: "groupProjectsFrame",
            view: {
                kind: "framed",
                width: 0.40,
                height: 0.15,
                border: 0.01,
                textureUrl: "/textures/puzzle_blurredcompanies.jpg",
                textureFit: "stretch",
                rotateY180WhenPinned: true,
                pixelSize: 1,
                inspectDistance: 0.45,
                inspect: {
                    type: "text",
                    id: "puzzle-group-projects",
                    prompt: "Name the two major group projects I worked on recently.",
                    answers: [
                        "sanquin",
                        "eclipse",
                    ],
                    multipleAnswers: 2,
                    normalize: "trim-lower",
                    roomEvidenceHint: true,
                    feedback: {
                        correct: "Right. Sanquin and Eclipse.",
                        incorrect: "Check the project evidence again.",
                    },
                },
            },
        },

        [PZ.MugInitials]: {
            id: PZ.MugInitials,
            solvedFromInspectId: "mug-initials",
            deskAnchorKey: "mug",
            wallAnchorKey: "mugFrame",
            view: {
                kind: "framed",
                width: 0.15,
                height: 0.15,
                border: 0.012,
                textureUrl: "/textures/puzzle_mugcomplete.jpg",
                textureFit: "stretch",
                rotateY180WhenPinned: true,
                pixelSize: 3,
                inspectDistance: 0.2,
                inspect: {
                    type: "text",
                    id: "mug-initials",
                    prompt: "W-_t _r_ --e in_t_als o- t-_s -ug",
                    answers: [
                        "N",
                        "V",
                    ],
                    multipleAnswers: 2,
                    normalize: "trim-lower",
                    feedback: {
                        correct: "Correct!",
                        incorrect: "This is a tricky one!",
                    },
                },
            },
            deskFramed: false,
        },
    },

    puzzleStatus: {
        [PZ.PhotoClue]:     { available: false, pinned: false },

        [PZ.HboIct]:        { available: true, pinned: false },
        [PZ.Semester]:      { available: true, pinned: false },
        [PZ.GroupProjects]: { available: false, pinned: false },
        [PZ.MugInitials]:   { available: true, pinned: false },
    },

    cardboardBoxes: {},
}