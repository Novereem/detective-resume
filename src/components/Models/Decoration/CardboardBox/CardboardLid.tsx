'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type CardboardLidProps = Inherited & {
    size?: [number, number]
    wallT?: number
    sideH?: number
    clearance?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const CardboardLid = memo(function CardboardLid({
                                                           size = [0.28, 0.28],
                                                           wallT = 0.003,
                                                           sideH = 0.028,
                                                           clearance = 0.002,
                                                           color = '#caa874',
                                                           outlineColor = '#ffffff',
                                                           hoverColor = '#ff3b30',
                                                           outlineScale = 1.02,
                                                           initialRotation = [0, 0, 0] as Vec3,
                                                           materialsById,
                                                           ...rest
                                                       }: CardboardLidProps) {
    const [W, D] = size
    const outerW = W + 2 * (clearance + wallT)
    const outerD = D + 2 * (clearance + wallT)

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // top plate
        p.push({
            id: 'lidTop',
            geometry: <boxGeometry args={[outerW, wallT, outerD]} />,
            position: [0, sideH + wallT / 2, 0],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        // +Z side
        p.push({
            id: 'lidSide',
            geometry: <boxGeometry args={[outerW, sideH, wallT]} />,
            position: [0, sideH / 2, outerD / 2 - wallT / 2],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        // -Z side
        p.push({
            id: 'lidSide',
            geometry: <boxGeometry args={[outerW, sideH, wallT]} />,
            position: [0, sideH / 2, -outerD / 2 + wallT / 2],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        // +X side
        p.push({
            id: 'lidSide',
            geometry: <boxGeometry args={[wallT, sideH, outerD - 2 * wallT]} />,
            position: [outerW / 2 - wallT / 2, sideH / 2, 0],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        // -X side
        p.push({
            id: 'lidSide',
            geometry: <boxGeometry args={[wallT, sideH, outerD - 2 * wallT]} />,
            position: [-outerW / 2 + wallT / 2, sideH / 2, 0],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        return p
    }, [outerW, outerD, sideH, wallT, color, outlineColor])

    const hitH = sideH + wallT
    const hitbox: Vec3 = [outerW, hitH, outerD]

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={materialsById}
            hitbox={{ size: hitbox, center: [0, hitH / 2, 0] }}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            initialRotation={initialRotation}
            outlineScale={outlineScale}
        />
    )
})