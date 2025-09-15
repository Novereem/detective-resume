'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import { Vec3 } from '@/shaders/inspectTypes'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

export const MetalDrawer = memo(function MetalDrawer({
                                                         size = [0.40, 0.20, 0.50] as [number, number, number], // w,h,d (includes front)
                                                         frontThickness = 0.018,
                                                         boxThickness = 0.010,
                                                         handle = { width:0.16, depth:0.016, radius:0.01, offset:0.012 },
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
    handle?: { width?:number; depth?:number; radius?:number; offset?:number }
}) {
    const [w,h,d] = size
    const trayD = Math.max(0.05, d - frontThickness)

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // front
        p.push({ id:'drawerFront', geometry:<boxGeometry args={[w,h,frontThickness]} />,
            position:[0, h/2, frontThickness/2] as Vec3, color, outlineColor, roughness:.45, metalness:.25 })

        // inner tray
        const iw = Math.max(0.05, w - 2*boxThickness)
        const ih = Math.max(0.05, h - boxThickness)
        const sideH = ih
        const z0 = frontThickness + trayD/2

        p.push({ id:'drawerBox', geometry:<boxGeometry args={[iw, boxThickness, trayD]} />,
            position:[0, boxThickness/2, z0] as Vec3, color:'#a5a19a', outlineColor, roughness:.5, metalness:.2 })

        ;[-(w/2) + boxThickness/2, +(w/2) - boxThickness/2].forEach(x=>{
            p.push({ id:'drawerBox', geometry:<boxGeometry args={[boxThickness, sideH, trayD]} />,
                position:[x, boxThickness + sideH/2, z0] as Vec3, color:'#a5a19a', outlineColor, roughness:.5, metalness:.2 })
        })

        p.push({ id:'drawerBox', geometry:<boxGeometry args={[iw, sideH, boxThickness]} />,
            position:[0, boxThickness + sideH/2, frontThickness + trayD - boxThickness/2] as Vec3,
            color:'#a5a19a', outlineColor, roughness:.5, metalness:.2 })

        // handle
        const hw = handle.width!, hd = handle.depth!, hr = handle.radius!, hoff = handle.offset!
        const postX = hw/2 - hr
        ;[-postX, postX].forEach(x=>{
            p.push({ id:'handle', geometry:<cylinderGeometry args={[hr,hr,hd,16]} />,
                position:[x, h*0.55, frontThickness + hoff - hd/2] as Vec3,
                rotation:[Math.PI/2,0,0] as Vec3, color:'#c9cccf', outlineColor, roughness:.25, metalness:.8 })
        })
        p.push({ id:'handle', geometry:<cylinderGeometry args={[hr,hr,hw - 2*hr,16]} />,
            position:[0, h*0.55, frontThickness + hoff] as Vec3, rotation:[0,0,Math.PI/2] as Vec3,
            color:'#c9cccf', outlineColor, roughness:.25, metalness:.8 })

        return p
    }, [w,h,d,frontThickness,boxThickness,handle,color,outlineColor,trayD])

    return (
        <ModelGroup
            parts={parts}
            hitbox={{ size:[w,h,d] as Vec3, center:[0, h/2, d/2] as Vec3 }}
            color={color} outlineColor={outlineColor} hoverColor={hoverColor}
            outlineScale={outlineScale} initialRotation={initialRotation}
            {...rest}
        />
    )
})
