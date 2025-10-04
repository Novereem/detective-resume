import * as THREE from 'three'
import React from 'react'
import { useCursor } from '@react-three/drei'
import type { InspectState, FramedInspect } from '@/components/Types/inspectModels'
import { useManagedTexture } from '@/components/Textures/useManagedTexture'

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
    onInspect?: (s: InspectState) => void
    inspectOverrides?: Partial<FramedInspect>
    inspectDistance?: number
    textureUrl?: string
    textureFit?: 'cover' | 'contain' | 'stretch'
    texturePixelated?: boolean
    textureZ?: number
    lit?: boolean
    metalness?: number
    roughness?: number
    frameMetalness?: number
    frameRoughness?: number
    receiveShadow?: boolean
}

export function FramedPlane({
                                width = 1,
                                height = 1,
                                color = '#333',
                                borderColor = '#fff',
                                hoverColor = '#ff3b30',
                                border = 0.05,
                                doubleSide = true,
                                canInteract = false,
                                onInspect,
                                inspectOverrides,
                                inspectDistance,
                                position,
                                rotation,
                                scale,
                                textureUrl,
                                textureFit = 'contain',
                                texturePixelated = false,
                                textureZ = 0.001,
                                lit = false,
                                metalness = 0,
                                roughness = 1,
                                frameMetalness = 0,
                                frameRoughness = 0.8,
                                receiveShadow = true,
                            }: FramedPlaneProps) {
    const [hovered, setHovered] = React.useState(false)
    useCursor(canInteract && hovered)

    const side = doubleSide ? THREE.DoubleSide : THREE.FrontSide
    const frameColor = canInteract && hovered ? hoverColor : borderColor

    const tex = useManagedTexture(textureUrl, {
        minFilter: texturePixelated ? THREE.NearestFilter : THREE.LinearFilter,
        magFilter: texturePixelated ? THREE.NearestFilter : THREE.LinearFilter,
        generateMipmaps: !texturePixelated,
    })

    const artSize = React.useMemo<[number, number]>(() => {
        if (!tex || !('image' in tex) || !tex.image || textureFit === 'stretch') return [width, height]
        const tw = (tex.image as any).width || 1
        const th = (tex.image as any).height || 1
        const texA = tw / th
        const frameA = width / height
        if (textureFit === 'contain') {
            return frameA > texA ? [height * texA, height] : [width, width / texA]
        } else {
            return frameA > texA ? [width, width / texA] : [height * texA, height]
        }
    }, [tex, width, height, textureFit])

    const payload = React.useMemo<FramedInspect>(() => ({
        kind: 'framed',
        width, height, color, borderColor, border, doubleSide,
        textureUrl, textureFit, texturePixelated, textureZ, inspectDistance,
        ...inspectOverrides,
    }), [width, height, color, borderColor, border, doubleSide, textureUrl, textureFit, texturePixelated, textureZ, inspectOverrides, inspectDistance])

    const handleOver  = (e: any) => { e.stopPropagation(); setHovered(true) }
    const handleOut   = (e: any) => { e.stopPropagation(); setHovered(false) }
    const handleClick = (e: any) => { e.stopPropagation(); onInspect?.(payload) }

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* base panel */}
            <mesh raycast={() => null} receiveShadow={lit && receiveShadow}>
                <planeGeometry args={[width, height]} />
                {lit ? (
                    <meshStandardMaterial color={color} side={side} metalness={metalness} roughness={roughness} />
                ) : (
                    <meshBasicMaterial color={color} side={side} />
                )}
            </mesh>

            {/* texture layer */}
            {tex && (
                <mesh position={[0, 0, textureZ]} raycast={() => null} receiveShadow={lit && receiveShadow}>
                    <planeGeometry args={artSize} />
                    {lit ? (
                        <meshStandardMaterial map={tex} side={side} metalness={0} roughness={1} />
                    ) : (
                        <meshBasicMaterial map={tex} toneMapped={false} side={side} />
                    )}
                </mesh>
            )}

            {/* frame strips */}
            <mesh raycast={() => null} position={[0, height / 2 + border / 2, 0]} receiveShadow={lit && receiveShadow}>
                <planeGeometry args={[width + 2 * border, border]} />
                {lit ? (
                    <meshStandardMaterial color={frameColor} side={side} metalness={frameMetalness} roughness={frameRoughness} />
                ) : (
                    <meshBasicMaterial color={frameColor} side={side} />
                )}
            </mesh>
            <mesh raycast={() => null} position={[0, -height / 2 - border / 2, 0]} receiveShadow={lit && receiveShadow}>
                <planeGeometry args={[width + 2 * border, border]} />
                {lit ? (
                    <meshStandardMaterial color={frameColor} side={side} metalness={frameMetalness} roughness={frameRoughness} />
                ) : (
                    <meshBasicMaterial color={frameColor} side={side} />
                )}
            </mesh>
            <mesh raycast={() => null} position={[-width / 2 - border / 2, 0, 0]} receiveShadow={lit && receiveShadow}>
                <planeGeometry args={[border, height]} />
                {lit ? (
                    <meshStandardMaterial color={frameColor} side={side} metalness={frameMetalness} roughness={frameRoughness} />
                ) : (
                    <meshBasicMaterial color={frameColor} side={side} />
                )}
            </mesh>
            <mesh raycast={() => null} position={[width / 2 + border / 2, 0, 0]} receiveShadow={lit && receiveShadow}>
                <planeGeometry args={[border, height]} />
                {lit ? (
                    <meshStandardMaterial color={frameColor} side={side} metalness={frameMetalness} roughness={frameRoughness} />
                ) : (
                    <meshBasicMaterial color={frameColor} side={side} />
                )}
            </mesh>

            {canInteract && (
                <mesh
                    position={[0, 0, Math.max(textureZ, 0) + 0.002]}
                    onPointerOver={handleOver}
                    onPointerOut={handleOut}
                    onClick={handleClick}
                >
                    <planeGeometry args={[width + 2 * border, height + 2 * border]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
                </mesh>
            )}
        </group>
    )
}
