// components/Game/PuzzleObjects.tsx
'use client'
import React from 'react'
import { ANCHOR } from '@/components/Game/anchors'
import { useGameState } from '@/components/Game/state'
import { PuzzleNode } from '@/components/Puzzles/PuzzleNode'
import { SecretFile } from '@/components/Models/Functional/SecretFile'
import { Mug } from '@/components/Models/Decoration/Mug'
import { secretFileMaterials, mugMaterials } from '@/components/Materials/detectiveRoomMats'
import type { PositionedSecretFile } from '@/components/Game/state.data'
import type { InspectState } from '@/components/Types/inspectModels'
import type { FocusOpts, Vec3 } from '@/components/Types/room'
import { usePuzzleInspect } from '@/components/Game/usePuzzleInspect'
import { PZ } from '@/components/Game/state.data'
import { FramedPlane } from '@/components/Models/Generic/Outlined/FramedPlane'

type RcFocus = (opts: FocusOpts) => (e: any) => void

interface PuzzleObjectsProps {
    rcFocus: RcFocus
    openInspect: (s: InspectState) => void
    files: PositionedSecretFile[]
}

export function PuzzleObjects({ rcFocus, openInspect, files }: PuzzleObjectsProps) {
    const { puzzlesConfig, puzzleStatus } = useGameState()

    const makeOpenInspectSecret = React.useCallback(
        (file: PositionedSecretFile) =>
            (p: InspectState) =>
                openInspect({
                    ...(p as any),
                    metadata: {
                        type: 'secretfile',
                        id: file.id,
                        notif: file.message ?? '',
                        persistAfterOpen: !!file.persistAfterOpen,
                        worldPos: file.pos,
                    },
                }),
        [openInspect]
    )

    const openMugInspect = usePuzzleInspect(PZ.MugInitials, openInspect)
    const mugStatus = puzzleStatus[PZ.MugInitials]
    const showMug = !!mugStatus?.available && !mugStatus?.pinned

    return (
        <>
            {Object.values(puzzlesConfig).map((cfg) => {
                const status = puzzleStatus[cfg.id]
                const availableForFrame =
                    cfg.deskFramed === false ? false : !!status?.available

                const rotationOffsetWhenPinned: Vec3 = cfg.view.rotateY180WhenPinned
                    ? [0, Math.PI, 0]
                    : [0, 0, 0]

                const isGroupProjects = cfg.id === PZ.GroupProjects
                const textureUrl = isGroupProjects
                    ? status?.solved
                        ? '/textures/puzzle_unblurredcompanies.jpg'
                        : '/textures/puzzle_blurredcompanies.jpg'
                    : cfg.view.textureUrl


                return (
                    <PuzzleNode
                        key={cfg.id}
                        def={{
                            puzzleId: cfg.id,
                            solvedFromInspectId: cfg.solvedFromInspectId,
                            deskAnchorKey: cfg.deskAnchorKey,
                            wallAnchorKey: cfg.wallAnchorKey,
                        }}
                        view={{
                            kind: 'framed',
                            frame: {
                                width: cfg.view.width,
                                height: cfg.view.height,
                                border: cfg.view.border,
                            },
                            textureUrl,
                            textureFit: cfg.view.textureFit,
                            pixelSize: cfg.view.pixelSize,
                            inspectDistance: cfg.view.inspectDistance,
                            inspect: cfg.view.inspect,
                        }}
                        available={availableForFrame}
                        pinned={!!status?.pinned}
                        solved={!!status?.solved}
                        solvedAnswer={status?.solvedAnswer}
                        openInspect={openInspect}
                        rcFocus={rcFocus}
                        rotationOffsetWhenPinned={rotationOffsetWhenPinned}
                        magnifierOnly={!!cfg.magnifierOnly && !status?.solved}
                    />
                )
            })}

            {/* Evidence */}
            <FramedPlane
                width={0.2}
                height={0.1}
                position={[-0.299, 0.787, 4.108]}
                rotation={[-Math.PI / 2, 0, 0]}
                textureUrl="/textures/coffee_paper.jpg"
                textureFit="stretch"
                border={0}
                color="#222222"
                onInspect={openInspect}
                inspectDistance={0.25}
                inspectOverrides={{pixelSize: 0}}
                canInteract
                lit
                roughness={0.9}
                metalness={0}
                receiveShadow
                textureMagnifierOnly
            />

            <group
                onContextMenu={rcFocus(ANCHOR.initialProfileFrame)}
                userData={{movable: true, anchorKey: 'initialProfileFrame'}}
            >
                <FramedPlane
                    width={0.2}
                    height={0.27}
                    position={ANCHOR.initialProfileFrame.position}
                    rotation={ANCHOR.initialProfileFrame.rotation}
                    textureUrl="/textures/initial_profile.jpg"
                    textureFit="stretch"
                    border={0}
                    color="#bbbbbb"
                    canInteract={false}
                    lit
                    onInspect={openInspect}
                    inspectDistance={0.4}
                    inspectOverrides={{pixelSize: 0}}
                    roughness={10}
                    metalness={0}
                    receiveShadow
                />
            </group>

            <group userData={{movable: true, anchorKey: 'groupProjectSanquin'}}>
                <FramedPlane
                    width={0.17}
                    height={0.24}
                    position={ANCHOR.groupProjectSanquin.position}
                    rotation={ANCHOR.groupProjectSanquin.rotation}
                    textureUrl="/textures/evidence_BloodDonationApplication.jpg"
                    textureFit="stretch"
                    border={0.005}
                    color="#222222"
                    onInspect={openInspect}
                    inspectDistance={0.3}
                    inspectOverrides={{pixelSize: 0}}
                    canInteract
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            </group>

            <group userData={{movable: true, anchorKey: 'groupProjectEclipse'}}>
                <FramedPlane
                    width={0.15}
                    height={0.20}
                    position={ANCHOR.groupProjectEclipse.position}
                    rotation={ANCHOR.groupProjectEclipse.rotation}
                    textureUrl="/textures/evidence_MarketingCalenderApplication.jpg"
                    textureFit="stretch"
                    border={0.005}
                    color="#222222"
                    onInspect={openInspect}
                    inspectDistance={0.3}
                    inspectOverrides={{pixelSize: 0}}
                    canInteract
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            </group>

            <group userData={{movable: true, anchorKey: 'previousJobSAH'}}>
                <FramedPlane
                    width={0.15}
                    height={0.08}
                    position={ANCHOR.previousJobSAH.position}
                    rotation={ANCHOR.previousJobSAH.rotation}
                    textureUrl="/textures/studentaanhuis.jpg"
                    textureFit="stretch"
                    border={0.005}
                    color="#222222"
                    onInspect={openInspect}
                    inspectDistance={0.2}
                    inspectOverrides={{pixelSize: 0}}
                    canInteract
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            </group>

            <group userData={{movable: true, anchorKey: 'previousJobAldi'}}>
                <FramedPlane
                    width={0.20}
                    height={0.11}
                    position={ANCHOR.previousJobAldi.position}
                    rotation={ANCHOR.previousJobAldi.rotation}
                    textureUrl="/textures/aldi.jpg"
                    textureFit="stretch"
                    border={0.005}
                    color="#222222"
                    onInspect={openInspect}
                    inspectDistance={0.2}
                    inspectOverrides={{pixelSize: 0}}
                    canInteract
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            </group>

            {/* Magnifier Puzzle */}
            <group userData={{movable: true, anchorKey: 'jfcFrame'}}>
                <FramedPlane
                    width={0.30}
                    height={0.21}
                    position={ANCHOR.jfcFrame.position}
                    rotation={ANCHOR.jfcFrame.rotation}
                    textureUrl="/textures/jfc.jpg"
                    textureFit="stretch"
                    border={0.005}
                    color="#222222"
                    onInspect={openInspect}
                    inspectDistance={0.4}
                    inspectOverrides={{pixelSize: 0}}
                    canInteract
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                    textureMagnifierOnly={true}
                />
            </group>

            <group userData={{movable: true, anchorKey: 'tableTopTunes2Frame'}}>
                <FramedPlane
                    width={0.40}
                    height={0.21}
                    position={ANCHOR.tableTopTunes2Frame.position}
                    rotation={ANCHOR.tableTopTunes2Frame.rotation}
                    textureUrl="/textures/tabletoptunes2.jpg"
                    textureFit="stretch"
                    border={0.005}
                    color="#222222"
                    onInspect={openInspect}
                    inspectDistance={0.36}
                    inspectOverrides={{pixelSize: 0}}
                    canInteract
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                    textureMagnifierOnly={true}
                />
            </group>

            <group userData={{movable: true, anchorKey: 'notableActivityFrame'}}>
                <FramedPlane
                    width={0.20}
                    height={0.31}
                    position={ANCHOR.notableActivityFrame.position}
                    rotation={ANCHOR.notableActivityFrame.rotation}
                    textureUrl="/textures/notable_activity.jpg"
                    textureFit="stretch"
                    border={0.005}
                    color="#222222"
                    onInspect={openInspect}
                    inspectDistance={0.46}
                    inspectOverrides={{pixelSize: 0}}
                    canInteract
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                    textureMagnifierOnly={true}
                />
            </group>

            {showMug && (
                <group onContextMenu={rcFocus(ANCHOR.mug)}>
                    <Mug
                        position={ANCHOR.mug.position}
                        rotation={[0, Math.PI / 6, 0]}
                        color="#fff"
                        outlineThickness={0.008}
                        inspectDistance={0.5}
                        inspectPixelSize={3}
                        onInspect={openMugInspect}
                        materialsById={mugMaterials}
                    />
                </group>
            )}

            {files.map((f) => (
                <group key={f.id} position={f.pos} rotation={f.rot ?? [0, 0, 0]}>
                    <SecretFile
                        onInspect={makeOpenInspectSecret(f)}
                        materialsById={secretFileMaterials}
                        frontOpen={0}
                        inspectPixelSize={2.5}
                        inspectDistance={0.5}
                        disableOutline={false}
                        visualizeHitbox={false}
                    />
                </group>
            ))}
        </>
    )
}
