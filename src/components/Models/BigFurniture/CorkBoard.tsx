'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import {Vec3} from "@/components/Types/room";

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

type CorkBoardProps = Inherited & {
    width?: number
    height?: number
    frameWidth?: number
    boardThickness?: number
    frameDepth?: number
}

export const CorkBoard = memo(function CorkBoard({
                                                     width = 1.5,
                                                     height = 1,
                                                     frameWidth = 0.06,
                                                     boardThickness = 0.02,
                                                     frameDepth = 0.03,
                                                     color = '#7a5a3a',
                                                     outlineColor = '#fff',
                                                     hoverColor = '#ff3b30',
                                                     outlineScale = 1.035,
                                                     initialRotation = [0, 0, 0] as Vec3,
                                                     ...rest
                                                 }: CorkBoardProps) {

    const wInner = Math.max(0.1, width - 2 * frameWidth)
    const hInner = Math.max(0.1, height - 2 * frameWidth)
    const halfW = width / 2
    const halfH = height / 2

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        p.push({
            id: 'board',
            geometry: <boxGeometry args={[wInner, hInner, boardThickness]} />,
            position: [0, 0, -(frameDepth - boardThickness) * 0.3] as Vec3,
            boundingRadius: Math.hypot(wInner, hInner) * 0.5,
            color: '#8a6a4a',
            roughness: 0.9,
            metalness: 0.0,
        })

        ;([
            { id: 'frame',  x: - (halfW - frameWidth / 2) },
            { id: 'frame', x:   (halfW - frameWidth / 2) },
        ] as const).forEach(({ id, x }) => {
            p.push({
                id,
                geometry: <boxGeometry args={[frameWidth, hInner + frameWidth * 2, frameDepth]} />,
                position: [x, 0, 0] as Vec3,
                color,
                outlineColor,
                boundingRadius: Math.hypot(frameWidth, hInner) * 0.6,
                roughness: 0.6,
                metalness: 0.0,
            })
        })

        ;([
            { id: 'frame',    y:  (halfH - frameWidth / 2) },
            { id: 'frame', y: - (halfH - frameWidth / 2) },
        ] as const).forEach(({ id, y }) => {
            p.push({
                id,
                geometry: <boxGeometry args={[wInner, frameWidth, frameDepth]} />,
                position: [0, y, 0] as Vec3,
                color,
                outlineColor,
                boundingRadius: Math.hypot(wInner, frameWidth) * 0.6,
                roughness: 0.6,
                metalness: 0.0,
            })
        })

        return p
    }, [width, height, frameWidth, wInner, hInner, boardThickness, frameDepth, color, outlineColor])

    const hitboxSize: Vec3 = [width, height, Math.max(frameDepth, boardThickness)]
    const hitboxCenter: Vec3 = [0, 0, 0]

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            hitbox={{ size: hitboxSize, center: hitboxCenter }}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            initialRotation={initialRotation}
            outlineScale={outlineScale}
        />
    )
})
