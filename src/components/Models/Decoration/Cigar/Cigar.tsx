'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

export type CigarProps = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'> & {
    size?: [r: number, L: number]
    taper?: number
    bandWidth?: number
    bandOffsetFromHead?: number
    bandLift?: number
    lit?: boolean
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Cigar = memo(function Cigar({
                                             size = [0.0105, 0.145],
                                             taper = 0.06,
                                             bandWidth = 0.018,
                                             bandOffsetFromHead = 0.035,
                                             bandLift = 0.0006,
                                             lit = false,
                                             color = '#8a5a3a',
                                             outlineColor = '#ffffff',
                                             hoverColor = '#ff3b30',
                                             outlineScale = 1.02,
                                             initialRotation = [0, 0, 0] as Vec3,
                                             materialsById,
                                             ...rest
                                         }: CigarProps) {
    const [R, L] = size
    const Rt = Math.max(0.001, R * (1 - taper))
    const Rb = R
    const eps = 0.00025

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // body
        p.push({
            id: 'body',
            geometry: <cylinderGeometry args={[Rt, Rb, L, 48, 1, true]} />,
            position: [0, 0, 0],
            color, outlineColor, roughness: 0.9, metalness: 0.02,
        })

        // head
        p.push({
            id: 'headCap',
            geometry: <sphereGeometry args={[Rt, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />,
            position: [0, +L / 2 - eps, 0],
            color, outlineColor, roughness: 0.88, metalness: 0.02,
        })

        if (lit) {
            // foot
            p.push({
                id: 'footFlat',
                geometry: <circleGeometry args={[Rb+0.0002, 48]} />,
                position: [0, -L / 2 - eps+0.0004, 0],
                rotation: [-Math.PI / 2, Math.PI, 0],
                color: '#ffffff', outlineColor, roughness: 1.0, metalness: 0.0,
            })
        } else {
            // foot
            p.push({
                id: 'footCap',
                geometry: <sphereGeometry args={[Rb, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />,
                position: [0, -L / 2 + eps, 0],
                color, outlineColor, roughness: 0.9, metalness: 0.02,
            })
        }

        if (bandWidth > 0) {
            const bandY = L / 2 - bandOffsetFromHead - bandWidth / 2
            const bandR = Math.max(Rt, Rb) + bandLift
            p.push({
                id: 'band',
                geometry: <cylinderGeometry args={[bandR, bandR, bandWidth, 64, 1, true]} />,
                position: [0, bandY, 0],
                color: '#d9c7a2', outlineColor, roughness: 0.6, metalness: 0.15,
            })
        }

        return p
    }, [R, L, Rt, Rb, bandWidth, bandOffsetFromHead, bandLift, lit, color, outlineColor])

    const hitbox = { size: [R * 2, L, R * 2] as Vec3, center: [0, 0, 0] as Vec3 }

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

export default Cigar
