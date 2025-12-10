// components/Models/CardboardBox/CardboardBoxInteractive.tsx
'use client'
import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'
import { CardboardLid } from '@/components/Models/Decoration/CardboardBox/CardboardLid'
import { useGameState, useGameActions } from "@/components/Game/state";

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById' | 'id'>

export type CardboardBoxInteractiveProps = Inherited & {
    id: string
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
    size?: [number, number, number]
    wallT?: number
    lidLip?: number
    lidWallT?: number
    lidClearance?: number
}

export function CardboardBoxInteractive({
                                            id,
                                            size = [0.28, 0.14, 0.28],
                                            wallT = 0.004,
                                            lidLip = 0.028,
                                            lidWallT = 0.003,
                                            lidClearance = 0.002,
                                            color = '#caa874',
                                            outlineColor = '#fff',
                                            hoverColor = '#ff3b30',
                                            outlineScale = 1.02,
                                            initialRotation = [0.3, 0, 0] as Vec3,
                                            materialsById,
                                            onInspect,
                                            inspectDistance = 0.65,
                                            ...rest
                                        }: CardboardBoxInteractiveProps) {
    const [W, H, D] = size
    const sideH = Math.max(0.01, H - wallT)

    const parts = useMemo<PartSpec[]>(() => ([
        { id: 'bottom', geometry: <boxGeometry args={[W, wallT, D]} />, position: [0, -H/2 + wallT/2, 0], color, outlineColor, roughness: 0.95, metalness: 0 },
        { id: 'wall',   geometry: <boxGeometry args={[W, sideH, wallT]} />, position: [0, wallT/2,  D/2 - wallT/2], color, outlineColor, roughness: 0.95, metalness: 0 },
        { id: 'wall',   geometry: <boxGeometry args={[W, sideH, wallT]} />, position: [0, wallT/2, -D/2 + wallT/2], color, outlineColor, roughness: 0.95, metalness: 0 },
        { id: 'wall',   geometry: <boxGeometry args={[wallT, sideH, D]} />, position: [ W/2 - wallT/2, wallT/2, 0],   color, outlineColor, roughness: 0.95, metalness: 0 },
        { id: 'wall',   geometry: <boxGeometry args={[wallT, sideH, D]} />, position: [-W/2 + wallT/2, wallT/2, 0],   color, outlineColor, roughness: 0.95, metalness: 0 },
    ]), [W, H, D, wallT, sideH, color, outlineColor])

    const lidRef = useRef<THREE.Group>(null)
    const { cardboardBoxes } = useGameState()
    const actions = useGameActions()

    const openNonce = cardboardBoxes[id]?.openNonce ?? 0
    const status   = cardboardBoxes[id]?.status ?? 'closed'
    const opened   = status === 'opened'

    const animRef = useRef<{ phase: 'idle'|'up'|'drop'; t: number }>({ phase: 'idle', t: 0 })

    // kick off the lid animation whenever we receive an open request
    useEffect(() => {
        if (openNonce <= 0) return
        if (!lidRef.current) return

        const underY = -H / 2 - (lidLip + lidWallT) - 0.001 // tiny offset to avoid z-fighting
        lidRef.current.position.set(0, underY, 0)
        lidRef.current.rotation.set(Math.PI, 0, 0)

        // mark opened immediately
        actions.finishOpenCardboardBox(id)
    }, [openNonce, H, lidLip, lidWallT, id, actions])

    const hitbox = { size: [W, H, D] as Vec3, center: [0, 0, 0] as Vec3 }

    const { position, rotation, scale, ...groupRest } = rest as any

    const disableAllOutline = opened || groupRest?.disableOutline
    const disableInspect    = opened || groupRest?.inspectDisableOutline

    const underY = -H / 2 - (lidLip + lidWallT) + 0.05
    const lidY   = opened ? underY : H / 2

    return (
        <group position={position} rotation={rotation} scale={scale}>

            <ModelGroup
                {...groupRest}
                parts={parts}
                materialsById={materialsById}
                hitbox={hitbox}
                color={color}
                outlineColor={outlineColor}
                hoverColor={hoverColor}
                outlineScale={outlineScale}
                initialRotation={initialRotation}
                disableOutline={disableAllOutline}
                inspectDisableOutline={disableInspect}
                disablePointer={opened}
                onInspect={opened ? undefined : (p) =>
                    onInspect?.({
                        ...p,
                        inspectDistance,
                        pixelSize: 3,
                        metadata: {...(p as any).metadata, type: 'cardboard-box', id},
                    })
                }
            />

            <group ref={lidRef} position={[0, lidY, 0]}>
                <CardboardLid
                    size={[W, D]}
                    wallT={lidWallT}
                    sideH={lidLip}
                    clearance={lidClearance}
                    materialsById={materialsById}
                    disableOutline
                    inspectDisableOutline
                />
            </group>
        </group>
    )
}
