import type { Vec3 } from "@/components/Types/room"

export type AnchorKey =
    | "bulb" | "desk1" | "desk2" | "deskMetal"
    | "corkBoard" | "mug" | "coatRack" | "hat" | "houseFrame"
    | "deskTopSpawn" | "drawerLeftTopContent"
    | "photoClueFrame"| "photoBlueFrame"| "deskTopSpawn2" | "testPuzzle3"
    | "bookA" | "bookB"
    | "clock"
    | "plant"
    | "cardboard1" | "cardbox01" | "cardboardLid1"
    | "trashBin"
    | "cigar1" | "ashTray1"
    | "calendar2025"
    | "mapFrame"

export const ANCHOR: Record<AnchorKey, { eye: Vec3; position: Vec3; rotation?: Vec3 }> = {
    bulb:       { eye: [ 0.6, 1.6, 3.3], position: [0, 2, 4.3] },
    desk1:      { eye: [ 0.8, 1.1, 2.8], position: [1.6, 0, 4.3] },
    desk2:      { eye: [-0.5, 1.1, 2.8], position: [-2, 0, 3] },
    deskMetal:  { eye: [ 0, 1.1, 2.8], position: [0, 0, 4.2] },
    corkBoard:  { eye: [ 0, 1.3, 3.2], position: [0, 1.3, 4.98] },
    mug:        { eye: [-0.2, 1.3, 3.2], position: [-0.2, 0.77, 4.2] },
    coatRack:   { eye: [-0.2, 1.3, 3.2], position: [2.2, 0.01, 3.2] },
    hat:        { eye: [-0.2, 1.3, 3.2], position: [2, 1.6, 3.2], rotation: [Math.PI , 0, 2] },

    houseFrame: { eye: [ 0.2, 1.3, 3.6], position: [0.2, 1.3, 4.965] },
    photoClueFrame: { eye: [ 0.0, 1.3, 3.6], position: [0, 1.5, 4.60] },
    photoBlueFrame: { eye: [ 0.0, 1.3, 3.6], position: [-0.25, 1.34, 4.60] },

    testPuzzle3: { eye: [-0.2, 1.2, 3.6], position: [-0.42, 0.78, 4.2], rotation: [Math.PI/2 , Math.PI, 0] },
    deskTopSpawn: { eye: [0.2, 1.3, 3.6], position: [0.12, 0.78, 4.2], rotation: [-Math.PI / 2, 0, Math.PI] },
    deskTopSpawn2: { eye: [0.2, 1.3, 3.6], position: [0.62, 0.78, 4.2], rotation: [-Math.PI / 2, 0, Math.PI] },
    drawerLeftTopContent: { eye: [0.2, 1.3, 3.6], position: [0.12, 0.78, 3.2] },

    bookA:   { eye: [0.2, 1.3, 3.6], position: [1.2, 0.695, 4.25], rotation: [Math.PI, -0.6, 0] },
    bookB:   { eye: [0.2, 1.3, 3.6], position: [1.2, 0.665, 4.25], rotation: [Math.PI, -0.5, 0] },

    clock: { eye: [2.000, 1.600, 3.600], position: [-1.110, 1.730, 4.968], rotation: [-Math.PI, 0, -Math.PI] },

    plant: { eye: [1.000, 1.200, 3.500], position: [1.047, 0.734, 4.397], rotation: [0, 0.200, 0] },

    cardboard1:   { eye: [1.7, 1.2, 3.4], position: [1.90, 0.725, 4.20], rotation: [0, 0.4, 0] },
    cardbox01:    { eye: [1.90, 1.1, 3.2], position: [1.90, 0.10, 4.20], rotation: [0, 0.4, 0] },
    cardboardLid1:{ eye: [1.7, 1.2, 3.4], position: [1.80, 0.75, 4.40], rotation: [0.4, 0.1, 0.4] },

    trashBin: { eye: [-1.100, 1.050, 3.200], position: [-1.138, 0.191, 4.172], rotation: [0, 0.350, 0] },

    cigar1: { eye: [-0.800, 1.050, 3.200], position: [-0.769, 0.795, 4.408], rotation: [1.000, -0.350, Math.PI/2] },
    ashTray1: { eye: [-0.760, 1.050, 3.200], position: [-0.741, 0.778, 4.421], rotation: [0, -0.280, 0] },

    mapFrame: { eye: [0.2, 1.3, 3.6], position: [0.40, 1.60, 4.965], rotation: [Math.PI, 0, Math.PI + 0.05] },
    calendar2025: { eye: [0.900, 1.300, 3.600], position: [1.05, 1.677, 4.988], rotation: [Math.PI, 0, Math.PI] },
}
