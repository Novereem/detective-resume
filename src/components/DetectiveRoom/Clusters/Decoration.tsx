import React from 'react'
import { ANCHOR } from '@/components/Game/anchors'
import { CardboardBox } from '@/components/Models/CardboardBox/CardboardBox'
import { CardboardLid } from '@/components/Models/CardboardBox/CardboardLid'
import TrashBin from '@/components/Models/TrashBin'
import CigarWithSmoke from '@/components/Models/CigarWithSmoke'
import { AshTrayWood } from '@/components/Models/AshTray'
import {
    ashTrayWoodMaterials,
    cardboardMaterials,
    cigarMaterials, detectiveCoatMaterials, detectiveHatMaterials,
    trashBinMaterials,
} from '@/components/Materials/detectiveRoomMats'
import {DetectiveHatSimple} from "@/components/Models/DetectiveHatSimple";
import {DetectiveCoat} from "@/components/Models/DetectiveCoat";

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void

export function DecorationCluster({ rcFocus }: { rcFocus: RcFocus }) {
    return (
        <>
            <group onContextMenu={rcFocus(ANCHOR.cardboard1)} userData={{movable: true, anchorKey: 'cardboard1'}}>
                <CardboardBox
                    position={ANCHOR.cardboard1.position}
                    rotation={ANCHOR.cardboard1.rotation}
                    materialsById={cardboardMaterials}
                    size={[0.28, 0.14, 0.28]}
                    wallT={0.004}
                    lidEnabled={false}
                    lidLip={0.028}
                    lidWallT={0.003}
                    lidClearance={0.002}
                    disableOutline
                    inspectDisableOutline
                />
            </group>

            <group
                onContextMenu={rcFocus(ANCHOR.cardboardLid1)}
                userData={{movable: true, anchorKey: 'cardboardLid1'}}
            >
                <CardboardLid
                    position={ANCHOR.cardboardLid1.position}
                    rotation={ANCHOR.cardboardLid1.rotation}
                    materialsById={cardboardMaterials}
                    size={[0.28, 0.28]}
                    wallT={0.003}
                    sideH={0.028}
                    clearance={0.002}
                    disableOutline
                    inspectDisableOutline
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.trashBin)} userData={{movable: true, anchorKey: 'trashBin'}}>
                <TrashBin
                    position={ANCHOR.trashBin.position}
                    rotation={ANCHOR.trashBin.rotation}
                    materialsById={trashBinMaterials}
                    size={[0.2, 0.16, 0.35]}
                    rimT={0.0075}
                    baseT={0.004}
                    baseInset={0.01}
                    disableOutline
                    inspectDisableOutline
                />
            </group>

            <group
                onContextMenu={rcFocus(ANCHOR.cigar1)}
                position={ANCHOR.cigar1.position}
                rotation={ANCHOR.cigar1.rotation}
                userData={{movable: true, anchorKey: 'cigar1'}}
            >
                <CigarWithSmoke
                    materialsById={cigarMaterials}
                    lit
                    smokeProps={{
                        opacity: 0.2,
                        alphaPow: 1.2,
                        baseHalfWidth: 0.006,
                        topWidthMult: 3.4,
                        widthPow: 0.55,
                        footPinchFactor: 0.25,
                        footPinchV: 0.8,
                    }}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.ashTray1)} userData={{movable: true, anchorKey: 'ashTray1'}}>
                <AshTrayWood
                    position={ANCHOR.ashTray1.position}
                    rotation={ANCHOR.ashTray1.rotation}
                    materialsById={ashTrayWoodMaterials}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.hat)} userData={{movable: true, anchorKey: 'hat'}}>
                <DetectiveHatSimple
                    position={ANCHOR.hat.position}
                    rotation={ANCHOR.hat.rotation}
                    materialsById={detectiveHatMaterials}
                    crownTopRadius={0.065}
                />
            </group>

            {/*<group*/}
            {/*    onContextMenu={rcFocus(ANCHOR.detectiveCoat)}*/}
            {/*    userData={{movable: true, anchorKey: 'detectiveCoat'}}*/}
            {/*>*/}
            {/*    <DetectiveCoat*/}
            {/*        position={ANCHOR.detectiveCoat.position}*/}
            {/*        rotation={ANCHOR.detectiveCoat.rotation}*/}
            {/*        materialsById={detectiveCoatMaterials}*/}
            {/*    />*/}
            {/*</group>*/}
        </>
    )
}
