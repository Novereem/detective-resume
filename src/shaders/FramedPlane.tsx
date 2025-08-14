import * as THREE from 'three'
import React from 'react'
import { useCursor } from '@react-three/drei'
import { InspectState, FramedInspect } from './inspectTypes'

type CommonTransform = {
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: number | [number, number, number]
}

type FramedPlaneProps = CommonTransform & {
    width?: number
    height?: number
    color?: string
    borderColor?: string
    hoverColor?: string
    border?: number
    doubleSide?: boolean
    canInteract?: boolean
    onClick?: (e: any) => void
    onInspect?: (payload: InspectState) => void
    inspectOverrides?: Partial<FramedInspect>
}

export function FramedPlane({
                                width = 10,
                                height = 10,
                                color = '#333',
                                borderColor = '#ffffff',
                                hoverColor = '#ff3b30',
                                border = 0.05,
                                doubleSide = true,
                                canInteract = true,
                                position,
                                rotation,
                                scale,
                                onClick,
                                onInspect,
                                inspectOverrides = {initialRotation: [0, 0, 0]},
                            }: FramedPlaneProps) {
    const [hovered, setHovered] = React.useState(false)
    useCursor(canInteract && hovered)

    const side = doubleSide ? THREE.DoubleSide : THREE.FrontSide
    const frameColor = canInteract && hovered ? hoverColor : borderColor

    const payload = React.useMemo<FramedInspect>(
        () => ({
            kind: 'framed',
            width,
            height,
            color,
            borderColor,
            border,
            doubleSide,
            ...inspectOverrides,
        }),
        [width, height, color, borderColor, border, doubleSide, inspectOverrides]
    )

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* base plane is the only interactive part */}
            <mesh
                onPointerOver={canInteract ? (e) => { e.stopPropagation(); setHovered(true) } : undefined}
                onPointerOut={canInteract ? (e) => { e.stopPropagation(); setHovered(false) } : undefined}
                onClick={
                    canInteract
                        ? (e) => {
                            e.stopPropagation()
                            onInspect?.(payload)
                            onClick?.(e)
                        }
                        : undefined
                }
            >
                <planeGeometry args={[width, height]} />
                <meshStandardMaterial color={color} side={side} />
            </mesh>

            {/* non-interactive frame */}
            <mesh raycast={() => null} position={[0, height / 2 + border / 2, 0]}>
                <planeGeometry args={[width + 2 * border, border]} />
                <meshBasicMaterial color={frameColor} side={side} />
            </mesh>
            <mesh raycast={() => null} position={[0, -height / 2 - border / 2, 0]}>
                <planeGeometry args={[width + 2 * border, border]} />
                <meshBasicMaterial color={frameColor} side={side} />
            </mesh>
            <mesh raycast={() => null} position={[-width / 2 - border / 2, 0, 0]}>
                <planeGeometry args={[border, height]} />
                <meshBasicMaterial color={frameColor} side={side} />
            </mesh>
            <mesh raycast={() => null} position={[width / 2 + border / 2, 0, 0]}>
                <planeGeometry args={[border, height]} />
                <meshBasicMaterial color={frameColor} side={side} />
            </mesh>
        </group>
    )
}