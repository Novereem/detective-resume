'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type PenProps = Inherited & {
    length?: number
    radius?: number
    tipRadius?: number
    colorBody?: string
    colorTip?: string
    colorTail?: string
    colorClip?: string
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Pen = memo(function Pen({
                                         length = 0.16,
                                         radius = 0.0055,
                                         tipRadius = 0.003,
                                         color = '#111111',
                                         colorBody = '#111111',
                                         colorTip = '#111111',
                                         colorTail = '#111111',
                                         colorClip = '#111111',
                                         outlineColor = '#ffffff',
                                         hoverColor = '#ff3b30',
                                         outlineScale = 1.03,
                                         initialRotation = [0, 0, 0] as Vec3,
                                         materialsById,
                                         ...rest
                                     }: PenProps) {
    const bodyL = length * 0.7
    const tipL = length * 0.08
    const tailL = length * 0.12

    const clipLen = bodyL * 0.65
    const clipThick = radius * 0.45
    const clipWide = radius * 0.6

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        p.push({
            id: 'body',
            geometry: <cylinderGeometry args={[radius, radius, bodyL, 32]} />,
            position: [0, 0, 0],
            color: colorBody,
            outlineColor,
            roughness: 0.9,
            metalness: 0.08,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'tip',
            geometry: <cylinderGeometry args={[tipRadius, radius * 0.9, tipL, 32]} />,
            position: [0, bodyL / 2 + tipL / 2, 0],
            color: colorTip,
            outlineColor,
            roughness: 0.3,
            metalness: 0.9,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'tail',
            geometry: <cylinderGeometry args={[radius * 0.9, radius * 0.4, tailL, 32]} />,
            position: [0, -bodyL / 2 - tailL / 2, 0],
            color: colorTail,
            outlineColor,
            roughness: 0.92,
            metalness: 0.06,
            castShadow: true,
            receiveShadow: true,
        })

        const clipY = bodyL / 2 - clipLen / 2
        const clipX = radius + clipWide / 2 - 0.0002

        p.push({
            id: 'clip',
            geometry: <boxGeometry args={[clipWide, clipLen, clipThick]} />,
            position: [clipX, clipY, 0],
            color: colorClip,
            outlineColor,
            roughness: 0.35,
            metalness: 0.9,
            castShadow: true,
            receiveShadow: true,
        })

        return p
    }, [bodyL, tailL, tipL, radius, tipRadius, clipLen, clipThick, clipWide, color, outlineColor])

    const totalL = bodyL + tipL + tailL
    const hitboxSize: Vec3 = [radius * 4, totalL, radius * 4]
    const hitboxCenter: Vec3 = [0, (tipL - tailL) / 2, 0]

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

export default Pen
