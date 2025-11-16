'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

export type StaplerProps = Omit<
    React.ComponentProps<typeof ModelGroup>,
    'parts' | 'materialsById'
> & {
    length?: number
    width?: number
    baseHeight?: number
    topHeight?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Stapler = memo(function Stapler({
                                                 length = 0.19,
                                                 width = 0.04,
                                                 baseHeight = 0.012,
                                                 topHeight = 0.026,
                                                 color = '#111111',
                                                 outlineColor = '#ffffff',
                                                 hoverColor = '#ff3b30',
                                                 outlineScale = 1.03,
                                                 initialRotation = [0, 0, 0] as Vec3,
                                                 materialsById,
                                                 ...rest
                                             }: StaplerProps) {
    const gap = 0.006
    const railHeight = 0.02
    const railWidth = width * 0.5
    const topLen = length * 0.96
    const baseLen = length
    const footLen = width * 0.9
    const footThick = 0.003

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        p.push({
            id: 'baseBody',
            geometry: <boxGeometry args={[baseLen, baseHeight, width]} />,
            position: [0, 0, 0],
            color,
            outlineColor,
            roughness: 0.8,
            metalness: 0.05,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'topBody',
            geometry: <boxGeometry args={[topLen, topHeight / 2, width * 0.9]} />,
            position: [0, baseHeight / 2 + gap + topHeight, 0],
            rotation: [0, 0, 0.05],
            color,
            outlineColor,
            roughness: 0.85,
            metalness: 0.04,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'metalRail',
            geometry: <boxGeometry args={[topLen * 0.88, railHeight, railWidth]} />,
            position: [0, baseHeight / 2 + railHeight / 2 + 0.01, 0],
            rotation: [0, 0, 0.05],
            color: '#cccccc',
            outlineColor,
            roughness: 0.35,
            metalness: 0.9,
            castShadow: true,
            receiveShadow: true,
        })


        const backBlockLen = length * 0.12
        p.push({
            id: 'backBlock',
            geometry: <boxGeometry args={[backBlockLen + 0.01, baseHeight * 3, width * 0.999]} />,
            position: [-baseLen / 2 + backBlockLen, 0+baseHeight, 0],
            color,
            outlineColor,
            roughness: 0.85,
            metalness: 0.04,
            castShadow: true,
            receiveShadow: true,
        })

        return p
    }, [
        baseLen,
        baseHeight,
        width,
        topLen,
        topHeight,
        gap,
        railHeight,
        railWidth,
        footLen,
        footThick,
        color,
        outlineColor,
    ])

    const sizeY = baseHeight + gap + topHeight
    const hitbox = {
        size: [baseLen, sizeY, width] as Vec3,
        center: [0, (gap + topHeight) / 2, 0] as Vec3,
    }

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={materialsById}
            hitbox={hitbox}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            initialRotation={initialRotation}
            outlineScale={outlineScale}
        />
    )
})

export default Stapler
