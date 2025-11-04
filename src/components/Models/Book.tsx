'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

type BookProps = Inherited & {
    /** X = width (hinge to fore-edge), Y = thickness, Z = height (head → tail) */
    size?: [number, number, number]
    spineThickness?: number
    coverThickness?: number
    pageInset?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Book = memo(function Book({
                                           size = [0.16, 0.028, 0.23],
                                           spineThickness = 0.008,
                                           coverThickness = 0.0035,
                                           pageInset = 0.002,
                                           color = '#ffffff',
                                           outlineColor = '#ffffff',
                                           hoverColor = '#ff3b30',
                                           outlineScale = 1.035,
                                           initialRotation = [0, 0, 0] as Vec3,
                                           materialsById,
                                           ...rest
                                       }: BookProps) {
    const [W, T, H] = size

    const clampedSpine = THREE.MathUtils.clamp(spineThickness, 0.002, Math.max(0.002, W * 0.35))
    const clampedCover = THREE.MathUtils.clamp(coverThickness, 0.0015, Math.max(0.0015, T * 0.4))
    const innerW = Math.max(0.01, W - clampedSpine - pageInset * 2)
    const innerT = Math.max(0.002, T - clampedCover * 2)
    const innerH = Math.max(0.01, H - pageInset * 4)

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // Back cover
        p.push({
            id: 'coverBack',
            geometry: <boxGeometry args={[W - spineThickness, clampedCover, H]} />,
            position: [spineThickness / 2, -T / 2 + clampedCover / 2, 0],
            color, outlineColor, boundingRadius: Math.max(W, H) * 0.5,
            roughness: 0.9, metalness: 0.0,
        })

        // Front cover
        p.push({
            id: 'coverFront',
            geometry: <boxGeometry args={[W - spineThickness, clampedCover, H]} />,
            position: [spineThickness / 2,  T / 2 - clampedCover / 2, 0],
            color, outlineColor, boundingRadius: Math.max(W, H) * 0.5,
            roughness: 0.9, metalness: 0.0,
        })

        // Spine
        p.push({
            id: 'spine',
            geometry: <boxGeometry args={[clampedSpine, T, H]} />,
            position: [-W / 2 + clampedSpine / 2, 0, 0],
            color, outlineColor, boundingRadius: Math.max(T, H) * 0.5,
            roughness: 0.85, metalness: 0.0,
        })

        // Page block
        p.push({
            id: 'pages',
            geometry: <boxGeometry args={[innerW, innerT, innerH]} />,
            position: [
                -W / 2 + clampedSpine + innerW / 2,
                0,
                0
            ],
            color, outlineColor, boundingRadius: Math.max(innerW, innerH) * 0.5,
            roughness: 0.95, metalness: 0.0,
        })

        return p
    }, [W, T, H, clampedSpine, clampedCover, innerW, innerT, innerH, pageInset, color, outlineColor])

    const hitboxSize: Vec3 = [W, T, H]
    const hitboxCenter: Vec3 = [0, 0, 0]

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={materialsById}
            hitbox={{ size: hitboxSize, center: hitboxCenter }}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            initialRotation={initialRotation}
            outlineScale={outlineScale}
        />
    )
})
