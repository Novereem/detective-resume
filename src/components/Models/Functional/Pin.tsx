'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import {Vec3} from "@/components/Types/room";

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

type PinProps = Inherited & {
    headRadius?: number
    stemLength?: number
    stemRadius?: number
    tipLength?: number
}

export const Pin = memo(function Pin({
                                         headRadius = 0.01,
                                         stemLength = 0.025,
                                         stemRadius = 0.0018,
                                         tipLength  = 0.006,
                                         color = '#d62222',
                                         outlineColor = '#fff',
                                         hoverColor = '#ff3b30',
                                         outlineScale = 1.04,
                                         initialRotation = [0.2, 0.6, 0] as Vec3,
                                         ...rest
                                     }: PinProps) {
    const headY   = headRadius
    const collarH = Math.max(0.0015, headRadius * 0.22)
    const collarR = Math.max(stemRadius * 2.2, headRadius * 0.45)
    const stemY0  = headY - headRadius - collarH / 2
    const tipY0   = stemY0 - stemLength / 2 - tipLength / 2

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        p.push({
            id: 'head',
            geometry: <cylinderGeometry args={[headRadius/2, headRadius-0.003, 0.021, 24]} />,
            position: [0, headY, 0] as Vec3,
            color,
            outlineColor,
            boundingRadius: headRadius,
            roughness: 0.35,
            metalness: 0.05,
        })

        p.push({
            id: 'head',
            geometry: <cylinderGeometry args={[headRadius, headRadius-0.01, 0.021, 24]} />,
            position: [0, headY, 0] as Vec3,
            color,
            outlineColor,
            boundingRadius: headRadius,
            roughness: 0.35,
            metalness: 0.05,
        })

        p.push({
            id: 'collar',
            geometry: <cylinderGeometry args={[collarR, collarR, collarH, 24]} />,
            position: [0, headY - headRadius - collarH / 2, 0] as Vec3,
            color,
            outlineColor,
            boundingRadius: Math.max(collarR, collarH),
            roughness: 0.4,
            metalness: 0.05,
        })

        p.push({
            id: 'stem',
            geometry: <cylinderGeometry args={[stemRadius, stemRadius, stemLength, 16]} />,
            position: [0, stemY0 - stemLength / 2, 0] as Vec3,
            color: '#b9bcc0',
            outlineColor,
            boundingRadius: Math.max(stemRadius, stemLength * 0.5),
            roughness: 0.2,
            metalness: 0.8,
        })

        p.push({
            id: 'tip',
            geometry: <coneGeometry args={[stemRadius * 1.9, tipLength, 16]} />,
            position: [0, tipY0, 0] as Vec3,
            rotation: [Math.PI, 0, 0] as Vec3,
            color: '#b9bcc0',
            outlineColor,
            boundingRadius: tipLength * 0.6,
            roughness: 0.15,
            metalness: 0.9,
        })

        return p
    }, [headRadius, headY, collarH, collarR, stemLength, stemRadius, tipLength, color, outlineColor])

    const hitboxSize: Vec3 = [Math.max(headRadius * 2.4, 0.03), headRadius + collarH + stemLength + tipLength + 0.01, Math.max(headRadius * 2.4, 0.03)]
    const hitboxCenter: Vec3 = [0, (headY - headRadius - collarH - stemLength - tipLength) / 2 + headY * 0.6, 0]

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
