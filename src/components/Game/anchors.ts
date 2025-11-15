import type { Vec3 } from "@/components/Types/room"

export type AnchorKey =
    | "bulb" | "desk1" | "desk2" | "deskMetal"
    | "corkBoard" | "mug" | "coatRack" | "hat" | "magnifier1" | "detectiveCoat"
    | "houseFrame" | "mugFrame"
    | "deskTopSpawn" | "drawerLeftTopContent"
    | "photoClueFrame"| "photoBlueFrame"| "deskTopSpawn2" | "testPuzzle3"
    | "bookA" | "bookB"
    | "binder1" | "binder2"
    | "binder3" | "binder4" | "binder5" | "binder6" | "binder7" | "binder8" | "binder9"
    | "binder20"
    | "clock"
    | "plant"
    | "cardboard1" | "cardbox01" | "cardboardLid1"
    | "trashBin"
    | "cigar1" | "ashTray1"
    | "calendar2025"
    | "mapFrame"
    | "mapFramePin"
    | "newspaper1"
    | "newspaper2"
    | "newspaper3"
    | "writtenLetter1"
    | "writtenLetter2"
    | "blinds1"
    | "blinds2"
    | "window1"
    | "window2"
    | "outsideLight1"
    | "bookshelf1"
    | "bookshelf2"

