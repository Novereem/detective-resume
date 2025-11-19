import React from 'react'
import type { Vec3 } from '@/components/Types/room'
import {PuzzleId} from "@/components/Types/game";
import * as THREE from 'three'

export type TextPuzzle = {
    type: 'text'
    id?: string
    prompt?: string
    answers: Array<string | RegExp>
    normalize?: 'none' | 'trim' | 'lower' | 'trim-lower'
    feedback?: {
        correct?: string
        incorrect?: string
    }
    multipleAnswers?: number
}

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
    inspectDisableOutline?: boolean
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
        transparent?: boolean
        opacity?: number
        depthWrite?: boolean
        side?: THREE.Side
    }>
}
export type PuzzleOverlayMeta = {
    type: 'puzzle'
    puzzleId: PuzzleId
    solved?: boolean
    solvedAnswer?: string
}

export type InspectState =
    | (OutlinedInspect | FramedInspect | OutlinedGroupInspect) & {
    puzzle?: TextPuzzle
    inspectDisableOutline?: boolean
    metadata?: PuzzleOverlayMeta
}