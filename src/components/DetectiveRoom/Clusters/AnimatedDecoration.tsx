import React from 'react'
import { ANCHOR } from '@/components/Game/anchors'
import { Clock } from '@/components/Models/AnimatedDecoration/Clock'
import { PlantBamboo } from '@/components/Models/AnimatedDecoration/PlantPot'
import {clockMaterials, globeMaterials, plantPotMaterials} from '@/components/Materials/detectiveRoomMats'
import {Fly} from "@/components/Models/AnimatedDecoration/Fly";
import {useSettings} from "@/components/UI/SettingsProvider";
import Globe from "@/components/Models/Decoration/Globe";

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void


export function AnimatedDecorationCluster({ rcFocus }: { rcFocus: RcFocus }) {
    const { flyEnabled } = useSettings()

    return (
        <>
            <group onContextMenu={rcFocus(ANCHOR.clock)} userData={{movable: true, anchorKey: 'clock'}}>
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

            <group onContextMenu={rcFocus(ANCHOR.plant)} userData={{movable: true, anchorKey: 'plant'}}>
                <PlantBamboo
                    position={ANCHOR.plant.position}
                    rotation={ANCHOR.clock.rotation}
                    materialsById={plantPotMaterials}
                    disableOutline
                    inspectDisableOutline
                    leavesPerBranch={[3, 5]}
                />
            </group>


            <group onContextMenu={rcFocus(ANCHOR.globe)} userData={{movable: true, anchorKey: 'globe1'}}>
                <Globe
                    position={ANCHOR.globe.position}
                    rotation={ANCHOR.globe.rotation}
                    materialsById={globeMaterials}
                    disableOutline
                    inspectDisableOutline
                />
            </group>

            {flyEnabled && <Fly/>}
        </>
    )
}
