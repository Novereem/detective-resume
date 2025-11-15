'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type WoodBlindsProps = Inherited & {
    size?: [width: number, height: number, depth: number]
    headH?: number
    bottomH?: number
    slatT?: number
    slatD?: number
    gap?: number
    tiltDeg?: number
    ladderCount?: number
    ladderW?: number
    ladderT?: number
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const WoodBlinds = memo(function WoodBlinds({
                                                       size = [0.8, 1.1, 0.045],
                                                       headH = 0.06,
                                                       bottomH = 0.03,
                                                       slatT = 0.0032,
                                                       slatD = 0.032,
                                                       gap = 0.028,
                                                       tiltDeg = 12,
                                                       ladderCount = 2,
                                                       ladderW = 0.018,
                                                       ladderT = 0.002,
                                                       color = '#ffffff',
                                                       outlineColor = '#ffffff',
                                                       hoverColor = '#ff3b30',
                                                       outlineScale = 1.03,
                                                       initialRotation = [0, 0, 0] as Vec3,
                                                       materialsById,
                                                       ...rest
                                                   }: WoodBlindsProps) {
    const [W, H, D] = size
    const openRad = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(tiltDeg, -85, 85))
    const innerH = Math.max(0.04, H - headH - bottomH)
    const pitch = Math.max(slatT + gap, slatT * 1.3)
    const slatCount = Math.max(1, Math.floor(innerH / pitch))
    const yStart = H / 2 - headH - slatT / 2

    const ladderXs = useMemo(() => {
        const xs: number[] = []
        const margin = Math.max(0.04, W * 0.08)
        if (ladderCount <= 1) return [0]
        for (let i = 0; i < ladderCount; i++) {
            const t = i / (ladderCount - 1)
            xs.push(-W / 2 + margin + t * (W - margin * 2))
        }
        return xs
    }, [W, ladderCount])

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        p.push({
            id: 'head',
            geometry: <boxGeometry args={[W, headH, D]} />,
            position: [0, H / 2 - headH / 2, 0],
            color, outlineColor, roughness: 0.9, metalness: 0.02, boundingRadius: Math.max(W, D) * 0.6,
            receiveShadow: true, castShadow: true,
        })

        p.push({
            id: 'bottom',
            geometry: <boxGeometry args={[W, bottomH, D * 0.8]} />,
            position: [0, -H / 2 + bottomH / 2, 0],
            color, outlineColor, roughness: 0.9, metalness: 0.02, boundingRadius: Math.max(W, D) * 0.6,
            receiveShadow: true, castShadow: true,
        })

        for (let i = 0; i < slatCount; i++) {
            const y = yStart - i * pitch
            p.push({
                id: 'slat',
                geometry: <boxGeometry args={[W, slatT, slatD]} />,
                position: [0, y, 0],
                rotation: [openRad, 0, 0],
                color, outlineColor, roughness: 0.95, metalness: 0.02, boundingRadius: Math.max(W, slatD) * 0.55,
                receiveShadow: true, castShadow: true,
            })
        }

        const ladderH = innerH
        const ladderY = (bottomH - headH) / 2
        ladderXs.forEach((x, i) => {
            p.push({
                id: 'tape',
                geometry: <boxGeometry args={[ladderW, ladderH, ladderT]} />,
                position: [x, ladderY, (slatD / 2) + ladderT / 2],
                color, outlineColor, roughness: 0.8, metalness: 0.0, boundingRadius: Math.max(ladderW, ladderH) * 0.5,
                receiveShadow: false, castShadow: false,
            })
        })

        return p
    }, [W, H, D, headH, bottomH, slatT, slatD, pitch, slatCount, yStart, openRad, ladderXs, ladderW, ladderT, innerH, color, outlineColor])

    const hitbox: { size: Vec3; center: Vec3 } = { size: [W, H, Math.max(D, slatD)] as Vec3, center: [0, 0, 0] }

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
            disableOutline
            inspectDisableOutline
        />
    )
})
export default WoodBlinds
