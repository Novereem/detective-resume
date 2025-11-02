import type { Vec3 } from "@/components/Types/room"

export type AnchorKey =
    | "bulb" | "desk1" | "desk2" | "deskMetal"
    | "corkBoard" | "mug" | "coatRack" | "hat" | "houseFrame"
    | "deskTopSpawn" | "drawerLeftTopContent"
    | "photoClueFrame"| "photoBlueFrame"| "deskTopSpawn2" | "testPuzzle3"

export const ANCHOR: Record<AnchorKey, { eye: Vec3; position: Vec3; rotation?: Vec3 }> = {
    bulb:       { eye: [ 0.6, 1.6, 3.3], position: [0, 2, 4.3] },
    desk1:      { eye: [ 0.8, 1.1, 2.8], position: [1.6, 0, 4.3] },
    desk2:      { eye: [-0.5, 1.1, 2.8], position: [-2, 0, 3] },
    deskMetal:  { eye: [ 0, 1.1, 2.8], position: [0, 0, 4.2] },
    corkBoard:  { eye: [ 0, 1.3, 3.2], position: [0, 1.3, 4.7] },
    mug:        { eye: [-0.2, 1.3, 3.2], position: [-0.2, 0.77, 4.2] },
    coatRack:   { eye: [-0.2, 1.3, 3.2], position: [2.2, 0.01, 3.2] },
    hat:        { eye: [-0.2, 1.3, 3.2], position: [2, 1.6, 3.2], rotation: [Math.PI , 0, 2] },

    houseFrame: { eye: [ 0.2, 1.3, 3.6], position: [0.2, 1.3, 4.6] },
    photoClueFrame: { eye: [ 0.0, 1.3, 3.6], position: [0, 1.5, 4.60] },
    photoBlueFrame: { eye: [ 0.0, 1.3, 3.6], position: [-0.25, 1.34, 4.60] },

    testPuzzle3: { eye: [-0.2, 1.2, 3.6], position: [-0.42, 0.78, 4.2], rotation: [Math.PI/2 , Math.PI, 0] },
    deskTopSpawn: { eye: [0.2, 1.3, 3.6], position: [0.12, 0.78, 4.2], rotation: [-Math.PI / 2, 0, Math.PI] },
    deskTopSpawn2: { eye: [0.2, 1.3, 3.6], position: [0.62, 0.78, 4.2], rotation: [-Math.PI / 2, 0, Math.PI] },
    drawerLeftTopContent: { eye: [0.2, 1.3, 3.6], position: [0.12, 0.78, 3.2] },
}
