'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import { Vec3 } from '@/shaders/inspectTypes'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

export const MetalDrawer = memo(function MetalDrawer({
                                                         size = [0.40, 0.20, 0.50] as [number, number, number],
                                                         frontThickness = 0.018,
                                                         boxThickness = 0.010,
                                                         handle = { width: 0.16, depth: 0.016, radius: 0.01, offset: 0.012 },
                                                         facing = -1 as 1 | -1,
                                                         color = '#9a958f',
                                                         outlineColor = '#fff',
                                                         hoverColor = '#ff3b30',
                                                         outlineScale = 1.035,
                                                         initialRotation = [0.12, 0.6, 0] as Vec3,
                                                         ...rest
                                                     }: Inherited & {
    size?: [number, number, number]
    frontThickness?: number
    boxThickness?: number
    handle?: { width?: number; depth?: number; radius?: number; offset?: number }
    facing?: 1 | -1
}) {
    const [w, h, d] = size
    const trayD = Math.max(0.05, d - frontThickness)

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        const out = facing;
        const inn = -facing;

        const zPanel = facing * (frontThickness / 2)

        // Front panel
        p.push({
            id: 'drawerFront',
            geometry: <boxGeometry args={[w, h, frontThickness]} />,
            position: [0, h / 2, zPanel] as Vec3,
            color,
            outlineColor,
            roughness: 0.45,
            metalness: 0.25,
        })

        // Inner tray
        const iw = Math.max(0.05, w - 2 * boxThickness)
        const ih = Math.max(0.05, h - boxThickness)
        const sideH = ih
        const z0 = inn * (trayD / 2);

        // Bottom
        p.push({
            id: 'drawerBox',
            geometry: <boxGeometry args={[iw, boxThickness, trayD]} />,
            position: [0, boxThickness / 2, z0] as Vec3,
            color: '#a5a19a',
            outlineColor,
            roughness: 0.5,
            metalness: 0.2,
        })

        // Sides
        ;[
            -w / 2 + boxThickness / 2,
            +w / 2 - boxThickness / 2,
        ].forEach((x) => {
            p.push({
                id: 'drawerBox',
                geometry: <boxGeometry args={[boxThickness, sideH, trayD]} />,
                position: [x, boxThickness + sideH / 2, z0] as Vec3,
                color: '#a5a19a',
                outlineColor,
                roughness: 0.5,
                metalness: 0.2,
            })
        })

        // Back
        p.push({
            id: 'drawerBox',
            geometry: <boxGeometry args={[iw, sideH, boxThickness]} />,
            position: [0, boxThickness + sideH / 2, inn * (trayD - boxThickness / 2)] as Vec3,
            color: '#a5a19a',
            outlineColor,
            roughness: 0.5,
            metalness: 0.2,
        })
        const hw = handle.width ?? 0.16
        const hd = handle.depth ?? 0.016
        const hr = handle.radius ?? 0.01
        const hoff = handle.offset ?? (2 * boxThickness)

        // two posts
        const postX = hw / 2 - hr
        ;[-postX, postX].forEach((x) => {
            p.push({
                id: 'handle',
                geometry: <cylinderGeometry args={[hr, hr, hd, 16]} />,
                position: [x, h * 0.55, out * (frontThickness + hoff - hd / 2)] as Vec3,
                rotation: [Math.PI / 2, 0, 0] as Vec3,
                color: '#c9cccf',
                outlineColor,
                roughness: 0.25,
                metalness: 0.8,
            })
        })

        // bar
        p.push({
            id: 'handle',
            geometry: <cylinderGeometry args={[hr, hr, hw - 2 * hr, 16]} />,
            position: [0, h * 0.55, out * (frontThickness + hoff)] as Vec3,
            rotation: [0, 0, Math.PI / 2] as Vec3,
            color: '#c9cccf',
            outlineColor,
            roughness: 0.25,
            metalness: 0.8,
        })

        return p
    }, [w, h, d, frontThickness, boxThickness, facing, handle, color, outlineColor, trayD])

    // Hitbox follows facing
    const hitbox = {
        size: [w, h, d] as Vec3,
        center: [0, h / 2, facing * (d / 2)] as Vec3,
    }

    return (
        <ModelGroup
            parts={parts}
            hitbox={hitbox}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            outlineScale={outlineScale}
            initialRotation={initialRotation}
            {...rest}
        />
    )
})