import * as THREE from 'three'
import React from 'react'
import { useCursor } from '@react-three/drei'
import { InspectState, OutlinedInspect } from './inspectTypes'
import { useManagedTexture } from '@/shaders/useManagedTexture'

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
    onInspect?: (payload: InspectState) => void
    inspectOverrides?: Partial<OutlinedInspect>
    hovered?: boolean
    disablePointer?: boolean
    textureUrl?: string
    texturePixelated?: boolean
    metalness?: number
    roughness?: number
    disableOutline?: boolean
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
    hovered,
    disablePointer = false,
    textureUrl,
    texturePixelated,
    metalness,
    roughness,
    disableOutline = false,
}: OutlinedProps) {

    const [localHover, setLocalHover] = React.useState(false)
    const isHover = hovered !== undefined ? hovered : localHover

    useCursor(canInteract && isHover)
    const currentOutline = canInteract && isHover ? hoverColor : outlineColor

    const handleClick = (e: any) => {
        if (!canInteract) return
        e.stopPropagation()
        if (onInspect) {
            const payload: OutlinedInspect = {
                kind: 'outlined',
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

    const bind =
        canInteract && !disablePointer
            ? {
                onPointerOver: (e: any) => { e.stopPropagation(); setLocalHover(true) },
                onPointerOut:  (e: any) => { e.stopPropagation(); setLocalHover(false) },
                onClick: handleClick,
            }
            : {}

    const tex = useManagedTexture(textureUrl, {
        minFilter: texturePixelated ? THREE.NearestFilter : THREE.LinearFilter,
        magFilter: texturePixelated ? THREE.NearestFilter : THREE.LinearFilter,
        generateMipmaps: !texturePixelated,
    })

    return (
        <group position={position} rotation={rotation} scale={scale} {...bind}>
            {!disableOutline && (
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
            )}

            <mesh>
                {React.cloneElement(geometry)}
                <meshStandardMaterial
                    key={tex ? 'std-with-map' : 'std-no-map'}
                    color={color}
                    map={tex ?? null}
                    metalness={metalness ?? 0}
                    roughness={roughness ?? 1}
                />
            </mesh>
        </group>
    )
}