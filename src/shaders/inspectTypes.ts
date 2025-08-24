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
}

export type OutlinedGroupInspect = {
    kind: 'outlinedGroup'
    initialRotation?: Vec3
    pixelSize?: number
    parts: Array<{
        geometry: React.ReactElement
        color?: string
        outlineColor?: string
        outlineScale?: number
        position?: Vec3
        rotation?: Vec3
        scale?: number | Vec3
    }>
}

export type InspectState = OutlinedInspect | FramedInspect | OutlinedGroupInspect