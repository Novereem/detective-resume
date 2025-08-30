import React from 'react'

export type Vec3 = [number, number, number]

export type OutlinedInspect = {
    kind: 'outlined'
    geometry: React.ReactElement
    color?: string
    outlineColor?: string
    outlineScale?: number
    initialRotation?: Vec3
    pixelSize?: number
    inspectDistance?: number
}

export type FramedInspect = {
    kind: 'framed'
    width: number
    height: number
    color?: string
    borderColor?: string
    border?: number
    doubleSide?: boolean
    initialRotation?: Vec3
    pixelSize?: number
    inspectDistance?: number
    textureUrl?: string
    textureFit?: 'cover' | 'contain' | 'stretch'
    texturePixelated?: boolean
    textureZ?: number
}

export type OutlinedGroupInspect = {
    kind: 'outlinedGroup'
    initialRotation?: Vec3
    pixelSize?: number
    inspectDistance?: number
    parts: Array<{
        geometry: React.ReactElement
        color?: string
        outlineColor?: string
        outlineScale?: number
        position?: Vec3
        rotation?: Vec3
        scale?: number | Vec3
        textureUrl?: string
        texturePixelated?: boolean
        metalness?: number
        roughness?: number
    }>
}

export type InspectState = OutlinedInspect | FramedInspect | OutlinedGroupInspect