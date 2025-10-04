import type * as THREE from 'three'

export type LoadOpts = {
    colorSpace?: THREE.ColorSpace
    minFilter?: THREE.TextureFilter
    magFilter?: THREE.MagnificationTextureFilter
    wrapS?: THREE.Wrapping
    wrapT?: THREE.Wrapping
    generateMipmaps?: boolean
}

export type LoadState = { pending: number; inFlight: number; queued: number }