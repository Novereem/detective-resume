import React from 'react'
import { ThreeElements } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import { Outlined } from '@/shaders/OutlinedMesh'
import { InspectState, OutlinedGroupInspect, Vec3 } from '@/shaders/inspectTypes'

export type PartSpec = {
    geometry: React.ReactElement
    color?: string
    outlineColor?: string
    hoverColor?: string
    outlineScale?: number
    outlineThickness?: number
    worldThickness?: number
    boundingRadius?: number
    position?: Vec3
    rotation?: Vec3
    scale?: number | Vec3
}

type ModelGroupProps = ThreeElements['group'] & {
    parts: PartSpec[]
    hitbox?: { size: Vec3; center?: Vec3 }
    color?: string
    outlineColor?: string
    hoverColor?: string
    onInspect?: (payload: InspectState) => void
    inspectPixelSize?: number
    initialRotation?: Vec3
    inspectDistance?: number
    disablePointer?: boolean
    outlineThickness?: number
    outlineWorldThickness?: number
    outlineScale?: number
}

export function ModelGroup({
                               parts,
                               hitbox,
                               color = '#808080',
                               outlineColor = '#ffffff',
                               hoverColor = '#ff3b30',
                               onInspect,
                               inspectPixelSize,
                               initialRotation = [0, 0, 0],
                               disablePointer = false,
                               outlineThickness,
                               outlineWorldThickness,
                               outlineScale = 1.035,
                               inspectDistance,
                               ...groupProps
                           }: ModelGroupProps) {
    const [hovered, setHovered] = React.useState(false)
    useCursor(!disablePointer && hovered)

    const groupThickness = outlineThickness ?? outlineWorldThickness

    const resolveScale = React.useCallback(
        (p: PartSpec) => {
            if (p.outlineScale != null) return p.outlineScale
            const t = p.outlineThickness ?? p.worldThickness ?? groupThickness
            if (t != null && p.boundingRadius != null) return 1 + t / p.boundingRadius
            return outlineScale
        },
        [groupThickness, outlineScale]
    )

    const payload = React.useMemo<OutlinedGroupInspect>(() => ({
        kind: 'outlinedGroup',
        initialRotation,
        pixelSize: inspectPixelSize,
        inspectDistance,
        parts: parts.map(p => ({
            geometry: p.geometry,
            color: p.color ?? color,
            outlineColor: p.outlineColor ?? outlineColor,
            outlineScale: resolveScale(p),
            position: p.position,
            rotation: p.rotation,
            scale: p.scale,
        })),
    }), [parts, color, outlineColor, initialRotation, inspectPixelSize, inspectDistance, resolveScale])

    const bind = disablePointer ? {} : {
        onPointerOver: (e: any) => { e.stopPropagation(); setHovered(true) },
        onPointerOut:  (e: any) => { e.stopPropagation(); setHovered(false) },
        onClick:       (e: any) => { e.stopPropagation(); onInspect?.(payload) },
    }

    return (
        <group {...groupProps} {...bind}>
            {hitbox && (
                <mesh position={hitbox.center ?? [0, 0, 0]} raycast={disablePointer ? undefined : undefined}>
                    <boxGeometry args={hitbox.size} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>
            )}
            {parts.map((p, i) => (
                <Outlined
                    key={i}
                    disablePointer
                    hovered={!disablePointer && hovered}
                    geometry={p.geometry}
                    color={p.color ?? color}
                    outlineColor={p.outlineColor ?? outlineColor}
                    hoverColor={p.hoverColor ?? hoverColor}
                    outlineScale={resolveScale(p)}
                    position={p.position}
                    rotation={p.rotation}
                    scale={p.scale}
                />
            ))}
        </group>
    )
}