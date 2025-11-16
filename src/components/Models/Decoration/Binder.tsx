'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'
import { useQuality } from '@/components/Settings/QualityContext'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type BinderProps = Inherited & {
    /** X = width (spine → fore-edge), Y = thickness, Z = height */
    size?: [number, number, number]
    sizeMultiplier?: number
    spineThickness?: number
    coverThickness?: number
    pageInset?: number
    /** 0 = empty, 1 = completely filled (uses inner thickness) */
    paperFill?: number
    /** Radius of the ring loops */
    ringRadius?: number
    /** Thickness of the metal tube of the rings */
    ringTubeRadius?: number
    /** Number of rings along the spine */
    ringCount?: number
    /** Fraction of the inner height used for distributing rings (0–1) */
    ringSpanRatio?: number
    /** Offset of ring rail from spine (0–1, relative to inner width) */
    ringOffsetRatio?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Binder = memo(function Binder({
                                               size = [0.24, 0.055, 0.32],
                                               sizeMultiplier = 1,
                                               spineThickness = 0.012,
                                               coverThickness = 0.0035,
                                               pageInset = 0.003,
                                               paperFill = 0.7,
                                               ringRadius = 0.01,
                                               ringTubeRadius = 0.0014,
                                               ringCount = 4,
                                               ringSpanRatio = 0.75,
                                               ringOffsetRatio = 0.18,
                                               color = '#ffffff',
                                               outlineColor = '#ffffff',
                                               hoverColor = '#ff3b30',
                                               outlineScale = 1.035,
                                               initialRotation = [0, 0, 0] as Vec3,
                                               materialsById,
                                               ...rest
                                           }: BinderProps) {
    const quality = useQuality()

    if (quality === 'medium') {
        paperFill = Math.min(paperFill, 0.5)
        ringCount = Math.max(1, Math.round(ringCount / 2))
    } else if (quality === 'low') {
        paperFill = Math.min(paperFill, 0.3)
        ringCount = 0
    }

    const [W, T, H] = size
    const WScaled = W * sizeMultiplier
    const TScaled = T * sizeMultiplier
    const HScaled = H * sizeMultiplier

    const clampedSpine = THREE.MathUtils.clamp(spineThickness, 0.006, Math.max(0.01, WScaled * 0.4))
    const clampedCover = THREE.MathUtils.clamp(coverThickness, 0.0015, Math.max(0.0015, TScaled * 0.5))

    const innerW = Math.max(0.02, WScaled - clampedSpine - pageInset * 2)
    const innerT = Math.max(0.002, TScaled - clampedCover * 2)
    const innerH = Math.max(0.02, HScaled - pageInset * 4)

    const safePaperFill = THREE.MathUtils.clamp(paperFill, 0, 1)
    const paperT = innerT * safePaperFill

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        const boundR = Math.max(WScaled, HScaled) * 0.5

        // Back cover
        p.push({
            id: 'coverBack',
            geometry: <boxGeometry args={[WScaled, clampedCover, HScaled]} />,
            position: [0, -TScaled / 2 + clampedCover / 2 + 0.00007 / paperT, 0],
            rotation: [0, 0, 0.0005 / paperT],
            color,
            outlineColor,
            boundingRadius: boundR,
            roughness: 0.9,
            metalness: 0.0,
            castShadow: quality !== 'low',
            receiveShadow: true,
        })

        // Front cover
        p.push({
            id: 'coverFront',
            geometry: <boxGeometry args={[WScaled, clampedCover, HScaled]} />,
            position: [0, TScaled / 2 - clampedCover / 2 - 0.00007 / paperT, 0],
            rotation: [0, 0, -0.0005 / paperT],
            color,
            outlineColor,
            boundingRadius: boundR,
            roughness: 0.9,
            metalness: 0.0,
            castShadow: quality !== 'low',
            receiveShadow: true,
        })

        // Spine block
        p.push({
            id: 'spine',
            geometry: <boxGeometry args={[clampedSpine, TScaled - 0.005, HScaled]} />,
            position: [-WScaled / 2 + clampedSpine / 2, 0, 0],
            color,
            outlineColor,
            boundingRadius: boundR,
            roughness: 0.9,
            metalness: 0.0,
            castShadow: quality !== 'low',
            receiveShadow: true,
        })

        // Paper stack
        if (paperT > 0.0005) {
            p.push({
                id: 'paper',
                geometry: <boxGeometry args={[innerW * 0.94, paperT, innerH * 0.96]} />,
                position: [
                    -WScaled / 2 + clampedSpine + innerW / 2 - 0.01,
                    0,
                    0,
                ],
                color,
                outlineColor,
                boundingRadius: Math.max(innerW, innerH) * 0.5,
                roughness: 0.96,
                metalness: 0.0,
                castShadow: quality === 'high',
                receiveShadow: true,
            })
        }

        // Spine label
        const labelThickness = clampedSpine * 0.06
        const labelHeight = HScaled * 0.22
        const labelWidth = Math.min(TScaled * 0.55, innerT * 0.9)

        p.push({
            id: 'spineLabel',
            geometry: <boxGeometry args={[labelThickness, labelWidth, labelHeight]} />,
            position: [
                -WScaled / 2 + clampedSpine - labelThickness / 2 - 0.0121,
                0,
                0,
            ],
            color,
            outlineColor,
            boundingRadius: labelHeight * 0.6,
            roughness: 0.96,
            metalness: 0.0,
            castShadow: quality === 'high',
            receiveShadow: true,
        })

        if (quality !== 'low')
        {
            // Spine pull ring
            const spineRingRadius = Math.min(clampedSpine, TScaled) * 0.8
            const spineRingTubeRadius = spineRingRadius * 0.05

            p.push({
                id: 'spineRing',
                geometry: <torusGeometry args={[spineRingRadius, spineRingTubeRadius, 12, 32]} />,
                position: [
                    -WScaled / 2 + clampedSpine - spineRingTubeRadius * 0.4 - 0.015,
                    0,
                    -HScaled * 0.28,
                ],
                rotation: [0, Math.PI / 2, 0],
                color,
                outlineColor,
                boundingRadius: spineRingRadius + spineRingTubeRadius,
                roughness: 0.35,
                metalness: 0.9,
                castShadow: quality === 'high',
            })
        }

        // Inner ring rail
        const railT = Math.max(innerT * 0.18, ringTubeRadius * 4)
        const railX = -WScaled / 2 + clampedSpine + innerW * ringOffsetRatio
        const railY = 0

        const rings = Math.max(0, Math.floor(ringCount))
        const usableSpan = innerH * ringSpanRatio
        const firstZ = -usableSpan / 2
        const stepZ = rings > 1 ? usableSpan / (rings - 1) : 0

        if (rings > 0) {
            for (let i = 0; i < rings; i++) {
                const z = firstZ + stepZ * i

                p.push({
                    id: 'ring',
                    geometry: (
                        <torusGeometry
                            args={[ringRadius, ringTubeRadius, 12, 24, Math.PI]}
                        />
                    ),
                    position: [railX - 0.04, railY + railT * 0.45 - 0.003, z],
                    rotation: [0, 0, Math.PI + Math.PI / 2],
                    color,
                    outlineColor,
                    boundingRadius: ringRadius + ringTubeRadius,
                    roughness: 0.3,
                    metalness: 1.0,
                    castShadow: quality === 'high',
                    receiveShadow: quality !== 'low',
                })
            }
        }

        return p
    }, [
        WScaled,
        TScaled,
        HScaled,
        clampedSpine,
        clampedCover,
        innerW,
        innerT,
        innerH,
        paperT,
        ringTubeRadius,
        ringRadius,
        ringCount,
        ringSpanRatio,
        ringOffsetRatio,
        color,
        outlineColor,
        quality,
    ])

    const hitboxSize: Vec3 = [WScaled, TScaled, HScaled]
    const hitboxCenter: Vec3 = [0, 0, 0]

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={materialsById}
            hitbox={{ size: hitboxSize, center: hitboxCenter }}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            initialRotation={initialRotation}
            outlineScale={outlineScale}
        />
    )
})
