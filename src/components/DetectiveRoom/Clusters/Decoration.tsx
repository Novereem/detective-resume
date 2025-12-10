import React from 'react'
import {ANCHOR} from '@/components/Game/anchors'
import {CardboardBox} from '@/components/Models/Decoration/CardboardBox/CardboardBox'
import {CardboardLid} from '@/components/Models/Decoration/CardboardBox/CardboardLid'
import TrashBin from '@/components/Models/Decoration/TrashBin'
import CigarWithSmoke from '@/components/Models/Decoration/Cigar/CigarWithSmoke'
import {AshTrayWood} from '@/components/Models/Decoration/Cigar/AshTray'
import {
    ashTrayWoodMaterials,
    cardboardMaterials,
    cigarMaterials,
    detectiveHatMaterials,
    mugMaterials,
    paperclipMaterials,
    penMaterials,
    staplerMaterials,
    trashBinMaterials,
} from '@/components/Materials/detectiveRoomMats'
import {DetectiveHatSimple} from "@/components/Models/Decoration/DetectiveHatSimple";
import Stapler from "@/components/Models/Decoration/Stapler";
import Paperclip from "@/components/Models/Decoration/Paperclip";
import Pen from "@/components/Models/Decoration/Pen";
import Mug from "@/components/Models/Decoration/Mug";
import {useQuality} from "@/components/Settings/QualityContext";

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void

export function DecorationCluster({ rcFocus }: { rcFocus: RcFocus }) {
    const quality = useQuality()
    const showPaperclips = quality === 'high'
    const showExtraPens = quality !== 'low'
    const showMugDeco = quality !== 'low'

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
                    disablePointer
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

            <group onContextMenu={rcFocus(ANCHOR.stapler1)} userData={{movable: true, anchorKey: 'stapler1'}}>
                <Stapler
                    position={ANCHOR.stapler1.position}
                    rotation={ANCHOR.stapler1.rotation}
                    materialsById={staplerMaterials}
                    disableOutline
                    inspectDisableOutline
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.pen1)} userData={{movable: true, anchorKey: 'pen1'}}>
                <Pen
                    position={ANCHOR.pen1.position}
                    rotation={ANCHOR.pen1.rotation}
                    materialsById={penMaterials}
                    colorBody={"#324567"}
                    colorTip={"#191f35"}
                    disableOutline
                    inspectDisableOutline
                />
            </group>

            {showExtraPens && (
                <>
                    <group onContextMenu={rcFocus(ANCHOR.pen2)} userData={{movable: true, anchorKey: 'pen2'}}>
                        <Pen
                            position={ANCHOR.pen2.position}
                            rotation={ANCHOR.pen2.rotation}
                            materialsById={penMaterials}
                            colorBody={"#673238"}
                            colorTip={"#35191e"}
                            disableOutline
                            inspectDisableOutline
                        />
                    </group>

                    <group onContextMenu={rcFocus(ANCHOR.pen3)} userData={{movable: true, anchorKey: 'pen3'}}>
                        <Pen
                            position={ANCHOR.pen3.position}
                            rotation={ANCHOR.pen3.rotation}
                            materialsById={penMaterials}
                            colorBody={"#326739"}
                            colorTip={"#19351a"}
                            disableOutline
                            inspectDisableOutline
                        />
                    </group>

                    <group onContextMenu={rcFocus(ANCHOR.pen4)} userData={{movable: true, anchorKey: 'pen4'}}>
                        <Pen
                            position={ANCHOR.pen4.position}
                            rotation={ANCHOR.pen4.rotation}
                            materialsById={penMaterials}
                            colorBody={"#111111"}
                            colorTip={"#111111"}
                            disableOutline
                            inspectDisableOutline
                        />
                    </group>
                </>
            )}

            {showPaperclips && (
                <>
                    <group onContextMenu={rcFocus(ANCHOR.paperclip1)} userData={{movable: true, anchorKey: 'paperclip1'}}>
                        <Paperclip
                            position={ANCHOR.paperclip1.position}
                            rotation={ANCHOR.paperclip1.rotation}
                            materialsById={paperclipMaterials}
                            disableOutline
                            inspectDisableOutline
                        />
                    </group>

                    <group onContextMenu={rcFocus(ANCHOR.paperclip2)} userData={{movable: true, anchorKey: 'paperclip2'}}>
                        <Paperclip
                            position={ANCHOR.paperclip2.position}
                            rotation={ANCHOR.paperclip2.rotation}
                            materialsById={paperclipMaterials}
                            disableOutline
                            inspectDisableOutline
                        />
                    </group>

                    <group onContextMenu={rcFocus(ANCHOR.paperclip3)} userData={{movable: true, anchorKey: 'paperclip3'}}>
                        <Paperclip
                            position={ANCHOR.paperclip3.position}
                            rotation={ANCHOR.paperclip3.rotation}
                            materialsById={paperclipMaterials}
                            disableOutline
                            inspectDisableOutline
                        />
                    </group>
                </>
            )}

            {showMugDeco && (
                <group onContextMenu={rcFocus(ANCHOR.mugDeco1)} userData={{movable: true, anchorKey: 'mugDeco1'}}>
                    <Mug
                        position={ANCHOR.mugDeco1.position}
                        rotation={ANCHOR.mugDeco1.rotation}
                        materialsById={mugMaterials}
                        disableOutline
                        inspectDisableOutline
                    />
                </group>
            )}
        </>
    )
}
