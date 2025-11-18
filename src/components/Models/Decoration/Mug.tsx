'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type MugProps = Inherited & {
    radius?: number
    height?: number
    wall?: number
    rimH?: number
    bottomT?: number

    handleRadius?: number
    handleTubeRadius?: number
    handleYOffset?: number

    magnifierOnly?: boolean

    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Mug = memo(function Mug({
                                                   radius = 0.045,
                                                   height = 0.095,
                                                   wall = 0.004,
                                                   rimH = 0.006,
                                                   bottomT = 0.006,

                                                   handleRadius = 0.035,
                                                   handleTubeRadius = 0.005,
                                                   handleYOffset = 0.0,

                                                   color = '#ffffff',
                                                   outlineColor = '#ffffff',
                                                   hoverColor = '#ff3b30',
                                                   outlineScale = 1.03,
                                                   initialRotation = [0, 0, 0] as Vec3,
                                                   materialsById,
                                                   magnifierOnly = false,
                                                   ...rest
                                               }: MugProps) {
    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        const R = radius
        const innerR = Math.max(0.01, R - wall)
        const H = height
        const innerH = Math.max(0.01, H - rimH)

        // outer wall
        p.push({
            id: 'wallOuter',
            geometry: <cylinderGeometry args={[R, R, H, 48, 1, true]} />,
            position: [0, 0, 0],
            color,
            outlineColor,
            roughness: 0.9,
            metalness: 0.02,
            castShadow: true,
            receiveShadow: true,
            magnifierOnly,
        })

        // inner wall
        p.push({
            id: 'wallInner',
            geometry: <cylinderGeometry args={[innerR, innerR, innerH, 48, 1, true]} />,
            position: [0, -rimH / 2, 0],
            color,
            outlineColor,
            roughness: 0.95,
            metalness: 0.02,
            side: THREE.DoubleSide,
            castShadow: false,
            receiveShadow: true,
            magnifierOnly,
        })

        // rounded top rim (fills gap between inner and outer walls)
        const rimRadius = (R + innerR) * 0.5
        const rimTube = rimH * 0.5
        p.push({
            id: 'rimTop',
            geometry: <torusGeometry args={[rimRadius, rimTube, 24, 64]} />,
            rotation: [Math.PI / 2, 0, 0],
            position: [0, H / 2 - rimTube * 0.8, 0],
            color,
            outlineColor,
            roughness: 0.9,
            metalness: 0.02,
            castShadow: true,
            receiveShadow: true,
            magnifierOnly,
        })

        p.push({
            id: 'rimBottom',
            geometry: <torusGeometry args={[rimRadius, rimTube, 24, 64]} />,
            rotation: [Math.PI / 2, 0, 0],
            position: [0, -height/2, 0],
            color,
            outlineColor,
            roughness: 0.9,
            metalness: 0.02,
            castShadow: true,
            receiveShadow: true,
            magnifierOnly,
        })


        // bottom disk – override this id to hide your secret
        p.push({
            id: 'bottom',
            geometry: <cylinderGeometry args={[innerR, innerR, bottomT, 48, 1, false]} />,
            position: [0, -H / 2 + bottomT / 2, 0],
            color,
            outlineColor,
            roughness: 0.95,
            metalness: 0.02,
            castShadow: true,
            receiveShadow: true,
            magnifierOnly,
        })

        // extra inner bottom to avoid see-through at grazing angles
        p.push({
            id: 'bottomInner',
            geometry: <cylinderGeometry args={[innerR * 0.995, innerR * 0.995, bottomT * 0.6, 48, 1, false]} />,
            position: [0, -H / 2 + bottomT * 0.6 +0.01, 0],
            color,
            outlineColor,
            roughness: 0.97,
            metalness: 0.0,
            side: THREE.FrontSide,
            castShadow: false,
            receiveShadow: true,
            magnifierOnly,
        })

        // handle – smaller and rotated like you tested
        p.push({
            id: 'handle',
            geometry: (
                <torusGeometry
                    args={[
                        handleRadius,
                        handleTubeRadius,
                        20,
                        56,
                        Math.PI * 1.02,
                    ]}
                />
            ),
            rotation: [0, 0, -Math.PI / 2],
            position: [R, handleYOffset, 0],
            color,
            outlineColor,
            roughness: 0.85,
            metalness: 0.02,
            castShadow: true,
            receiveShadow: true,
            magnifierOnly,
        })

        return p
    }, [
        radius,
        height,
        wall,
        rimH,
        bottomT,
        handleRadius,
        handleTubeRadius,
        handleYOffset,
        color,
        outlineColor,
    ])

    const Rmax = radius + handleRadius + handleTubeRadius
    const hitbox: { size: Vec3; center: Vec3 } = {
        size: [Rmax * 2, height, Rmax * 2] as Vec3,
        center: [0, 0, 0],
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
            magnifierOnly={magnifierOnly}
        />
    )
})

export default Mug
