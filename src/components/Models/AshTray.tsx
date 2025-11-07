'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type AshTrayWoodProps = Inherited & {
    size?: [side: number, height: number]
    bowlRadius?: number
    bowlDepth?: number
    topThickness?: number
    slotWidth?: number
    slotInsetFromEdge?: number
    slotLength?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const AshTrayWood = memo(function AshTrayWood({
                                                         size = [0.135, 0.032],
                                                         bowlRadius = 0.055,
                                                         bowlDepth = 0.025,
                                                         topThickness = 0.020,
                                                         slotWidth = 0.018,
                                                         slotInsetFromEdge = 0.004,
                                                         slotLength = 0.052,
                                                         color = '#8a633f',
                                                         outlineColor = '#ffffff',
                                                         hoverColor = '#ff3b30',
                                                         outlineScale = 1.02,
                                                         initialRotation = [0, 0, 0] as Vec3,
                                                         materialsById,
                                                         ...rest
                                                     }: AshTrayWoodProps) {
    const [S, H] = size
    const halfS = S / 2

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // base block (plain wood)
        const baseH = Math.max(0.001, H - topThickness)
        p.push({
            id: 'baseBlock',
            geometry: <boxGeometry args={[S, baseH, S]} />,
            position: [0, -H / 2 + baseH / 2, 0],
            color, outlineColor, roughness: 0.95, metalness: 0.02,
        })

        // top plate: outer square with two holes: bowl + single slot
        const shape = new THREE.Shape()
        shape.moveTo(-halfS, -halfS)
        shape.lineTo( halfS, -halfS)
        shape.lineTo( halfS,  halfS)
        shape.lineTo(-halfS,  halfS)
        shape.lineTo(-halfS, -halfS)

        // circular bowl
        const bowlHole = new THREE.Path()
        bowlHole.absellipse(0, 0, bowlRadius, bowlRadius, 0, Math.PI * 2, true)
        shape.holes.push(bowlHole)

        const extrudeOpts: THREE.ExtrudeGeometryOptions = {
            depth: topThickness,
            bevelEnabled: false,
            curveSegments: 48,
        }

        p.push({
            id: 'topPlate',
            geometry: <extrudeGeometry args={[shape, extrudeOpts]} />,
            position: [0, H / 2 - topThickness, 0],
            rotation: [-Math.PI / 2, 0, 0],
            color, outlineColor, roughness: 0.95, metalness: 0.02,
        })


        return p
    }, [
        S, H, color, outlineColor,
        bowlRadius, bowlDepth, topThickness,
        slotWidth, slotInsetFromEdge, slotLength
    ])

    const hitbox = { size: [S, H, S] as Vec3, center: [0, 0, 0] as Vec3 }

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

export default AshTrayWood
