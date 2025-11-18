// components/Game/PuzzleObjects.tsx
'use client'
import React from 'react'
import { ANCHOR } from '@/components/Game/anchors'
import { useGameState } from '@/components/Game/state'
import { PuzzleNode } from '@/components/PuzzleNode'
import { SecretFile } from '@/components/Models/Functional/SecretFile'
import { Mug } from '@/components/Models/Decoration/Mug'
import { secretFileMaterials, mugMaterials } from '@/components/Materials/detectiveRoomMats'
import type { PositionedSecretFile } from '@/components/Game/state.data'
import type { InspectState } from '@/components/Types/inspectModels'
import { FocusOpts } from '@/components/Types/room'
import { usePuzzleInspect } from '@/components/Game/usePuzzleInspect'
import { PZ } from '@/components/Game/state.data'
import MagnifierRevealMaterial from "@/components/CameraEffects/Magnifier/MagnifierRevealMaterial";
import {FramedPlane} from "@/components/Models/Generic/Outlined/FramedPlane";

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
                            textureUrl: cfg.view.textureUrl,
                            inspect: cfg.view.inspect,
                        }}
                        available={availableForFrame}
                        pinned={!!status?.pinned}
                        solved={!!status?.solved}
                        solvedAnswer={status?.solvedAnswer}
                        openInspect={openInspect}
                        rcFocus={rcFocus}
                        rotationOffsetWhenPinned={
                            cfg.view.rotateY180WhenPinned ? [0, Math.PI, 0] : [0, 0, 0]
                        }
                    />
                )
            })}

            <mesh position={[0.2, 0.9, 3.8]}>
                <boxGeometry args={[0.5, 0.5, 0.5]}/>
                <MagnifierRevealMaterial
                    color="#ffffff"
                    emissive="#222222"
                    maxDistance={20}
                    debug={false}
                />
            </mesh>

            <FramedPlane
                width={0.22}
                height={0.14}
                position={[-0.169, 0.795, 4.408]}
                rotation={[-Math.PI / 2, 0, 0]}
                textureUrl="/textures/paper_collages_whites.jpg"
                textureRepeat={[1, 1]}
                border={0.005}
                color="#222222"
                canInteract={false}
                lit
                roughness={0.9}
                metalness={0}
                receiveShadow

            />

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
