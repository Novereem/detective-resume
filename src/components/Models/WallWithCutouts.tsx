'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

export type Hole = { size: [number, number]; center?: [number, number]; clearance?: number }
type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type WallWithCutoutsProps = Inherited & {
    size: [number, number]
    holes?: Hole[]
    textureRepeat?: [number, number]
    textureOffset?: [number, number]
    textureRotation?: number
    textureCenter?: [number, number]
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export function apertureFromWindow(params: { size: [number, number, number]; surroundBorder: number; clearance?: number }): Hole {
    const [w, h] = params.size
    const openW = Math.max(0.05, w - 2 * params.surroundBorder)
    const openH = Math.max(0.05, h - 2 * params.surroundBorder)
    return { size: [openW, openH], clearance: params.clearance ?? 0 }
}

export const WallWithCutouts = memo(function WallWithCutouts({
                                                                 size,
                                                                 holes = [],
                                                                 textureRepeat = [1, 1],
                                                                 textureOffset,
                                                                 textureRotation,
                                                                 textureCenter,
                                                                 color = '#777',
                                                                 outlineColor = '#ffffff',
                                                                 hoverColor = '#ff3b30',
                                                                 outlineScale = 1.02,
                                                                 initialRotation = [0, 0, 0] as Vec3,
                                                                 materialsById,
                                                                 ...rest
                                                             }: WallWithCutoutsProps) {
    const [W, H] = size

    const panelGeom = useMemo(() => {
        const s = new THREE.Shape()
        s.moveTo(-W / 2, -H / 2)
        s.lineTo( W / 2, -H / 2)
        s.lineTo( W / 2,  H / 2)
        s.lineTo(-W / 2,  H / 2)
        s.lineTo(-W / 2, -H / 2)

        for (const h of holes) {
            const w = Math.max(0, h.size[0] + (h.clearance ?? 0))
            const hh = Math.max(0, h.size[1] + (h.clearance ?? 0))
            const cx = h.center?.[0] ?? 0
            const cy = h.center?.[1] ?? 0
            const hole = new THREE.Path()
            hole.moveTo(cx - w / 2, cy - hh / 2)
            hole.lineTo(cx + w / 2, cy - hh / 2)
            hole.lineTo(cx + w / 2, cy + hh / 2)
            hole.lineTo(cx - w / 2, cy + hh / 2)
            hole.lineTo(cx - w / 2, cy - hh / 2)
            s.holes.push(hole)
        }

        const g = new THREE.ShapeGeometry(s)

        const pos = g.attributes.position as THREE.BufferAttribute
        const uv = new THREE.BufferAttribute(new Float32Array((pos.count) * 2), 2)
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i)
            const y = pos.getY(i)
            const u = (x + W / 2) / W
            const v = (y + H / 2) / H
            uv.setXY(i, u, v)
        }

        if (textureRepeat) {
            for (let i = 0; i < uv.count; i++) {
                uv.setX(i, uv.getX(i) * textureRepeat[0])
                uv.setY(i, uv.getY(i) * textureRepeat[1])
            }
        }
        if (textureOffset) {
            for (let i = 0; i < uv.count; i++) {
                uv.setX(i, uv.getX(i) + textureOffset[0])
                uv.setY(i, uv.getY(i) + textureOffset[1])
            }
        }
        if (typeof textureRotation === 'number' && textureRotation !== 0) {
            const cx = textureCenter?.[0] ?? 0.5 * (textureRepeat?.[0] ?? 1)
            const cy = textureCenter?.[1] ?? 0.5 * (textureRepeat?.[1] ?? 1)
            const c = Math.cos(textureRotation), s = Math.sin(textureRotation)
            for (let i = 0; i < uv.count; i++) {
                const u0 = uv.getX(i) - cx
                const v0 = uv.getY(i) - cy
                const u1 = u0 * c - v0 * s
                const v1 = u0 * s + v0 * c
                uv.setXY(i, u1 + cx, v1 + cy)
            }
        }

        g.setAttribute('uv', uv)
        g.computeBoundingSphere()
        return g
    }, [W, H, holes, textureRepeat, textureOffset, textureRotation, textureCenter])

    const parts = useMemo<PartSpec[]>(() => ([
        {
            id: 'panel',
            geometry: <primitive object={panelGeom} attach="geometry" />,
            position: [0, 0, 0],
            color,
            outlineColor,
            roughness: 1,
            metalness: 0,
            receiveShadow: true,
            castShadow: false,
        },
    ]), [panelGeom, color, outlineColor])

    const hitbox = { size: [W, H, 0.01] as Vec3, center: [0, 0, 0] as Vec3 }

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={materialsById}
            hitbox={hitbox}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            outlineScale={outlineScale}
            initialRotation={initialRotation}
            disableOutline
            inspectDisableOutline
        />
    )
})

export default WallWithCutouts
