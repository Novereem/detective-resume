'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import { Vec3 } from '@/shaders/inspectTypes'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

export const MetalDeskTop = memo(function MetalDeskTop({
                                                           size = [1.60, 0.04, 0.70] as [number, number, number], // w,t,d
                                                           rim = { height: 0.022, thickness: 0.01, inset: 0 },
                                                           color = '#e9e9e9', // laminate look
                                                           outlineColor = '#fff',
                                                           hoverColor = '#ff3b30',
                                                           outlineScale = 1.035,
                                                           initialRotation = [0.08, 0.6, 0] as Vec3,
                                                           ...rest
                                                       }: Inherited & {
    size?: [number, number, number]
    rim?: { height?:number; thickness?:number; inset?:number }
}) {
    const [w, t, d] = size
    const rh = rim.height ?? 0.022
    const rt = rim.thickness ?? 0.01
    const ri = rim.inset ?? 0

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        p.push({ id:'surface', geometry:<boxGeometry args={[w, t, d]} />,
            position:[0, t/2 + rh + ri, 0] as Vec3, color, outlineColor, roughness:.9, metalness:.02 })

        ;[{z:d/2 - rt/2},{z:-d/2 + rt/2}].forEach(({z})=>{
            p.push({ id:'rim', geometry:<boxGeometry args={[w, rh, rt]} />,
                position:[0, rh/2, z] as Vec3, color:'#b9bcc0', outlineColor, roughness:.25, metalness:.85 })
        })
        ;[{x:w/2 - rt/2},{x:-w/2 + rt/2}].forEach(({x})=>{
            p.push({ id:'rim', geometry:<boxGeometry args={[rt, rh, d]} />,
                position:[x, rh/2, 0] as Vec3, color:'#b9bcc0', outlineColor, roughness:.25, metalness:.85 })
        })

        return p
    }, [w,t,d,rh,rt,ri,color,outlineColor])

    return (
        <ModelGroup
            parts={parts}
            hitbox={{ size:[w+0.02, t+rh+0.02, d+0.02] as Vec3, center:[0,(t+rh+ri)/2,0] as Vec3 }}
            color={color} outlineColor={outlineColor} hoverColor={hoverColor}
            outlineScale={outlineScale} initialRotation={initialRotation}
            {...rest}
        />
    )
})
