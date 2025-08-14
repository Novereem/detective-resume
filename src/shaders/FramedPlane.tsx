import * as THREE from 'three'
import React from 'react'
import { useCursor } from '@react-three/drei'

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
                            }: FramedPlaneProps) {
    const [hovered, setHovered] = React.useState(false)
    useCursor(canInteract && hovered) // changes cursor to pointer

    const side = doubleSide ? THREE.DoubleSide : THREE.FrontSide
    const frameColor = hovered ? hoverColor : borderColor

    return (
        <group
            position={position}
            rotation={rotation}
            scale={scale}
            onPointerOver={
                canInteract ? (e) => {
                    e.stopPropagation()
                    setHovered(true)
                } : undefined
            }
            onPointerOut={
                canInteract ? (e) => {
                    e.stopPropagation()
                    setHovered(false)
                } : undefined
            }
            onClick={onClick}
        >
            {/* base plane */}
            <mesh>
                <planeGeometry args={[width, height]} />
                <meshStandardMaterial color={color} side={side} />
            </mesh>

            {/* frame: top/bottom */}
            <mesh position={[0, height / 2 + border / 2, 0]}>
                <planeGeometry args={[width + 2 * border, border]} />
                <meshBasicMaterial color={frameColor} side={side} />
            </mesh>
            <mesh position={[0, -height / 2 - border / 2, 0]}>
                <planeGeometry args={[width + 2 * border, border]} />
                <meshBasicMaterial color={frameColor} side={side} />
            </mesh>

            {/* frame: left/right */}
            <mesh position={[-width / 2 - border / 2, 0, 0]}>
                <planeGeometry args={[border, height]} />
                <meshBasicMaterial color={frameColor} side={side} />
            </mesh>
            <mesh position={[width / 2 + border / 2, 0, 0]}>
                <planeGeometry args={[border, height]} />
                <meshBasicMaterial color={frameColor} side={side} />
            </mesh>
        </group>
    )
}