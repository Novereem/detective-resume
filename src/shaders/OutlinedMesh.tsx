import * as THREE from 'three'
import React from 'react'
import { useCursor } from '@react-three/drei'

type CommonTransform = {
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: number | [number, number, number]
}

type OutlinedProps = CommonTransform & {
    geometry: React.ReactElement         // e.g. <boxGeometry args={[1,1,1]} />
    color?: string                       // base mesh color
    outlineColor?: string                // normal outline color
    hoverColor?: string                  // outline color on hover
    outlineScale?: number                // 1.02–1.06 recommended
    canInteract?: boolean
    onClick?: (e: any) => void
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
                         }: OutlinedProps) {
    const [hovered, setHovered] = React.useState(false)
    useCursor(canInteract && hovered)

    const currentOutline = canInteract && hovered ? hoverColor : outlineColor

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
            {/* Outline shell */}
            <group scale={outlineScale}>
                <mesh
                    raycast={() => null}> {/* This prevents the onclick event occurring TWICE, could be used for clicking on the edge */}
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