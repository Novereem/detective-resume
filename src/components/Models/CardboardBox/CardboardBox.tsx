'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'
import {CardboardLid} from "@/components/Models/CardboardBox/CardboardLid";

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type CardboardBoxProps = Inherited & {
    /** X = width, Y = height, Z = depth (outer dimensions) */
    size?: [number, number, number]
    /** Wall thickness of the box shell */
    wallT?: number
    /** If true, render a lid sitting on the box (use CardboardLid.tsx separately to place elsewhere) */
    lidEnabled?: boolean
    /** Lid side height that overlaps the box */
    lidLip?: number
    /** Lid wall/plate thickness */
    lidWallT?: number
    /** Small extra around the box so the lid fits */
    lidClearance?: number
    /** Optional overrides forwarded to the lid instance rendered on top */
    lidMaterialsById?: React.ComponentProps<typeof ModelGroup>['materialsById']
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const CardboardBox = memo(function CardboardBox({
                                                           size = [0.28, 0.14, 0.28],
                                                           wallT = 0.004,
                                                           lidEnabled = false,
                                                           lidLip = 0.028,
                                                           lidWallT = 0.003,
                                                           lidClearance = 0.002,
                                                           color = '#caa874',
                                                           outlineColor = '#ffffff',
                                                           hoverColor = '#ff3b30',
                                                           outlineScale = 1.02,
                                                           initialRotation = [0, 0, 0] as Vec3,
                                                           materialsById,
                                                           lidMaterialsById,
                                                           ...rest
                                                       }: CardboardBoxProps) {
    const [W, H, D] = size
    const sideH = Math.max(0.01, H - wallT)

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // bottom
        p.push({
            id: 'bottom',
            geometry: <boxGeometry args={[W, wallT, D]} />,
            position: [0, -H / 2 + wallT / 2, 0],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        // +Z wall (back)
        p.push({
            id: 'wall',
            geometry: <boxGeometry args={[W, sideH, wallT]} />,
            position: [0, wallT / 2, D / 2 - wallT / 2],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        // -Z wall (front)
        p.push({
            id: 'wall',
            geometry: <boxGeometry args={[W, sideH, wallT]} />,
            position: [0, wallT / 2, -D / 2 + wallT / 2],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        // +X wall (right)
        p.push({
            id: 'wall',
            geometry: <boxGeometry args={[wallT, sideH, D]} />,
            position: [W / 2 - wallT / 2, wallT / 2, 0],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        // -X wall (left)
        p.push({
            id: 'wall',
            geometry: <boxGeometry args={[wallT, sideH, D]} />,
            position: [-W / 2 + wallT / 2, wallT / 2, 0],
            color, outlineColor, roughness: 0.95, metalness: 0.0,
        })

        return p
    }, [W, H, D, wallT, sideH, color, outlineColor])

    const hitbox: Vec3 = [W, H, D]

    const {
        position, rotation, scale, ...groupRest
    } = rest as any

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <ModelGroup
                {...groupRest}
                parts={parts}
                materialsById={materialsById}
                hitbox={{ size: hitbox, center: [0, 0, 0] }}
                color={color}
                outlineColor={outlineColor}
                hoverColor={hoverColor}
                initialRotation={initialRotation}
                outlineScale={outlineScale}
            />

            {lidEnabled && (
                <CardboardLid
                    position={[0, H / 2, 0]}
                    rotation={[0, 0, 0]}
                    size={[W, D]}
                    wallT={lidWallT}
                    sideH={lidLip}
                    clearance={lidClearance}
                    materialsById={lidMaterialsById ?? materialsById}
                    disableOutline={rest.disableOutline}
                    inspectDisableOutline={rest.inspectDisableOutline}
                />
            )}
        </group>
    )
})