'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import {Vec3} from "@/components/Types/room";

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

type DeskProps = Inherited & {
    topSize?: [number, number, number]
    legRadius?: number
    legHeight?: number
    outlinePerPart?: {
        worldThickness?: number
        topScale?: number
        legScale?: number
    }
}

export const Desk = memo(function Desk({
                                           topSize = [1.3, 0.05, 0.6],
                                           legRadius = 0.03,
                                           legHeight = 0.60,
                                           color = '#222',
                                           outlineColor = '#fff',
                                           hoverColor = '#ff3b30',
                                           outlineScale = 1.04,
                                           outlinePerPart,
                                           onInspect,
                                           inspectPixelSize,
                                           ...rest
                                       }: DeskProps) {
    const [w, h, d] = topSize
    const legX = (w / 2) - legRadius * 2
    const legZ = (d / 2) - legRadius * 2

    const topScale = outlinePerPart?.topScale ?? outlineScale
    const legScale = outlinePerPart?.legScale ?? outlineScale

    const hitboxSize: Vec3 = [w + 0.2, legHeight + h + 0.1, d + 0.2]
    const hitboxCenter: Vec3 = [0, (legHeight + h) / 2, 0]

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // Table top
        p.push({
            id: 'top',
            geometry: <boxGeometry args={[w, h, d]} />,
            color,
            outlineColor,
            outlineScale: topScale,
            position: [0, legHeight + h / 2, 0],
        })

        // 4 legs
        ;[
            [-legX,  legZ],
            [ legX,  legZ],
            [-legX, -legZ],
            [ legX, -legZ],
        ].forEach(([x, z]) => {
            p.push({
                id: 'leg',
                geometry: <cylinderGeometry args={[legRadius, legRadius, legHeight, 12]} />,
                color,
                outlineColor,
                outlineScale: legScale,
                position: [x, legHeight / 2, z] as Vec3,
                rotation: [0, 0, 0],
            })
        })

        return p
    }, [w, h, d, legHeight, legRadius, legX, legZ, color, outlineColor, topScale, legScale])

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            hitbox={{ size: hitboxSize, center: hitboxCenter }}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            onInspect={onInspect}
            inspectPixelSize={inspectPixelSize}
            initialRotation={[0.2, 0.6, 0]}
        />
    )
})