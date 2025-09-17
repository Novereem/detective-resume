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
                                                         hitboxMode = 'drawer' as 'drawer' | 'handle' | 'none',
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
    hitboxMode?: 'drawer' | 'handle' | 'none'
}) {
    const [w, h, d] = size
    const trayD = Math.max(0.05, d - frontThickness)

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []
        const out = facing
        const inn = -facing
        const zPanel = out * (frontThickness / 2)

        p.push({ id:'drawerFront', geometry:<boxGeometry args={[w,h,frontThickness]} />, position:[0,h/2,zPanel] as Vec3, color, outlineColor, roughness:.45, metalness:.25 })

        const iw = Math.max(0.05, w - 2 * boxThickness)
        const ih = Math.max(0.05, h - boxThickness)
        const sideH = ih
        const z0 = inn * (trayD / 2)

        p.push({ id:'drawerBox', geometry:<boxGeometry args={[iw, boxThickness, trayD]} />, position:[0, boxThickness/2, z0] as Vec3, color:'#a5a19a', outlineColor, roughness:.5, metalness:.2 })
        ;[-w/2 + boxThickness/2, +w/2 - boxThickness/2].forEach((x)=>p.push({ id:'drawerBox', geometry:<boxGeometry args={[boxThickness, sideH, trayD]} />, position:[x, boxThickness + sideH/2, z0] as Vec3, color:'#a5a19a', outlineColor, roughness:.5, metalness:.2 }))
        p.push({ id:'drawerBox', geometry:<boxGeometry args={[iw, sideH, boxThickness]} />, position:[0, boxThickness + sideH/2, inn * (trayD - boxThickness/2)] as Vec3, color:'#a5a19a', outlineColor, roughness:.5, metalness:.2 })

        const hw = handle.width ?? 0.16
        const hd = handle.depth ?? 0.016
        const hr = handle.radius ?? 0.01
        const hoff = handle.offset ?? 2 * boxThickness
        const postX = hw / 2 - hr
        ;[-postX, postX].forEach((x)=>p.push({ id:'handle', geometry:<cylinderGeometry args={[hr,hr,hd,16]} />, position:[x, h*0.55, out*(frontThickness + hoff - hd/2)] as Vec3, rotation:[Math.PI/2,0,0] as Vec3, color:'#c9cccf', outlineColor, roughness:.25, metalness:.8 }))
        p.push({ id:'handle', geometry:<cylinderGeometry args={[hr,hr,hw - 2*hr,16]} />, position:[0, h*0.55, out*(frontThickness + hoff)] as Vec3, rotation:[0,0,Math.PI/2] as Vec3, color:'#c9cccf', outlineColor, roughness:.25, metalness:.8 })

        return p
    }, [w,h,d,frontThickness,boxThickness,facing,handle,color,outlineColor,trayD])

    const hw = handle.width ?? 0.16
    const hd = handle.depth ?? 0.016
    const hr = handle.radius ?? 0.01
    const hoff = handle.offset ?? 2 * boxThickness
    const out = facing

    const drawerCenterZ = out * (frontThickness - d / 2)
    const handleHitbox = { size: [hw + 0.01, Math.max(0.06, hr * 2), hd + 0.02] as Vec3, center: [0, h * 0.55, out * (frontThickness + hoff)] as Vec3 }
    const drawerHitbox = { size: [w, h, d] as Vec3, center: [0, h / 2, drawerCenterZ] as Vec3 }

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

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <ModelGroup
                parts={bodyParts}
                color={color}
                outlineColor={outlineColor}
                hoverColor={hoverColor}
                outlineScale={outlineScale}
                initialRotation={initialRotation}
                disableOutline
                disablePointer={hitboxMode !== 'none'}
                {...(hitboxMode === 'drawer' ? { hitbox: drawerHitbox } : {})}
                materialsById={materialsById}
                inspectDisableOutline={inspectDisableOutline}
                {...restGroup}
            />
            <ModelGroup
                parts={handleParts}
                color={color}
                outlineColor={outlineColor}
                hoverColor={hoverColor}
                outlineScale={outlineScale}
                initialRotation={initialRotation}
                {...(hitboxMode === 'handle' ? { hitbox: handleHitbox } : {})}
                {...(hitboxMode === 'handle' ? { onPointerDown } : {})}
                {...(visualizeHitbox ? { visualizeHitbox, visualizeColor } : {})}
                materialsById={materialsById}
                inspectDisableOutline={inspectDisableOutline}
                disableOutline={hitboxMode !== 'handle'}
                disablePointer={hitboxMode !== 'handle'}
            />
        </group>
    )
})
