"use client"
import React from "react"
import { ANCHOR } from "@/components/Game/anchors"
import type { Vec3, FocusOpts } from "@/components/Types/room"
import type { InspectState, TextPuzzle } from "@/components/Types/inspectModels"
import type { AnchorKey, PuzzleId } from "@/components/Types/game"
import { FramedPlane } from "@/components/Models/Generic/Outlined/FramedPlane"
import { Pin } from "@/components/Models/Functional/Pin"

type DefLite = {
    puzzleId: PuzzleId
    solvedFromInspectId: string
    deskAnchorKey: AnchorKey
    wallAnchorKey: AnchorKey
}

type ViewFramed = {
    kind: "framed"
    frame: { width: number; height: number; border?: number }
    textureUrl: string
    inspect: (TextPuzzle & { id: string })
    rotateY180WhenPinned?: boolean
    textureFit?: "stretch" | "contain"
    pixelSize?: number
    inspectDistance?: number
}

type Props = {
    def: DefLite
    view: ViewFramed
    available: boolean
    pinned: boolean
    openInspect: (s: InspectState) => void
    rcFocus: (opts: FocusOpts) => (e: any) => void
    rotationOffsetWhenPinned?: Vec3
    solved?: boolean
    solvedAnswer?: string
}

export function PuzzleNode({
                               def,
                               view,
                               available,
                               pinned,
                               openInspect,
                               rcFocus,
                               rotationOffsetWhenPinned = [0, 0, 0] as Vec3,
                               solved,
                               solvedAnswer,
                           }: Props) {
    if (!available && !pinned) return null

    const activeAnchor = ANCHOR[pinned ? def.wallAnchorKey : def.deskAnchorKey]
    const baseRot = (activeAnchor.rotation ?? [0, 0, 0]) as Vec3

    const yFlip = view.rotateY180WhenPinned ? Math.PI : 0
    const rot: Vec3 = pinned
        ? ([baseRot[0] + rotationOffsetWhenPinned[0],
            baseRot[1] + rotationOffsetWhenPinned[1] + yFlip,
            baseRot[2] + rotationOffsetWhenPinned[2]] as Vec3)
        : baseRot

    const pinPos: Vec3 | null = pinned && view.kind === "framed"
        ? ([0, view.frame.height / 2 + (view.frame.border ?? 0.01) * 0.5, 0.015] as Vec3)
        : null

    const inspectStateBase: InspectState = {
        kind: "framed",
        width: view.frame.width,
        height: view.frame.height,
        border: view.frame.border ?? 0.01,
        textureUrl: view.textureUrl,
        textureFit: view.textureFit ?? "stretch",
        pixelSize: view.pixelSize ?? 1,
        inspectDistance: view.inspectDistance ?? 0.4,
        puzzle: view.inspect,

        metadata: {
            type: "puzzle",
            puzzleId: def.puzzleId,
            solved: !!solved,
            solvedAnswer: solvedAnswer ?? undefined,
        },
    }

    const handleInspect = (p: InspectState) =>
        openInspect({ ...inspectStateBase, ...p })

    return (
        <group position={activeAnchor.position} rotation={rot} onContextMenu={rcFocus(activeAnchor)}>
            {view.kind === "framed" && (
                <FramedPlane
                    width={view.frame.width}
                    height={view.frame.height}
                    border={view.frame.border ?? 0.01}
                    canInteract
                    inspectDistance={inspectStateBase.inspectDistance}
                    inspectOverrides={{ pixelSize: inspectStateBase.pixelSize }}
                    onInspect={handleInspect}
                    textureUrl={view.textureUrl}
                    textureFit={inspectStateBase.textureFit ?? "stretch"}
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            )}

            {pinPos && (
                <group position={pinPos}>
                    <Pin
                        rotation={[Math.PI / 2, 0, 0]}
                        inspectDistance={0.2}
                        inspectPixelSize={3}
                        disableOutline
                        inspectDisableOutline
                    />
                </group>
            )}
        </group>
    )
}