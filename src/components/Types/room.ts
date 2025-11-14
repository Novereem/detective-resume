import * as THREE from 'three'

export type Vec3 = [number, number, number]

export type MoveRequest = {
    camera: Vec3
    lookAt: Vec3
}

export type DrawerFileLike = {
    id: string;
    drawerKey: string;
    message?: string;
    persistAfterOpen?: boolean
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