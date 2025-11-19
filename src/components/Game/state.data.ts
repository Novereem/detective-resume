import { ANCHOR } from "@/components/Game/anchors"
import type { PuzzleId, SecretFileId, DrawerKey, AnchorKey } from "@/components/Types/game"
import type { TextPuzzle } from "@/components/Types/inspectModels"
import { Vec3 } from "@/components/Types/room"

export const asPuzzleId = <T extends string>(s: T) => s as unknown as PuzzleId
export const asFileId   = <T extends string>(s: T) => s as unknown as SecretFileId

export const PZ = {
    House: asPuzzleId("puzzle-house"),
    PhotoClue: asPuzzleId("puzzle-photo-clue"),
    MugInitials: asPuzzleId("puzzle-mug-initials"),

    HboIct: asPuzzleId("puzzle-hbo-ict"),
    Semester: asPuzzleId("puzzle-semester"),
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
        { id: FileId.Ransom, pos: [-0.6, 0.7, 2.4], rot: [0, Math.PI/4, 0], message: "Case File: Ransom Note", persistAfterOpen: false },
        { id: FileId.Badge,  pos: [ 0.4, 0.7, 2.1], rot: [0, -Math.PI/8, 0], message: "Case File: Missing Badge", persistAfterOpen: true },
        { id: FileId.PhotoClue, pos: ANCHOR.deskTopSpawn2.position, rot: ANCHOR.deskTopSpawn2.rotation,
            message: "Photo Clue — new puzzle available.", persistAfterOpen: false, unlocksPuzzleId: PZ.PhotoClue },
    ],
    drawer_files: [
        { id: FileId.InDrawer, drawerKey: "leftTop", message: "Drawer File — new puzzle available.",
            persistAfterOpen: false, unlocksPuzzleId: PZ.House, poofOnOpen: true },
    ],
    poofs: [],
    drawers: { leftTop: { fileAlive: true } },

    puzzlesConfig: {
        [PZ.House]: {
            id: PZ.House,
            solvedFromInspectId: "frame-code-desk",
            deskAnchorKey: "deskTopSpawn",
            wallAnchorKey: "houseFrame",
            view: {
                kind: "framed",
                width: 0.17, height: 0.20, border: 0.01,
                textureUrl: "/textures/house_szn1.jpg",
                textureFit: "stretch",
                rotateY180WhenPinned: true,
                pixelSize: 1,
                inspectDistance: 0.45,
                inspect: {
                    type: "text",
                    id: "frame-code-desk",
                    prompt: "What is the name of this popular medical drama from the 2000s?",
                    answers: ["house", /house\s*md/i],
                    normalize: "trim-lower",
                    feedback: { correct: "Nice find!", incorrect: "Not quite—look closer." },
                }
            }
        },
        [PZ.PhotoClue]: {
            id: PZ.PhotoClue,
            solvedFromInspectId: "photo-red-circle",
            deskAnchorKey: "deskTopSpawn",
            wallAnchorKey: "photoClueFrame",
            connectsTo: [PZ.HboIct],
            view: {
                kind: "framed",
                width: 0.20, height: 0.20, border: 0.012,
                textureUrl: "/textures/testimage.jpg",
                textureFit: "stretch",
                rotateY180WhenPinned: true,
                pixelSize: 2.5,
                inspectDistance: 0.45,
                inspect: {
                    type: "text",
                    id: "photo-red-circle",
                    prompt: "Who is the person circled in red?",
                    answers: ["john doe", /john\s+doe/i],
                    normalize: "trim-lower",
                    feedback: { correct: "Good eye.", incorrect: "Look again at the red circle." },
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
                    prompt: "What is my current education?",
                    answers: [
                        "hbo ict",
                        "hbo-ict",
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

        [PZ.MugInitials]: {
            id: PZ.MugInitials,
            solvedFromInspectId: "mug-initials",
            deskAnchorKey: "mug",
            wallAnchorKey: "mugFrame",
            view: {
                kind: "framed",
                width: 0.2,
                height: 0.2,
                border: 0.012,
                textureUrl: "/textures/testimage.jpg",
                textureFit: "stretch",
                rotateY180WhenPinned: true,
                pixelSize: 3,
                inspectDistance: 0.2,
                inspect: {
                    type: "text",
                    id: "mug-initials",
                    prompt: "What is this weird object supposed to be",
                    answers: ["a mug", "mug", "what?"],
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
        [PZ.House]:     { available: false, pinned: false },
        [PZ.PhotoClue]: { available: false, pinned: false },
        [PZ.HboIct]: { available: true, pinned: false },
        [PZ.Semester]: { available: true, pinned: false },
        [PZ.MugInitials]: { available: true, pinned: false },
    },

    cardboardBoxes: {},
}