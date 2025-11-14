import React from 'react'
import { ANCHOR } from '@/components/Game/anchors'
import { Clock } from '@/components/Models/Clock'
import { PlantBamboo } from '@/components/Models/PlantPot'
import { clockMaterials, plantPotMaterials } from '@/components/Materials/detectiveRoomMats'

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void

export function AnimatedDecorationCluster({ rcFocus }: { rcFocus: RcFocus }) {
    return (
        <>
            <group onContextMenu={rcFocus(ANCHOR.clock)} userData={{ movable: true, anchorKey: 'clock' }}>
                <Clock
                    position={ANCHOR.clock.position}
                    rotation={ANCHOR.clock.rotation}
                    radius={0.22}
                    depth={0.065}
                    materialsById={clockMaterials}
                    disableOutline
                    inspectDisableOutline
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.plant)} userData={{ movable: true, anchorKey: 'plant' }}>
                <PlantBamboo
                    position={ANCHOR.plant.position}
                    rotation={ANCHOR.clock.rotation}
                    materialsById={plantPotMaterials}
                    disableOutline
                    inspectDisableOutline
                    leavesPerBranch={[3, 5]}
                />
            </group>
        </>
    )
}
