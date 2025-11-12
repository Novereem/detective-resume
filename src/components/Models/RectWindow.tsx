'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type RectWindowProps = Inherited & {
    size?: [width: number, height: number, surroundDepth: number]
    surroundBorder?: number
    frameW?: number
    frameDepth?: number
    glassT?: number
    windowOffset?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const RectWindow = memo(function RectWindow({
                                                       size = [1.25, 1.0, 0.24],
                                                       surroundBorder = 0.06,
                                                       frameW = 0.04,
                                                       frameDepth = 0.06,
                                                       glassT = 0.004,
                                                       windowOffset = -0.02,
                                                       color = '#cccccc',
                                                       outlineColor = '#ffffff',
                                                       hoverColor = '#ff3b30',
                                                       outlineScale = 1.02,
                                                       initialRotation = [0, 0, 0] as Vec3,
                                                       materialsById,
                                                       ...rest
                                                   }: RectWindowProps) {
    const [W, H, SD] = size
    const eps = 0.0006

    const innerW = Math.max(0.08, W - 2 * surroundBorder)
    const innerH = Math.max(0.08, H - 2 * surroundBorder)

    const frameInnerW = Math.max(0.01, innerW - 2 * frameW)
    const frameInnerH = Math.max(0.01, innerH - 2 * frameW)

    const zWindow = windowOffset
    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // Surround ring
        p.push(
            { id: 'surround', geometry: <boxGeometry args={[W, surroundBorder, SD]} />, position: [0,  H/2 - surroundBorder/2, 0], color, outlineColor, roughness: 1.0, metalness: 0.0, receiveShadow: true, castShadow: true },
            { id: 'surround', geometry: <boxGeometry args={[W, surroundBorder, SD]} />, position: [0, -H/2 + surroundBorder/2, 0], color, outlineColor, roughness: 1.0, metalness: 0.0, receiveShadow: true, castShadow: true },
            { id: 'surround', geometry: <boxGeometry args={[surroundBorder, innerH, SD]} />, position: [-W/2 + surroundBorder/2, 0, 0], color, outlineColor, roughness: 1.0, metalness: 0.0, receiveShadow: true, castShadow: true },
            { id: 'surround', geometry: <boxGeometry args={[surroundBorder, innerH, SD]} />, position: [ W/2 - surroundBorder/2, 0, 0], color, outlineColor, roughness: 1.0, metalness: 0.0, receiveShadow: true, castShadow: true },
        )

        // Window frame (4 sides)
        p.push(
            { id: 'frame', geometry: <boxGeometry args={[innerW, frameW, frameDepth]} />, position: [0,  innerH/2 - frameW/2, zWindow], color, outlineColor, roughness: 0.85, metalness: 0.05, receiveShadow: true, castShadow: true },
            { id: 'frame', geometry: <boxGeometry args={[innerW, frameW, frameDepth]} />, position: [0, -innerH/2 + frameW/2, zWindow], color, outlineColor, roughness: 0.85, metalness: 0.05, receiveShadow: true, castShadow: true },
            { id: 'frame', geometry: <boxGeometry args={[frameW, innerH, frameDepth]} />, position: [-innerW/2 + frameW/2, 0, zWindow], color, outlineColor, roughness: 0.85, metalness: 0.05, receiveShadow: true, castShadow: true },
            { id: 'frame', geometry: <boxGeometry args={[frameW, innerH, frameDepth]} />, position: [ innerW/2 - frameW/2, 0, zWindow], color, outlineColor, roughness: 0.85, metalness: 0.05, receiveShadow: true, castShadow: true },
        )

        // Glass (single pane)
        p.push({
            id: 'glass',
            geometry: <boxGeometry args={[Math.max(eps, frameInnerW) - eps, Math.max(eps, frameInnerH) - eps, glassT]} />,
            position: [0, 0, zWindow + eps],
            color: '#ffffff',
            outlineColor,
            roughness: 0.0, metalness: 0.0,
            transparent: true, opacity: 0.10, depthWrite: false, side: THREE.DoubleSide,
            receiveShadow: false, castShadow: false,
        })

        return p
    }, [W, H, SD, innerW, innerH, frameW, frameDepth, frameInnerW, frameInnerH, glassT, zWindow, color, outlineColor])

    const hitbox = { size: [W, H, SD] as Vec3, center: [0, 0, 0] as Vec3 }

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
            disableOutline
            inspectDisableOutline
        />
    )
})

export default RectWindow
