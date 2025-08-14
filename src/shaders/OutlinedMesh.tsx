// OutlinedMesh.tsx
import * as THREE from 'three'
import React from 'react'
import { useCursor } from '@react-three/drei'

export type InspectState = {
    geometry: React.ReactElement
    color?: string
    outlineColor?: string
    outlineScale?: number
    initialRotation?: [number, number, number]
}

type CommonTransform = {
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: number | [number, number, number]
}

type OutlinedProps = CommonTransform & {
    geometry: React.ReactElement
    color?: string
    outlineColor?: string
    hoverColor?: string
    outlineScale?: number
    canInteract?: boolean
    onClick?: (e: any) => void
    /** If provided, clicking will call this with a payload auto-built from props */
    onInspect?: (payload: InspectState) => void
    /** Optional overrides to include in the payload (e.g. initialRotation) */
    inspectOverrides?: Partial<InspectState>
}

export function Outlined({
                             geometry,
                             color = '#808080',
                             outlineColor = '#ffffff',
                             hoverColor = '#ff3b30',
                             outlineScale = 1.04,
                             canInteract = true,
                             position,
                             rotation,
                             scale,
                             onClick,
                             onInspect,
                             inspectOverrides = {initialRotation: [0.2, 0.6, 0]},
                         }: OutlinedProps) {
    const [hovered, setHovered] = React.useState(false)
    useCursor(canInteract && hovered)

    const currentOutline = canInteract && hovered ? hoverColor : outlineColor

    const handleClick = (e: any) => {
        if (!canInteract) return
        e.stopPropagation()
        // Build payload from current props
        if (onInspect) {
            const payload: InspectState = {
                geometry,
                color,
                outlineColor,
                outlineScale,
                ...inspectOverrides,
            }
            onInspect(payload)
        }
        onClick?.(e)
    }

    return (
        <group
            position={position}
            rotation={rotation}
            scale={scale}
            onPointerOver={canInteract ? (e) => { e.stopPropagation(); setHovered(true) } : undefined}
            onPointerOut={canInteract ? (e) => { e.stopPropagation(); setHovered(false) } : undefined}
            onClick={handleClick}
        >
            {/* Outline shell (non-interactive) */}
            <group scale={outlineScale}>
                <mesh raycast={() => null}>
                    {React.cloneElement(geometry)}
                    <meshBasicMaterial
                        color={currentOutline}
                        side={THREE.BackSide}
                        polygonOffset
                        polygonOffsetFactor={-1}
                        polygonOffsetUnits={1}
                        depthWrite
                        depthTest
                    />
                </mesh>
            </group>

            {/* Original */}
            <mesh>
                {React.cloneElement(geometry)}
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    )
}