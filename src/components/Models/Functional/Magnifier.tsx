'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'
import { useMagnifierState} from "@/components/MagnifierStateContext";

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type MagnifierProps = Inherited & {
    lensRadius?: number
    lensThickness?: number
    ringThickness?: number
    handleRadius?: number
    handleLength?: number
    neckRadius?: number
    neckLength?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Magnifier = memo(function Magnifier({
                                                     lensRadius = 0.045,
                                                     lensThickness = 0.004,
                                                     ringThickness = 0.004,
                                                     handleRadius = 0.007,
                                                     handleLength = 0.12,
                                                     neckRadius = 0.0045,
                                                     neckLength = 0.015,
                                                     color = '#cccccc',
                                                     outlineColor = '#ffffff',
                                                     hoverColor = '#ff3b30',
                                                     outlineScale = 1.03,
                                                     initialRotation = [0, 0, 0] as Vec3,
                                                     materialsById,
                                                     ...rest
                                                 }: MagnifierProps) {
    const { held } = useMagnifierState()

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        const R = lensRadius
        const lensT = lensThickness
        const ringT = ringThickness
        const handleR = handleRadius
        const handleL = handleLength
        const neckR = neckRadius
        const neckL = neckLength

        p.push({
            id: 'ring',
            geometry: <torusGeometry args={[R + ringT * 0.1, ringT * 0.5, 24, 64]} />,
            position: [0, 0, 0],
            rotation: [Math.PI / 2, 0, 0],
            color,
            outlineColor,
            roughness: 0.35,
            metalness: 0.9,
            castShadow: true,
            receiveShadow: true,
        })

        p.push({
            id: 'lens',
            geometry: <cylinderGeometry args={[R - ringT * 0.4, R - ringT * 0.4, lensT, 48]} />,
            position: [0, 0, 0],
            color: '#f5f7ff',
            outlineColor,
            roughness: 0,
            metalness: 0,
            transparent: true,
            opacity: 0.05,
            depthWrite: false,
            side: THREE.DoubleSide,
            castShadow: false,
            receiveShadow: false,
        })

        const neckZ = -(R + neckL * 0.5)
        p.push({
            id: 'neck',
            geometry: <cylinderGeometry args={[neckR, neckR, neckL, 32]} />,
            rotation: [Math.PI / 2, 0, 0],
            position: [0, 0, neckZ],
            color,
            outlineColor,
            roughness: 0.3,
            metalness: 0.9,
            castShadow: true,
            receiveShadow: true,
        })

        const handleZ = -(R + neckL + handleL * 0.5)
        p.push({
            id: 'handle',
            geometry: <cylinderGeometry args={[handleR, handleR, handleL, 32]} />,
            rotation: [Math.PI / 2, 0, 0],
            position: [0, 0, handleZ],
            color: '#111111',
            outlineColor,
            roughness: 0.8,
            metalness: 0.1,
            castShadow: true,
            receiveShadow: true,
        })

        return p
    }, [
        lensRadius,
        lensThickness,
        ringThickness,
        handleRadius,
        handleLength,
        neckRadius,
        neckLength,
        color,
        outlineColor,
    ])

    const derivedMaterials = useMemo(() => {
        const base = materialsById ?? {}
        const lensBase = (base as any).lens ?? {}

        const activeColor = held ? '#86b8ff' : (lensBase.color ?? '#f5f7ff')
        const activeOpacity = held ? 0.35 : (typeof lensBase.opacity === 'number' ? lensBase.opacity : 0.05)

        return {
            ...base,
            lens: {
                ...lensBase,
                color: activeColor,
                transparent: true,
                opacity: activeOpacity,
                depthWrite: false,
            },
        }
    }, [materialsById, held])

    const Rmax = lensRadius + ringThickness
    const depth = lensRadius + neckLength + handleLength
    const hitboxSize: Vec3 = [Rmax * 2, Rmax * 2, depth]
    const hitboxCenter: Vec3 = [0, 0, -depth / 2]

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={derivedMaterials}
            hitbox={{ size: hitboxSize, center: hitboxCenter }}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            initialRotation={initialRotation}
            outlineScale={outlineScale}
        />
    )
})

export default Magnifier
