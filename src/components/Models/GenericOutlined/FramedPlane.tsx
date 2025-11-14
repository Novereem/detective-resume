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
    frameZ?: number
    frameDepthBias?: boolean
    textureRepeat?: [number, number]
    textureOffset?: [number, number]
    textureRotation?: number
    textureCenter?: [number, number]
    shading?: 'basic' | 'lambert' | 'standard'
    envMapIntensity?: number
    castShadow?: boolean
    devPickable?: boolean
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
                                frameZ = 0,
                                frameDepthBias = true,
                                textureRepeat,
                                textureOffset,
                                textureRotation,
                                textureCenter,
                                shading = 'standard',
                                envMapIntensity = 1,
                                castShadow = false,
                                devPickable=true,
                            }: FramedPlaneProps) {
    const [hovered, setHovered] = React.useState(false)
    useCursor(canInteract && hovered)

    const framePolyProps = frameDepthBias
        ? ({ polygonOffset: true as const, polygonOffsetFactor: 1, polygonOffsetUnits: 1 } as const)
        : {}

    const side = doubleSide ? THREE.DoubleSide : THREE.FrontSide
    const frameColor = canInteract && hovered ? hoverColor : borderColor

    const tex = useManagedTexture(textureUrl, {
        minFilter: texturePixelated ? THREE.NearestFilter : THREE.LinearFilter,
        magFilter: texturePixelated ? THREE.NearestFilter : THREE.LinearFilter,
        generateMipmaps: !texturePixelated,
    })

    React.useEffect(() => {
        if (!tex) return
        if (textureRepeat) {
            tex.wrapS = THREE.RepeatWrapping
            tex.wrapT = THREE.RepeatWrapping
            tex.repeat.set(textureRepeat[0], textureRepeat[1])
        } else {
            tex.wrapS = THREE.ClampToEdgeWrapping
            tex.wrapT = THREE.ClampToEdgeWrapping
            tex.repeat.set(1, 1)
        }
        if (textureOffset) tex.offset.set(textureOffset[0], textureOffset[1])
        if (typeof textureRotation === 'number') tex.rotation = textureRotation
        if (textureCenter) tex.center.set(textureCenter[0], textureCenter[1])
        tex.needsUpdate = true
    }, [tex, textureRepeat, textureOffset, textureRotation, textureCenter])

    const fittedSize = React.useMemo<[number, number]>(() => {
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

    const finalArtSize = React.useMemo<[number, number]>(() => {
        if (textureRepeat) return [width, height]
        return fittedSize
    }, [textureRepeat, fittedSize, width, height])

    const payload = React.useMemo<FramedInspect>(() => ({
        kind: 'framed',
        width, height, color, borderColor, border, doubleSide,
        textureUrl, textureFit, texturePixelated, textureZ, inspectDistance,
        ...inspectOverrides,
    }), [width, height, color, borderColor, border, doubleSide, textureUrl, textureFit, texturePixelated, textureZ, inspectOverrides, inspectDistance])

    const handleOver = (e: any) => { e.stopPropagation(); setHovered(true) }
    const handleOut  = (e: any) => { e.stopPropagation(); setHovered(false) }
    const handleClick = (e: any) => { e.stopPropagation(); onInspect?.(payload) }

    const matKind = lit ? shading : 'basic'

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <mesh
                raycast={() => null}
                castShadow={lit && castShadow}
                receiveShadow={lit && receiveShadow}
            >
                <planeGeometry args={[width, height]} />
                {matKind === 'basic'    && <meshBasicMaterial   color={color} side={side} />}
                {matKind === 'lambert'  && <meshLambertMaterial color={color} side={side} />}
                {matKind === 'standard' && <meshStandardMaterial color={color} side={side} metalness={metalness} roughness={roughness} envMapIntensity={envMapIntensity} />}
            </mesh>

            {tex && (
                <mesh
                    position={[0, 0, textureZ]}
                    raycast={() => null}
                    receiveShadow={lit && receiveShadow}
                >
                    <planeGeometry args={finalArtSize} />
                    {matKind === 'basic'    && <meshBasicMaterial   map={tex} toneMapped={false} side={side} />}
                    {matKind === 'lambert'  && <meshLambertMaterial map={tex} side={side} />}
                    {matKind === 'standard' && <meshStandardMaterial map={tex} side={side} metalness={0} roughness={1} envMapIntensity={envMapIntensity} />}
                </mesh>
            )}

            <mesh raycast={() => null} position={[0, height / 2 + border / 2, frameZ]} receiveShadow={lit && receiveShadow}>
                <planeGeometry args={[width + 2 * border, border]}/>
                {matKind === 'basic' && <meshBasicMaterial color={frameColor} side={side} {...framePolyProps} />}
                {matKind === 'lambert' && <meshLambertMaterial color={frameColor} side={side} {...framePolyProps} />}
                {matKind === 'standard' && <meshStandardMaterial color={frameColor} side={side} metalness={frameMetalness} roughness={frameRoughness} envMapIntensity={envMapIntensity} {...framePolyProps} />}
            </mesh>

            <mesh raycast={() => null} position={[0, -height / 2 - border / 2, frameZ]} receiveShadow={lit && receiveShadow}>
                <planeGeometry args={[width + 2 * border, border]}/>
                {matKind === 'basic' && <meshBasicMaterial color={frameColor} side={side} {...framePolyProps} />}
                {matKind === 'lambert' && <meshLambertMaterial color={frameColor} side={side} {...framePolyProps} />}
                {matKind === 'standard' && <meshStandardMaterial color={frameColor} side={side} metalness={frameMetalness} roughness={frameRoughness} envMapIntensity={envMapIntensity} {...framePolyProps} />}
            </mesh>

            <mesh raycast={() => null} position={[-width / 2 - border / 2, 0, frameZ]} receiveShadow={lit && receiveShadow}>
                <planeGeometry args={[border, height]}/>
                {matKind === 'basic' && <meshBasicMaterial color={frameColor} side={side} {...framePolyProps} />}
                {matKind === 'lambert' && <meshLambertMaterial color={frameColor} side={side} {...framePolyProps} />}
                {matKind === 'standard' && <meshStandardMaterial color={frameColor} side={side} metalness={frameMetalness} roughness={frameRoughness} envMapIntensity={envMapIntensity} {...framePolyProps} />}
            </mesh>

            <mesh raycast={() => null} position={[width / 2 + border / 2, 0, frameZ]} receiveShadow={lit && receiveShadow}>
                <planeGeometry args={[border, height]}/>
                {matKind === 'basic' && <meshBasicMaterial color={frameColor} side={side} {...framePolyProps} />}
                {matKind === 'lambert' && <meshLambertMaterial color={frameColor} side={side} {...framePolyProps} />}
                {matKind === 'standard' && <meshStandardMaterial color={frameColor} side={side} metalness={frameMetalness} roughness={frameRoughness} envMapIntensity={envMapIntensity} {...framePolyProps} />}
            </mesh>

            {(canInteract || devPickable) && (
                <mesh position={[0, 0, Math.max(textureZ, 0) + 0.002]} onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
                    <planeGeometry args={[width + 2 * border, height + 2 * border]}/>
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
                </mesh>
            )}
        </group>
    )
}
