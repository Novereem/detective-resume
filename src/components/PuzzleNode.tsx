"use client"
import React from "react"
import { ANCHOR } from "@/components/Game/anchors"
import type { Vec3, FocusOpts } from "@/components/Types/room"
import type { InspectState } from "@/components/Types/inspectModels"
import type { PuzzleDef } from "@/components/Game/puzzleRegistry"
import { FramedPlane } from "@/components/Primitives/FramedPlane"
import { Pin } from "@/components/Models/Pin"
import {PUZZLE_VIEWS} from "@/components/Game/puzzleViews";

type Props = {
    def: PuzzleDef
    available: boolean
    pinned: boolean
    openInspect: (s: InspectState) => void
    rcFocus: (opts: FocusOpts) => (e: any) => void
}

export function PuzzleNode({ def, available, pinned, openInspect, rcFocus }: Props) {
    if (!available && !pinned) return null

    const view = PUZZLE_VIEWS[def.puzzleId]
    if (!view) return null

    const activeAnchor = ANCHOR[pinned ? def.wallAnchorKey : def.deskAnchorKey]
    const baseRot = activeAnchor.rotation ?? ([0, 0, 0] as Vec3)

    const rot: Vec3 =
        pinned && view.rotateY180WhenPinned
            ? ([baseRot[0], baseRot[1] + Math.PI, baseRot[2]] as Vec3)
            : baseRot

    let pinPos: Vec3 | null = null
    if (pinned && view.kind === "framed" && view.pinFrom !== "none") {
        const s = view.state as any
        const width = s.width as number
        const height = s.height as number
        const border = (s.border as number | undefined) ?? 0.01
        pinPos = [0, height / 2 + border * 0.5, 0.015]
    }

    const handleInspect = (state: InspectState) => openInspect(state)

    return (
        <group
            position={activeAnchor.position}
            rotation={rot}
            onContextMenu={rcFocus(activeAnchor)}
        >
            {view.kind === "framed" && (
                <FramedPlane
                    width={(view.state as any).width}
                    height={(view.state as any).height}
                    color={(view.state as any).color ?? "#000"}
                    borderColor={(view.state as any).borderColor ?? "#fff"}
                    border={(view.state as any).border ?? 0.01}
                    canInteract
                    inspectDistance={(view.state as any).inspectDistance ?? 0.4}
                    inspectOverrides={{ pixelSize: (view.state as any).pixelSize ?? 1 }}
                    onInspect={(p) => handleInspect({ ...view.state, ...p })}
                    textureUrl={(view.state as any).textureUrl}
                    textureFit={(view.state as any).textureFit ?? "stretch"}
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