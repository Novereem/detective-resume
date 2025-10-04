'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from "@/components/Types/room"

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

export const MetalDrawer = memo(function MetalDrawer({
                                                         size = [0.40, 0.20, 0.50] as [number, number, number],
                                                         frontThickness = 0.018,
                                                         boxThickness = 0.012,
                                                         handle = { width: 0.16, depth: 0.016, radius: 0.01, offset: 0.012 },
                                                         facing = +1,
                                                         hitboxMode = 'drawer',
                                                         color = '#9a958f',
                                                         outlineScale = 1.035,
                                                         initialRotation = [0.12, 0.6, 0] as Vec3,
                                                         children,
                                                         contentOffset,
                                                         ...rest
                                                     }: Inherited & {
    size?: [number, number, number]
    frontThickness?: number
    boxThickness?: number
    handle?: { width?: number; depth?: number; radius?: number; offset?: number }
    facing?: 1 | -1
    hitboxMode?: 'drawer' | 'handle' | 'none'
    children?: React.ReactNode
    contentOffset?: Vec3
}) {
    const [trayW, trayH, d] = size
    const trayD = Math.max(0.05, d - frontThickness)

    const trayFloorY = boxThickness
    const trayCenterZ = -facing * (trayD / 2)

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []
        const out = facing
        const inn = -facing
        const zPanel = out * (frontThickness / 2)

        p.push({ id:'drawerFront', geometry:<boxGeometry args={[trayW,trayH,frontThickness]} />, position:[0,trayH/2,zPanel] as Vec3, color, roughness:.45, metalness:.25 })

        const iw = Math.max(0.05, trayW - 2 * boxThickness)
        const ih = Math.max(0.05, trayH - boxThickness)
        const sideH = ih
        const z0 = inn * (trayD / 2)

        p.push({ id:'drawerBox', geometry:<boxGeometry args={[iw, boxThickness, trayD]} />, position:[0, boxThickness/2, z0] as Vec3, color:'#a5a19a', roughness:.5, metalness:.2 })
        ;[-trayW/2 + boxThickness/2, +trayW/2 - boxThickness/2].forEach((x)=>p.push({ id:'drawerBox', geometry:<boxGeometry args={[boxThickness, sideH, trayD]} />, position:[x, boxThickness + sideH/2, z0] as Vec3, color:'#a5a19a', roughness:.5, metalness:.2 }))
        p.push({ id:'drawerBox', geometry:<boxGeometry args={[iw, sideH, boxThickness]} />, position:[0, boxThickness + sideH/2, inn * (trayD - boxThickness/2)] as Vec3, color:'#a5a19a', roughness:.5, metalness:.2 })

        const hw = handle.width ?? 0.16
        const hd = handle.depth ?? 0.016
        const hr = handle.radius ?? 0.01
        const hoff = handle.offset ?? 2 * boxThickness
        const postX = hw / 2 - hr
        ;[-postX, postX].forEach((x)=>p.push({ id:'handle', geometry:<cylinderGeometry args={[hr,hr,hd,16]} />, position:[x, trayH*0.55, out*(frontThickness + hoff - hd/2)] as Vec3, rotation:[Math.PI/2,0,0] as Vec3, color:'#c9cccf', roughness:.25, metalness:.8 }))
        p.push({ id:'handle', geometry:<cylinderGeometry args={[hr,hr,hw - 2*hr,16]} />, position:[0, trayH*0.55, out*(frontThickness + hoff)] as Vec3, rotation:[0,0,Math.PI/2] as Vec3, color:'#c9cccf', roughness:.25, metalness:.8 })

        return p
    }, [trayW,trayH,d,frontThickness,boxThickness,facing,handle,color,trayD])

    const hw = handle.width ?? 0.16
    const hd = handle.depth ?? 0.016
    const hr = handle.radius ?? 0.01
    const hoff = handle.offset ?? 2 * boxThickness
    const out = facing

    const drawerCenterZ = out * (frontThickness - d / 2)
    const handleHitbox = { size: [hw + 0.01, Math.max(0.06, hr * 2), hd + 0.02] as Vec3, center: [0, trayH * 0.55, out * (frontThickness + hoff)] as Vec3 }
    const drawerHitbox = { size: [trayW, trayH, d] as Vec3, center: [0, trayH / 2, drawerCenterZ] as Vec3 }

    const bodyParts = parts.filter(p => p.id !== 'handle')
    const handleParts = parts.filter(p => p.id === 'handle')

    const {
        onPointerDown,
        visualizeHitbox,
        visualizeColor,
        materialsById,
        inspectDisableOutline,
        position,
        rotation,
        scale,
        ...restGroup
    } = rest as any

    const contentBase: Vec3 = [0, trayFloorY, trayCenterZ]
    const effContentOffset: Vec3 = contentOffset ?? [0, 0.008, -0.02]

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <ModelGroup
                parts={bodyParts}
                color={color}
                outlineScale={outlineScale}
                initialRotation={initialRotation}
                disableOutline
                disablePointer={hitboxMode !== 'none'}
                {...(hitboxMode === 'drawer' ? {hitbox: drawerHitbox} : {})}
                materialsById={materialsById}
                inspectDisableOutline={inspectDisableOutline}
                {...restGroup}
            />
            <ModelGroup
                parts={handleParts}
                color={color}
                outlineScale={outlineScale}
                initialRotation={initialRotation}
                {...(hitboxMode === 'handle' ? {hitbox: handleHitbox} : {})}
                {...(hitboxMode === 'handle' ? {onPointerDown} : {})}
                {...(visualizeHitbox ? {visualizeHitbox, visualizeColor} : {})}
                materialsById={materialsById}
                inspectDisableOutline={inspectDisableOutline}
                disableOutline={hitboxMode !== 'handle'}
                disablePointer={hitboxMode !== 'handle'}
            />

            <group position={contentBase as Vec3}>
                <group position={effContentOffset as Vec3}>
                    {children}
                </group>
            </group>
        </group>
    )
})
