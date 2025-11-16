'use client'
import React, {memo, useMemo, useState} from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'
import {useFrame} from "@react-three/fiber";

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type GlobeProps = Inherited & {
    globeRadius?: number
    ringRadius?: number
    ringTubeRadius?: number
    standHeight?: number
    standRadius?: number
    baseRadius?: number
    baseThickness?: number
    rotationSpeed?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Globe = memo(function Globe({
                                             globeRadius = 0.082,
                                             ringRadius = 0.0945,
                                             ringTubeRadius = 0.004,
                                             standHeight = 0.05,
                                             standRadius = 0.012,
                                             baseRadius = 0.06,
                                             baseThickness = 0.002,
                                             rotationSpeed = 0.1,
                                             color = '#cccccc',
                                             outlineColor = '#ffffff',
                                             hoverColor = '#ff3b30',
                                             outlineScale = 1.03,
                                             initialRotation = [0, 0, 0] as Vec3,
                                             materialsById,
                                             ...rest
                                         }: GlobeProps) {
    const [spin, setSpin] = useState(0)

    useFrame((_, delta) => {
        const twoPi = Math.PI * 2
        setSpin(prev => (prev + rotationSpeed * delta) % twoPi)
    })

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        const baseTopY = baseThickness / 2
        const ringBottomY = baseTopY + standHeight
        const globeCenterY = ringBottomY + ringRadius

        const connectorRadius = 0.006
        const connectorHeight = 0.018



        p.push({
            id: 'globe',
            geometry: <sphereGeometry args={[globeRadius, 48, 48]} />,
            position: [0, globeCenterY, 0],
            rotation: [-0.4, spin, 0],
            color,
            outlineColor,
            roughness: 0.9,
            metalness: 0.0,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'ring',
            geometry: <torusGeometry args={[ringRadius, ringTubeRadius, 24, 64, Math.PI]} />,
            position: [0, globeCenterY, 0],
            rotation: [Math.PI / 2 + Math.PI - 0.4, Math.PI/2, 0],
            color,
            outlineColor,
            roughness: 0.35,
            metalness: 1.0,
            side: THREE.DoubleSide,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'topCap',
            geometry: <cylinderGeometry args={[connectorRadius, connectorRadius, connectorHeight+0.003, 24]} />,
            position: [0, globeCenterY + globeRadius - connectorHeight / 2 + 0.008, -0.032],
            rotation: [-0.4,0,0],
            color,
            outlineColor,
            roughness: 0.4,
            metalness: 1.0,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'bottomCap',
            geometry: <cylinderGeometry args={[connectorRadius, connectorRadius, connectorHeight+0.003, 24]} />,
            position: [0, globeCenterY - globeRadius + connectorHeight / 2 - 0.008, 0.032],
            rotation: [-0.4,0,0],
            color,
            outlineColor,
            roughness: 0.4,
            metalness: 1.0,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'stand',
            geometry: <cylinderGeometry args={[standRadius, standRadius, standHeight, 32]} />,
            position: [0, baseTopY + standHeight / 2 , 0],
            color,
            outlineColor,
            roughness: 0.4,
            metalness: 1.0,
            castShadow: false,
            receiveShadow: true,
        })

        p.push({
            id: 'base',
            geometry: <cylinderGeometry args={[baseRadius, baseRadius, baseThickness, 48]} />,
            position: [0, 0, 0],
            color,
            outlineColor,
            roughness: 0.4,
            metalness: 1.0,
            castShadow: true,
            receiveShadow: true,
        })

        return p
    }, [globeRadius, ringRadius, ringTubeRadius, standHeight, standRadius, baseRadius, baseThickness, color, outlineColor, spin])

    const baseBottomY = -baseThickness / 2
    const baseTopY = baseThickness / 2
    const ringBottomY = baseTopY + standHeight
    const globeCenterY = ringBottomY + ringRadius
    const topY = globeCenterY + globeRadius
    const bottomY = baseBottomY
    const sizeY = topY - bottomY
    const sizeX = (ringRadius + ringTubeRadius) * 2
    const sizeZ = sizeX
    const centerY = (topY + bottomY) / 2

    const hitboxSize: Vec3 = [sizeX, sizeY, sizeZ]
    const hitboxCenter: Vec3 = [0, centerY, 0]

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

export default Globe
