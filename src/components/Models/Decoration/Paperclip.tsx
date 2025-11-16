'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type PaperclipProps = Inherited & {
    length?: number
    width?: number
    wireWidth?: number
    thickness?: number
    loopGap?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

function makeRoundedRectShape(len: number, width: number, radius: number) {
    const shape = new THREE.Shape()
    const hw = len / 2
    const hh = width / 2
    const r = Math.min(radius, hw, hh)

    shape.moveTo(-hw + r, -hh)
    shape.lineTo(hw - r, -hh)
    shape.quadraticCurveTo(hw, -hh, hw, -hh + r)
    shape.lineTo(hw, hh - r)
    shape.quadraticCurveTo(hw, hh, hw - r, hh)
    shape.lineTo(-hw + r, hh)
    shape.quadraticCurveTo(-hw, hh, -hw, hh - r)
    shape.lineTo(-hw, -hh + r)
    shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh)

    return shape
}

function makeRoundedRing(len: number, width: number, radius: number, wireWidth: number) {
    const outer = makeRoundedRectShape(len, width, radius)
    const innerLen = Math.max(0.001, len - 2 * wireWidth)
    const innerWidth = Math.max(0.001, width - 2 * wireWidth)
    const innerRadius = Math.max(0.0005, radius - wireWidth)

    const inner = makeRoundedRectShape(innerLen, innerWidth, innerRadius)
    outer.holes.push(inner)

    return outer
}

export const Paperclip = memo(function Paperclip({
                                                     length = 0.032,
                                                     width = 0.008,
                                                     wireWidth = 0.0014,
                                                     thickness = 0.001,
                                                     loopGap = 0.0018,
                                                     color = '#d4d7dc',
                                                     outlineColor = '#ffffff',
                                                     hoverColor = '#ff3b30',
                                                     outlineScale = 1.03,
                                                     initialRotation = [0, 0, 0] as Vec3,
                                                     materialsById,
                                                     ...rest
                                                 }: PaperclipProps) {
    const radiusOuter = width / 2
    const radiusInner = Math.max(0.0005, radiusOuter - (wireWidth + loopGap))

    const { outerLoopShape, innerLoopShape, extrudeSettings } = useMemo(() => {
        const outerLoopShape = makeRoundedRing(length, width, radiusOuter, wireWidth)
        const innerLen = Math.max(0.001, length - 2 * (wireWidth + loopGap))
        const innerWidth = Math.max(0.001, width - 2 * (wireWidth + loopGap))
        const innerLoopShape = makeRoundedRing(innerLen, innerWidth, radiusInner, wireWidth)

        const extrudeSettings = {
            depth: thickness,
            bevelEnabled: false,
            steps: 1,
        } as THREE.ExtrudeGeometryOptions

        return { outerLoopShape, innerLoopShape, extrudeSettings }
    }, [length, width, wireWidth, loopGap, radiusOuter, radiusInner, thickness])

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        p.push({
            id: 'outerLoop',
            geometry: <extrudeGeometry args={[outerLoopShape, extrudeSettings]} />,
            position: [0, 0, -thickness / 2],
            color,
            outlineColor,
            roughness: 0.35,
            metalness: 1.0,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'innerLoop',
            geometry: <extrudeGeometry args={[innerLoopShape, extrudeSettings]} />,
            position: [0, 0, thickness / 2],
            color,
            outlineColor,
            roughness: 0.35,
            metalness: 1.0,
            castShadow: true,
            receiveShadow: true,
        })

        return p
    }, [outerLoopShape, innerLoopShape, extrudeSettings, thickness, color, outlineColor])

    const hitW = length
    const hitH = width
    const hitD = thickness * 6
    const hitboxSize: Vec3 = [hitW, hitD, hitH]
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

export default Paperclip
