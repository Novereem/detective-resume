import * as THREE from 'three'
import {PuzzleKey} from "@/components/Game/state";

export type Vec3 = [number, number, number]

export type MoveRequest = {
    camera: Vec3
    lookAt: Vec3
}

export type SecretFileSpawn = {
    id: string
    pos: Vec3
    rot?: Vec3
    message: string
    persistAfterOpen?: boolean
    unlocksPuzzleId?: PuzzleKey
    poofOnOpen?: boolean
}

export type V3Like =
    | Vec3
    | THREE.Vector3
    | ((ctx: {
    event: any
    object?: THREE.Object3D
    camera: THREE.PerspectiveCamera
    target: THREE.Vector3
    currentEye: THREE.Vector3
}) => Vec3 | THREE.Vector3)

export type FocusOpts = {
    eye?: V3Like
    lookAt?: V3Like
    distance?: number
    minDist?: number
    maxDist?: number
    keepHeight?: boolean
    fit?: boolean
    usePoint?: boolean
    bounds?: { min: Vec3; max: Vec3 }
}