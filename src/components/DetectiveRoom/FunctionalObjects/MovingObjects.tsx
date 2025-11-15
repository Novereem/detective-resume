'use client'
import React from 'react'
import * as THREE from 'three'
import { ANCHOR } from '@/components/Game/anchors'
import { CardboardBoxInteractive } from '@/components/Models/Functional/CardboardBoxInteractive'
import { MetalDesk } from '@/components/Models/BigFurniture/MetalDesk/MetalDesk'
import { SecretFile } from '@/components/Models/Functional/SecretFile'
import {
    cardboardMaterials,
    metalCabinetMaterials,
    metalDeskTopMaterials,
    metalDrawerMaterials,
    secretFileMaterials,
} from '@/components/Materials/detectiveRoomMats'
import type { DrawerFileLike, Vec3 } from '@/components/Types/room'
import type { DrawerFileSpawn } from '@/components/Game/state.data'
import type { InspectState } from '@/components/Types/inspectModels'

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void

interface MovingObjectsProps {
    rcFocus: RcFocus
    openInspect: (s: InspectState) => void
    drawerFiles: DrawerFileSpawn[]
    drawers: Record<string, { fileAlive?: boolean }>
}

export function MovingObjects({ rcFocus, openInspect, drawerFiles, drawers }: MovingObjectsProps) {
    const nodeMapRef = React.useRef(new Map<string, THREE.Object3D>())

    const refFor = React.useCallback((key: string) => (node: THREE.Object3D | null) => {
        if (node) nodeMapRef.current.set(key, node)
        else nodeMapRef.current.delete(key)
    }, [])

    const worldCenterOf = (node: THREE.Object3D): Vec3 => {
        node.updateWorldMatrix(true, true)
        const box = new THREE.Box3().setFromObject(node)
        const c = box.getCenter(new THREE.Vector3())
        return [c.x, c.y, c.z]
    }

    const makeOpenInspectFromKey =
        (meta: { id: string; message: string; persistAfterOpen?: boolean }, key: string) =>
            (p: InspectState) => {
                const node = nodeMapRef.current.get(key) || null
                const worldPos: Vec3 | null = node ? worldCenterOf(node) : null
                openInspect({
                    ...(p as any),
                    metadata: {
                        type: 'secretfile',
                        id: meta.id,
                        notif: meta.message,
                        persistAfterOpen: !!meta.persistAfterOpen,
                        worldPos,
                    },
                })
            }

    const byId = React.useMemo(() => {
        const map: Record<string, DrawerFileLike> = {}
        for (const f of drawerFiles) map[f.id] = f
        return map
    }, [drawerFiles])

    return (
        <>
            <group onContextMenu={rcFocus(ANCHOR.cardbox01)} userData={{ movable: true, anchorKey: 'cardbox01' }}>
                <CardboardBoxInteractive
                    id="cardbox-01"
                    position={ANCHOR.cardbox01.position}
                    rotation={ANCHOR.cardbox01.rotation}
                    materialsById={cardboardMaterials}
                    size={[0.28, 0.14, 0.28]}
                    wallT={0.004}
                    lidLip={0.028}
                    lidWallT={0.003}
                    lidClearance={0.002}
                    disableOutline={false}
                    inspectDisableOutline
                    onInspect={openInspect}
                    inspectDistance={0.6}
                />
            </group>

            <group
                onContextMenu={rcFocus(ANCHOR.deskMetal)}
                position={ANCHOR.deskMetal.position}
                rotation={[0, Math.PI, 0]}
            >
                <MetalDesk
                    topSize={[1.8, 0.04, 0.7]}
                    materials={{
                        top: metalDeskTopMaterials,
                        cabinet: metalCabinetMaterials,
                        drawer: metalDrawerMaterials,
                    }}
                    drawerContentOffset={[0, 0.012, -0.02]}
                    drawerChildren={
                        <>
                            {!!byId['sf-in-drawer'] &&
                                !!drawers[byId['sf-in-drawer'].drawerKey]?.fileAlive && (
                                    <group
                                        ref={refFor(byId['sf-in-drawer'].id)}
                                        key={byId['sf-in-drawer'].id}
                                        position={[-0.12, 0.07, 0]}
                                        rotation={[-Math.PI / 2, 0, 0.1]}
                                    >
                                        <SecretFile
                                            onInspect={makeOpenInspectFromKey(
                                                {
                                                    id: byId['sf-in-drawer'].id,
                                                    message: byId['sf-in-drawer'].message ?? '',
                                                    persistAfterOpen: byId['sf-in-drawer'].persistAfterOpen,
                                                },
                                                byId['sf-in-drawer'].id
                                            )}
                                            materialsById={secretFileMaterials}
                                            frontOpen={0}
                                            inspectPixelSize={2}
                                            inspectDistance={0.45}
                                            disableOutline={false}
                                            visualizeHitbox={false}
                                        />
                                    </group>
                                )}
                        </>
                    }
                />
            </group>
        </>
    )
}
