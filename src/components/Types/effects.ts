import type * as THREE from 'three'

export type PoofEffectProps = {
    position?: [number, number, number] | THREE.Vector3
    count?: number
    duration?: number
    stagger?: number
    jitterRadius?: number
    jitterSeed?: number
    onDone?: () => void
}