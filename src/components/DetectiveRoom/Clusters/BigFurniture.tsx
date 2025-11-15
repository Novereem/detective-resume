import React from 'react'
import { ANCHOR } from '@/components/Game/anchors'

import { Desk } from '@/components/Models/BigFurniture/Desk'
import { CorkBoard } from '@/components/Models/BigFurniture/CorkBoard'
import { CoatRack } from '@/components/Models/BigFurniture/CoatRack'
import WoodBlinds from '@/components/Models/BigFurniture/WoodBlinds'
import RectWindow from '@/components/Models/BigFurniture/RectWindow'
import { Bookshelf } from '@/components/Models/BigFurniture/Bookshelf'

import {
    coatRackMaterials,
    corkBoardMaterials,
    deskMaterials,
    woodBlindsMaterials,
    rectWindowMaterials,
    bookshelfMaterials,
} from '@/components/Materials/detectiveRoomMats'

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void

export function BigFurnitureCluster({ rcFocus }: { rcFocus: RcFocus }) {
    return (
        <>
            <group onContextMenu={rcFocus(ANCHOR.desk1)} userData={{ movable: true, anchorKey: 'desk1' }}>
                <Desk
                    position={ANCHOR.desk1.position}
                    rotation={[0, 0, 0]}
                    color="#fff"
                    outlineScale={6.56}
                    outlinePerPart={{ topScale: 1.04, legScale: 1.1 }}
                    inspectPixelSize={3}
                    materialsById={deskMaterials}
                    disableOutline
                    inspectDisableOutline
                    visualizeHitbox={false}
                    disablePointer
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.corkBoard)} userData={{ movable: true, anchorKey: 'corkBoard' }}>
                <CorkBoard
                    position={ANCHOR.corkBoard.position}
                    rotation={[0, 0, 0]}
                    color="#fff"
                    materialsById={corkBoardMaterials}
                    inspectDistance={1}
                    inspectPixelSize={3}
                    disableOutline
                    inspectDisableOutline
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.coatRack)} userData={{ movable: true, anchorKey: 'coatRack' }}>
                <CoatRack
                    position={ANCHOR.coatRack.position}
                    rotation={[0, 0, 0]}
                    materialsById={coatRackMaterials}
                    color="#fff"
                    outlineScale={1.04}
                    inspectPixelSize={3}
                    disableOutline
                    inspectDisableOutline
                    legAngleDeg={60}
                    groundY={0}
                    baseSpread={0.3}
                    footPadRadius={0.012}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.blinds1)} userData={{ movable: true, anchorKey: 'blinds1' }}>
                <WoodBlinds
                    position={ANCHOR.blinds1.position}
                    rotation={ANCHOR.blinds1.rotation}
                    size={[0.62, 1.2, 0.05]}
                    materialsById={woodBlindsMaterials}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.blinds2)} userData={{ movable: true, anchorKey: 'blinds2' }}>
                <WoodBlinds
                    position={ANCHOR.blinds2.position}
                    rotation={ANCHOR.blinds2.rotation}
                    size={[0.62, 1, 0.05]}
                    materialsById={woodBlindsMaterials}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.window1)} userData={{ movable: true, anchorKey: 'window1' }}>
                <RectWindow
                    position={ANCHOR.window1.position}
                    rotation={ANCHOR.window1.rotation}
                    size={[0.75, 1.4, 0.05]}
                    surroundBorder={0.04}
                    frameW={0.04}
                    frameDepth={0.02}
                    windowOffset={-0.02}
                    materialsById={rectWindowMaterials}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.window2)} userData={{ movable: true, anchorKey: 'window2' }}>
                <RectWindow
                    position={ANCHOR.window2.position}
                    rotation={ANCHOR.window2.rotation}
                    size={[0.75, 1.4, 0.05]}
                    surroundBorder={0.04}
                    frameW={0.04}
                    frameDepth={0.02}
                    windowOffset={-0.02}
                    materialsById={rectWindowMaterials}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.bookshelf1)} userData={{ movable: false, anchorKey: 'bookshelf1' }}>
                <Bookshelf
                    position={ANCHOR.bookshelf1.position}
                    rotation={ANCHOR.bookshelf1.rotation}
                    materialsById={bookshelfMaterials}
                    size={[0.9, 2.0, 0.26]}
                    frameThickness={0.03}
                    shelfCount={4}
                    disableOutline
                    inspectDisableOutline
                    outlineScale={1.02}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.bookshelf2)} userData={{ movable: true, anchorKey: 'bookshelf2' }}>
                <Bookshelf
                    position={ANCHOR.bookshelf2.position}
                    rotation={ANCHOR.bookshelf2.rotation}
                    materialsById={bookshelfMaterials}
                    size={[1.3, 0.65, 0.26]}
                    frameThickness={0.03}
                    shelfCount={1}
                    disableOutline
                    inspectDisableOutline
                    outlineScale={1.02}
                />
            </group>
        </>
    )
}
