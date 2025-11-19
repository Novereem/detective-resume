'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type BookshelfProps = Inherited & {
    /** [width, height, depth] */
    size?: [number, number, number]
    frameThickness?: number
    shelfCount?: number
    backThickness?: number
    heightReduction?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Bookshelf = memo(function Bookshelf({
                                                     size = [0.7, 2.0, 0.26],
                                                     frameThickness = 0.03,
                                                     shelfCount = 4,
                                                     backThickness = 0.008,
                                                     heightReduction = 0.1,
                                                     color = '#ffffff',
                                                     outlineColor = '#ffffff',
                                                     hoverColor = '#ff3b30',
                                                     outlineScale = 1.02,
                                                     initialRotation = [0, 0, 0] as Vec3,
                                                     materialsById,
                                                     ...rest
                                                 }: BookshelfProps) {
    const [W, H, D] = size

    const t = THREE.MathUtils.clamp(frameThickness, 0.01, Math.min(W, D) * 0.3)
    const backT = THREE.MathUtils.clamp(backThickness, 0.002, D * 0.5)
    const innerW = Math.max(0.01, W - 2 * t)
    const innerD = Math.max(0.01, D - 0.01)
    const shelves = Math.max(1, Math.floor(shelfCount))

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []
        const boundR = Math.max(W, H, D) * 0.6

        p.push(
            {
                id: 'side',
                geometry: <boxGeometry args={[t, H - heightReduction, D]} />,
                position: [-W / 2 + t / 2, H / 2 - heightReduction / 2, 0],
                color,
                outlineColor,
                boundingRadius: boundR,
                roughness: 0.9,
                metalness: 0.05,
                castShadow: true,
                receiveShadow: true,
            },
            {
                id: 'side',
                geometry: <boxGeometry args={[t, H - heightReduction, D]} />,
                position: [W / 2 - t / 2, H / 2 - heightReduction / 2, 0],
                color,
                outlineColor,
                boundingRadius: boundR,
                roughness: 0.9,
                metalness: 0.05,
                castShadow: true,
                receiveShadow: true,
            },
        )

        p.push(
            {
                id: 'bottom',
                geometry: <boxGeometry args={[innerW, t, D]} />,
                position: [0, t / 2, 0],
                color,
                outlineColor,
                boundingRadius: boundR,
                roughness: 0.9,
                metalness: 0.05,
                castShadow: true,
                receiveShadow: true,
            },
            {
                id: 'top',
                geometry: <boxGeometry args={[innerW, t, D]} />,
                position: [0, H - t / 2 - heightReduction, 0],
                color,
                outlineColor,
                boundingRadius: boundR,
                roughness: 0.9,
                metalness: 0.05,
                castShadow: true,
                receiveShadow: true,
            },
        )

        p.push({
            id: 'back',
            geometry: <boxGeometry args={[W, H - heightReduction, backT]} />,
            position: [0, H / 2 - heightReduction / 2, -D / 2 + backT / 2],
            color,
            outlineColor,
            boundingRadius: boundR,
            roughness: 0.98,
            metalness: 0.02,
            castShadow: true,
            receiveShadow: true,
        })

        const regionBottom = t * 2
        const regionTop = H - t * 1.5
        const usable = Math.max(0.01, regionTop - regionBottom)
        const step = usable / (shelves + 1)

        for (let i = 0; i < shelves; i++) {
            const y = regionBottom + step * (i + 1)
            p.push({
                id: 'shelf',
                geometry: <boxGeometry args={[innerW, t, innerD]} />,
                position: [0, y, 0],
                color,
                outlineColor,
                boundingRadius: boundR,
                roughness: 0.9,
                metalness: 0.05,
                castShadow: true,
                receiveShadow: true,
            })
        }

        return p
    }, [W, H, D, t, backT, innerW, innerD, shelves, color, outlineColor])

    const hitboxSize: Vec3 = [W, H, D]
    const hitboxCenter: Vec3 = [0, H / 2, 0]

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
