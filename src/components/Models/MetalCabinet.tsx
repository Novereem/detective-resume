'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import { Vec3 } from '@/shaders/inspectTypes'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

export const MetalCabinet = memo(function MetalCabinet({
                                                           size = [0.44, 0.70, 0.60] as [number, number, number], // w,h,d
                                                           wall = 0.018,
                                                           back = 0.012,
                                                           baseLift = 0.02,
                                                           color = '#9a958f',
                                                           outlineColor = '#fff',
                                                           hoverColor = '#ff3b30',
                                                           outlineScale = 1.035,
                                                           initialRotation = [0.1, 0.6, 0] as Vec3,
                                                           ...rest
                                                       }: Inherited & {
    size?: [number, number, number]
    wall?: number
    back?: number
    baseLift?: number
}) {
    const [w, h, d] = size
    const innerW = Math.max(0.1, w - 2 * wall)
    const innerH = Math.max(0.1, h - 2 * wall)
    const innerD = Math.max(0.1, d - back)

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

            // side panels
        ;[-(w/2) + wall/2, +(w/2) - wall/2].forEach(x => {
            p.push({ id:'panel', geometry:<boxGeometry args={[wall, h, d]} />,
                position:[x, h/2, 0] as Vec3, color, outlineColor, roughness:.5, metalness:.2 })
        })

        // top/bottom
        ;[{y:h - wall/2},{y:wall/2}].forEach(({y})=>{
            p.push({ id:'panel', geometry:<boxGeometry args={[innerW, wall, d]} />,
                position:[0, y, 0] as Vec3, color, outlineColor, roughness:.5, metalness:.2 })
        })

        // back
        p.push({ id:'panel', geometry:<boxGeometry args={[innerW, innerH, back]} />,
            position:[0, wall + innerH/2, -d/2 + back/2] as Vec3, color, outlineColor, roughness:.5, metalness:.2 })

        // small base (kick)
        p.push({ id:'kick', geometry:<boxGeometry args={[innerW, baseLift, innerD]} />,
            position:[0, baseLift/2, 0] as Vec3, color:'#8e8a83', outlineColor, roughness:.35, metalness:.35 })

        return p
    }, [w,h,d,wall,back,baseLift,color,outlineColor,innerW,innerH,innerD])

    return (
        <ModelGroup
            parts={parts}
            hitbox={{ size:[w,h,d] as Vec3, center:[0,h/2,0] as Vec3 }}
            color={color} outlineColor={outlineColor} hoverColor={hoverColor}
            outlineScale={outlineScale} initialRotation={initialRotation}
            {...rest}
        />
    )
})
