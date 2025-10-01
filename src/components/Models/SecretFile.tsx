'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import { Vec3 } from '@/shaders/inspectTypes'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

export const SecretFile = memo(function SecretFile({
                                                       size = [0.23, 0.32, 0.018] as [number, number, number],
                                                       coverThick = 0.003,
                                                       pageThick  = 0.0009,
                                                       pageInset  = 0.010,
                                                       pageHingeGap = 0.0002,
                                                       frontOpen = 0.22,
                                                       backOpen  = 0.00,
                                                       color = '#c9c3b5',
                                                       outlineColor = '#fff',
                                                       hoverColor = '#ff3b30',
                                                       outlineScale = 1.035,
                                                       initialRotation = [0.08, 0.30, 0] as Vec3,
                                                       hitboxMode = 'auto' as 'auto' | 'none',
                                                       ...rest
                                                   }: Inherited & {
    size?: [number, number, number]
    coverThick?: number
    pageThick?: number
    pageInset?: number
    pageHingeGap?: number
    frontOpen?: number
    backOpen?: number
    hitboxMode?: 'auto' | 'none'
}) {
    const [w, h, t] = size
    const halfW = w / 2

    const hingeBox = (width: number, height: number, thick: number, insetX = 0) => (
        <boxGeometry
            args={[width, height, thick]}
            onUpdate={(g: any) => g.translate(width / 2 + insetX, 0, 0)}
        />
    )

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        const hingeX = -w / 2
        const eps = 0.00005

        const zBackCenter  = -t * 0.1 + coverThick * 0.5
        const zFrontCenter = +t * 0.1 - coverThick * 0.5

        // BACK COVER
        p.push({
            id: 'coverBack',
            geometry: hingeBox(w, h, coverThick, 0),
            position: [hingeX, 0, zBackCenter - eps] as Vec3,
            rotation: [0, backOpen, 0] as Vec3,
            color,
            outlineColor,
            roughness: 0.85,
            metalness: 0.0,
            boundingRadius: Math.hypot(w, h) * 0.5,
        })

        const innerW = Math.max(0.05, w - pageInset * 2)
        const innerH = Math.max(0.05, h - pageInset * 2)

        const hingeZ = 0

        const a = frontOpen * 0.5 // page angle
        const cosA = Math.cos(a)
        const sinA = Math.sin(a)

        const xAddBase = innerW * ( -cosA * cosA + 0.5 + 0.5 * cosA )
        const zAdd     = 0.5 * innerW * sinA

        const kMid = -0.044
        const xWithMid = xAddBase + kMid * Math.sin(2 * a)

        const qQuarter = 0.02
        const xAdd = xWithMid + qQuarter * Math.sin(4 * a)

        p.push({
            id: 'paper',
            geometry: hingeBox(innerW, innerH, pageThick, 0),
            position: [hingeX + pageInset + xAdd, 0, hingeZ + zAdd] as Vec3,
            rotation: [0, a, 0] as Vec3,
            color: '#ffffff',
            roughness: 0.95,
            metalness: 0.0,
        })

        const dx = 0.5 * w * (1 - Math.cos(frontOpen))
        const dz = 0.5 * w * Math.sin(frontOpen)
        p.push({
            id: 'coverFront',
            geometry: hingeBox(w, h, coverThick, 0),
            position: [hingeX + dx, 0, zFrontCenter + dz + eps] as Vec3,
            rotation: [0, frontOpen, 0] as Vec3,
            color,
            outlineColor,
            roughness: 0.85,
            metalness: 0.0,
            boundingRadius: Math.hypot(w, h) * 0.5,
        })

        return p
    }, [w, h, t, coverThick, pageThick, pageInset, pageHingeGap, frontOpen, backOpen, color, outlineColor])

    const hitbox =
        hitboxMode === 'auto'
            ? ({ size: [w, h, t] as Vec3, center: [0, 0, 0] as Vec3 })
            : undefined

    return (
        <ModelGroup
            parts={parts}
            {...(hitbox ? { hitbox } : {})}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            outlineScale={outlineScale}
            initialRotation={initialRotation}
            disableOutline={false}
            inspectDisableOutline={true}
            {...rest}
        />
    )
})