export const ANCHOR: Record<AnchorKey, { eye: Vec3; position: Vec3; rotation?: Vec3 }> = {
    bulb:       { eye: [ 0.6, 1.6, 3.3], position: [0, 2, 4.3] },
    desk1:      { eye: [ 0.8, 1.1, 2.8], position: [1.6, 0, 4.3] },
    desk2:      { eye: [-0.5, 1.1, 2.8], position: [-2, 0, 3] },
    deskMetal:  { eye: [ 0, 1.1, 2.8], position: [0, 0, 4.2] },
    corkBoard:  { eye: [ 0, 1.3, 3.2], position: [0, 1.3, 4.98] },
    mug:        { eye: [-0.2, 1.3, 3.2], position: [-1.382, 0.692, 2.340] },
    coatRack: { eye: [-0.200, 1.300, 3.200], position: [2.156, 0.010, 2.597], rotation: [0, 0, 0] },
    hat: { eye: [-0.200, 1.300, 3.200], position: [1.979, 1.632, 2.610], rotation: [Math.PI, 0, 2.000] },
    magnifier1: { eye: [-0.200, 1.300, 3.200], position: [0.714, 0.768, 4.253], rotation: [Math.PI, -0.594, 0] },
    detectiveCoat: { eye: [-0.200, 1.300, 3.200], position: [1.979, 1.632, 2.610], rotation: [Math.PI, 0, 2.000] },

    houseFrame: { eye: [ 0.2, 1.3, 3.6], position: [0.2, 1.3, 4.965] },
    photoClueFrame: { eye: [ 0.0, 1.3, 3.6], position: [0, 1.5, 4.965] },
    photoBlueFrame: { eye: [ 0.0, 1.3, 3.6], position: [-0.25, 1.34, 4.965] },
    mugFrame: { eye: [ 0.0, 1.3, 3.6], position: [0.50, 1.34, 4.965] },

    testPuzzle3: { eye: [-0.2, 1.2, 3.6], position: [-0.42, 0.78, 4.2], rotation: [Math.PI/2 , Math.PI, 0] },
    deskTopSpawn: { eye: [0.2, 1.3, 3.6], position: [0.12, 0.78, 4.2], rotation: [-Math.PI / 2, 0, Math.PI] },
    deskTopSpawn2: { eye: [0.2, 1.3, 3.6], position: [0.62, 0.78, 4.2], rotation: [-Math.PI / 2, 0, Math.PI] },
    drawerLeftTopContent: { eye: [0.2, 1.3, 3.6], position: [0.12, 0.78, 3.2] },

    bookA:   { eye: [0.2, 1.3, 3.6], position: [1.2, 0.695, 4.25], rotation: [Math.PI, -0.6, 0] },
    bookB:   { eye: [0.2, 1.3, 3.6], position: [1.2, 0.665, 4.25], rotation: [Math.PI, -0.5, 0] },

    binder1: { eye: [0.200, 1.300, 3.600], position: [2.380, 0.613, 3.753], rotation: [-Math.PI/2, 0, 0] },
    binder2: { eye: [0.200, 1.300, 3.600], position: [2.384, 1.372, 3.451], rotation: [-Math.PI/2, 0, 0] },

    binder3: { eye: [0.200, 1.300, 3.600], position: [2.373, 0.993, 3.75], rotation: [-Math.PI/2, 0, 0] },
    binder4: { eye: [0.200, 1.300, 3.600], position: [2.373, 0.993, 3.69], rotation: [-Math.PI/2, 0, 0] },
    binder5: { eye: [0.200, 1.300, 3.600], position: [2.373, 0.993, 3.63], rotation: [-Math.PI/2, 0, 0] },
    binder6: { eye: [0.200, 1.300, 3.600], position: [2.373, 0.993, 3.57], rotation: [-Math.PI/2, 0, 0] },
    binder7: { eye: [0.200, 1.300, 3.600], position: [2.373, 0.993, 3.51], rotation: [-Math.PI/2, 0, 0] },
    binder8: { eye: [0.200, 1.300, 3.600], position: [2.373, 0.993, 3.45], rotation: [-Math.PI/2, 0, 0] },
    binder9: { eye: [0.200, 1.300, 3.600], position: [2.373, 0.993, 3.39], rotation: [-Math.PI/2, 0, 0] },

    binder20: { eye: [0.200, 1.300, 3.600], position: [2.377, 1.369, 2.986], rotation: [-Math.PI/2, 0, 0] },

    clock: { eye: [2.000, 1.600, 3.600], position: [-1.110, 1.730, 4.968], rotation: [-Math.PI, 0, -Math.PI] },

    plant: { eye: [1.000, 1.200, 3.500], position: [1.047, 0.734, 4.397], rotation: [0, 0.200, 0] },

    cardboard1:   { eye: [1.7, 1.2, 3.4], position: [1.90, 0.725, 4.20], rotation: [0, 0.4, 0] },
    cardbox01:    { eye: [1.90, 1.1, 3.2], position: [1.90, 0.10, 4.20], rotation: [0, 0.4, 0] },
    cardboardLid1:{ eye: [1.7, 1.2, 3.4], position: [1.80, 0.75, 4.40], rotation: [0.4, 0.1, 0.4] },

    trashBin: { eye: [-1.100, 1.050, 3.200], position: [-1.138, 0.191, 4.172], rotation: [0, 0.350, 0] },

    cigar1: { eye: [-0.800, 1.050, 3.200], position: [-0.769, 0.795, 4.408], rotation: [1.000, -0.350, Math.PI/2] },
    ashTray1: { eye: [-0.760, 1.050, 3.200], position: [-0.741, 0.778, 4.421], rotation: [0, -0.280, 0] },

    mapFrame: { eye: [0.2, 1.3, 3.6], position: [0.40, 1.60, 4.965], rotation: [Math.PI, 0, Math.PI + 0.05] },
    mapFramePin: { eye: [0.200, 1.300, 3.600], position: [0.400, 1.681, 4.957], rotation: [Math.PI/2, 0, -3.092] },

    calendar2025: { eye: [0.900, 1.300, 3.600], position: [1.107, 1.064, 4.988], rotation: [Math.PI, 0, Math.PI] },

    newspaper1: { eye: [0.900, 1.300, 3.600], position: [-1.138, 0.001, 3.652], rotation: [-Math.PI/2, 0, 2.917] },
    newspaper2: { eye: [0.900, 1.300, 3.600], position: [0.974, 0.001, 4.391], rotation: [-Math.PI/2, 0, 2.530] },
    newspaper3: { eye: [0.900, 1.300, 3.600], position: [0.107, 0.001, 3.360], rotation: [-Math.PI/2, 0, -2.856] },

    writtenLetter1: { eye: [0.900, 1.300, 3.600], position: [1.136, 1.550, 4.995], rotation: [Math.PI, 0, -2.848] },
    writtenLetter2: { eye: [0.900, 1.300, 3.600], position: [1.015, 1.750, 4.997], rotation: [Math.PI, 0, 2.904] },

    blinds1: { eye: [0.900, 1.300, 3.600], position: [-1.528, 1.5, 3.299], rotation: [0, Math.PI/2, 0] },
    blinds2: { eye: [0.900, 1.300, 3.600], position: [-1.528, 1.5, 2.299], rotation: [0, Math.PI/2, 0] },

    window1: { eye: [0.900, 1.300, 3.600], position: [-1.517, 1.314, 3.293], rotation: [0, Math.PI/2, 0] },
    window2: { eye: [0.900, 1.300, 3.600], position: [-1.517, 1.314, 2.293], rotation: [0, Math.PI/2, 0] },

    outsideLight1: { eye: [0.900, 1.300, 3.600], position: [-2.079, 1.740, 2.293], rotation: [0, Math.PI/2, 0] },

    bookshelf1: { eye: [-0.600, 1.600, 3.300], position: [2.371, 0.000, 3.370], rotation: [0, -Math.PI/2, 0] },
    bookshelf2: { eye: [-0.600, 1.600, 3.300], position: [-1.369, 0.000, 2.819], rotation: [0, Math.PI/2, 0] },
}
