import * as THREE from 'three'
import React from 'react'
import { useCursor } from '@react-three/drei'
import { InspectState, FramedInspect } from './inspectTypes'
import { useManagedTexture } from './useManagedTexture'

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
    textureUrl?: string
    textureFit?: 'cover' | 'contain' | 'stretch'
    texturePixelated?: boolean
    textureZ?: number
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
                                position,
                                rotation,
                                scale,
                                textureUrl,
                                textureFit = 'contain',
                                texturePixelated = false,
                                textureZ = 0.001,
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
        if (!tex || !tex.image || textureFit === 'stretch') return [width, height]
        const tw = tex.image.width || 1
        const th = tex.image.height || 1
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
        textureUrl, textureFit, texturePixelated, textureZ,
        ...inspectOverrides,
    }), [width, height, color, borderColor, border, doubleSide,
        textureUrl, textureFit, texturePixelated, textureZ, inspectOverrides])

    const handleOver  = (e: any) => { e.stopPropagation(); setHovered(true) }
    const handleOut   = (e: any) => { e.stopPropagation(); setHovered(false) }
    const handleClick = (e: any) => { e.stopPropagation(); onInspect?.(payload) }

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <mesh raycast={() => null}>
                <planeGeometry args={[width, height]}/>
                <meshBasicMaterial color={color} side={side}/>
            </mesh>

            {/* optional texture */}
            {tex && (
                <mesh position={[0, 0, textureZ]} raycast={() => null}>
                    <planeGeometry args={artSize}/>
                    <meshBasicMaterial map={tex} toneMapped={false} side={side}/>
                </mesh>
            )}

            {/* frame */}
            <mesh raycast={() => null} position={[0, height / 2 + border / 2, 0]}>
                <planeGeometry args={[width + 2 * border, border]}/>
                <meshBasicMaterial color={frameColor} side={side}/>
            </mesh>
            <mesh raycast={() => null} position={[0, -height / 2 - border / 2, 0]}>
                <planeGeometry args={[width + 2 * border, border]}/>
                <meshBasicMaterial color={frameColor} side={side}/>
            </mesh>
            <mesh raycast={() => null} position={[-width / 2 - border / 2, 0, 0]}>
                <planeGeometry args={[border, height]}/>
                <meshBasicMaterial color={frameColor} side={side}/>
            </mesh>
            <mesh raycast={() => null} position={[width / 2 + border / 2, 0, 0]}>
                <planeGeometry args={[border, height]}/>
                <meshBasicMaterial color={frameColor} side={side}/>
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
