import React, { memo, useMemo, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { ThreeElements } from '@react-three/fiber'
import { Outlined } from '@/shaders/OutlinedMesh'

type OnInspect = (s: unknown) => void

type DeskProps = ThreeElements['group'] & {
    topSize?: [number, number, number]
    legRadius?: number
    legHeight?: number
    color?: string
    outlineColor?: string
    hoverColor?: string
    outlineScale?: number
    onInspect?: OnInspect

    outlinePerPart?: {
        worldThickness?: number
        topScale?: number
        legScale?: number
    }
}

export const Desk = memo(function Desk({
                                           topSize = [1.2, 0.05, 0.6],
                                           legRadius = 0.03,
                                           legHeight = 0.72,
                                           color = '#222',
                                           outlineColor = '#fff',
                                           hoverColor = '#ff3b30',
                                           outlineScale = 1.04,
                                           onInspect,
                                           outlinePerPart,
                                           ...props
                                       }: DeskProps) {
    const root = useRef<THREE.Group>(null)
    const [hovered, setHovered] = useState(false)

    const [w, h, d] = topSize
    const legX = w / 2 - legRadius * 2
    const legZ = d / 2 - legRadius * 2

    const legPositions: [number, number][] = useMemo(
        () => [
            [-legX,  legZ],
            [ legX,  legZ],
            [-legX, -legZ],
            [ legX, -legZ],
        ],
        [legX, legZ]
    )

    // --- per-part outline thickness ---
    const { topScale, legScale } = useMemo(() => {
        if (outlinePerPart?.topScale || outlinePerPart?.legScale) {
            return {
                topScale: outlinePerPart?.topScale ?? outlineScale,
                legScale: outlinePerPart?.legScale ?? outlineScale,
            }
        }
        const t = outlinePerPart?.worldThickness ?? 0.006 // ~6 mm default
        // bounding-sphere radii
        const rTop = Math.hypot(w/2, h/2, d/2)
        const rLeg = Math.hypot(legRadius, legHeight/2)
        return {
            topScale: 1 + t / rTop,
            legScale: 1 + t / rLeg,
        }
    }, [
        outlinePerPart?.topScale,
        outlinePerPart?.legScale,
        outlinePerPart?.worldThickness,
        outlineScale,
        w, h, d, legRadius, legHeight,
    ])

    const handleInspect = useCallback(
        (e: any) => {
            e.stopPropagation()
            onInspect?.({
                kind: 'outlinedGroup',
                initialRotation: [0.2, 0.6, 0],
                parts: [
                    {
                        geometry: <boxGeometry args={[w, h, d]} />,
                        color,
                        outlineColor,
                        outlineScale: topScale,
                        position: [0, legHeight + h / 2, 0],
                    },
                    ...legPositions.map(([x, z]) => ({
                        geometry: <cylinderGeometry args={[legRadius, legRadius, legHeight, 12]} />,
                        color,
                        outlineColor,
                        outlineScale: legScale,
                        position: [x, legHeight / 2, z],
                    })),
                ],
            })
        },
        [w, h, d, color, outlineColor, topScale, legScale, legHeight, legPositions, onInspect, legRadius]
    )

    const proxyHalfY = (legHeight + h) / 2

    return (
        <group
            ref={root}
            {...props}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false) }}
            onClick={handleInspect}
        >
            {/* invisible hitbox */}
            <mesh position={[0, proxyHalfY, 0]} raycast={undefined}>
                <boxGeometry args={[w + 0.06, legHeight + h + 0.06, d + 0.06]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* top */}
            <Outlined
                disablePointer
                hovered={hovered}
                geometry={<boxGeometry args={[w, h, d]} />}
                color={color}
                outlineColor={outlineColor}
                hoverColor={hoverColor}
                outlineScale={topScale}
                position={[0, legHeight + h / 2, 0]}
            />

            {/* legs */}
            {legPositions.map(([x, z], i) => (
                <Outlined
                    key={i}
                    disablePointer
                    hovered={hovered}
                    geometry={<cylinderGeometry args={[legRadius, legRadius, legHeight, 12]} />}
                    color={color}
                    outlineColor={outlineColor}
                    hoverColor={hoverColor}
                    outlineScale={legScale}
                    position={[x, legHeight / 2, z]}
                />
            ))}
        </group>
    )
})
