// components/Game/PuzzleObjects.tsx
'use client'
import React from 'react'
import { ANCHOR } from '@/components/Game/anchors'
import { useGameState } from '@/components/Game/state'
import { PuzzleNode } from '@/app/Puzzles/PuzzleNode'
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
                    />
                )
            })}

            {/* Evidence */}
            <FramedPlane
                width={0.22}
                height={0.14}
                position={[-0.169, 0.795, 4.408]}
                rotation={[-Math.PI / 2, 0, 0]}
                textureUrl="/textures/paper_collages_whites.jpg"
                textureFit="stretch"
                border={0.005}
                color="#222222"
                onInspect={openInspect}
                canInteract
                lit
                roughness={0.9}
                metalness={0}
                receiveShadow
                textureMagnifierOnly
            />

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

            <group onContextMenu={rcFocus(ANCHOR.mug)}>
                <Mug
                    position={[-0.169, 0.895, 4.408]}
                    rotation={[0, Math.PI / 6, 0]}
                    color="#fff"
                    disableOutline={false}
                    castShadow={false}
                    materialsById={mugMaterials}
                    magnifierOnly
                    onInspect={openMugInspect}
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
