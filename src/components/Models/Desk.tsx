import React, { memo, useMemo } from 'react'
import { ThreeElements } from '@react-three/fiber'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import { InspectState, Vec3 } from '@/shaders/inspectTypes'

type OnInspect = (s: InspectState) => void

type DeskProps = ThreeElements['group'] & {
    topSize?: [number, number, number]
    legRadius?: number
    legHeight?: number
    color?: string
    outlineColor?: string
    hoverColor?: string
    outlineScale?: number
    outlinePerPart?: {
        worldThickness?: number
        topScale?: number
        legScale?: number
    }
    onInspect?: OnInspect
    inspectPixelSize?: number
}

export const Desk = memo(function Desk({
                                           topSize = [1.2, 0.05, 0.6],
                                           legRadius = 0.03,
                                           legHeight = 0.72,
                                           color = '#222',
                                           outlineColor = '#fff',
                                           hoverColor = '#ff3b30',
                                           outlineScale = 1.04,
                                           outlinePerPart,
                                           onInspect,
                                           inspectPixelSize,
                                           ...props
                                       }: DeskProps) {
    const [w, h, d] = topSize
    const legX = w / 2 - legRadius * 2
    const legZ = d / 2 - legRadius * 2

    const hitboxSize: Vec3 = [w + 0.06, legHeight + h + 0.06, d + 0.06]
    const hitboxCenter: Vec3 = [0, (legHeight + h) / 2, 0]

    // radii for world-thickness → scale conversion (same logic you used before)
    const rTop = Math.hypot(w/2, h/2, d/2)
    const rLeg = Math.hypot(legRadius, legHeight/2)
    const t = outlinePerPart?.worldThickness

    const topScale = outlinePerPart?.topScale ?? (t ? 1 + t / rTop : outlineScale)
    const legScale = outlinePerPart?.legScale ?? (t ? 1 + t / rLeg : outlineScale)

    const parts = useMemo<PartSpec[]>(() => ([
        {
            geometry: <boxGeometry args={[w, h, d]} />,
            color,
            outlineColor,
            outlineScale: topScale,
            position: [0, legHeight + h / 2, 0],
        },
        ...[
            [-legX,  legZ],
            [ legX,  legZ],
            [-legX, -legZ],
            [ legX, -legZ],
        ].map(([x, z]) => ({
            geometry: <cylinderGeometry args={[legRadius, legRadius, legHeight, 12]} />,
            color,
            outlineColor,
            outlineScale: legScale,
            position: [x, legHeight / 2, z] as Vec3,
        })),
    ]), [w,h,d,color,outlineColor,topScale,legScale,legRadius,legHeight,legX,legZ])

    return (
        <ModelGroup
            {...props}
            parts={parts}
            hitbox={{ size: hitboxSize, center: hitboxCenter }}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            onInspect={onInspect}
            inspectPixelSize={inspectPixelSize}
            initialRotation={[0.2, 0.6, 0]}
        />
    )
})