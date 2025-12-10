import * as THREE from 'three'
import React from 'react'
import { useCursor } from '@react-three/drei'
import type { InspectState, FramedInspect } from '@/components/Types/inspectModels'
import { useManagedTexture } from '@/components/Textures/useManagedTexture'
import MagnifierRevealMaterial from '@/components/CameraEffects/Magnifier/MagnifierRevealMaterial'
import { useMagnifierState } from '@/components/CameraEffects/Magnifier/MagnifierStateContext'
import { useThree } from '@react-three/fiber'

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
    textureMagnifierOnly?: boolean
}

/**
 * Textured framed plane (poster / screen) with optional frame and inspect behavior.
 *
 * Responsibilities:
 * - Render a flat plane with configurable border, frame color and metalness/roughness.
 * - Load and apply a texture via `useManagedTexture` with configurable fit and sampling.
 * - Emit a `FramedInspect` payload via `onInspect` when interacted with.
 * - Optionally limit visibility / interaction to the magnifier (`textureMagnifierOnly`).
 * - Provide a dev-pickable hitbox for editor-style object selection.
 *
 * Used for paintings, posters, monitors and other flat textured surfaces.
 */
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
                                devPickable = true,
                                textureMagnifierOnly = false,
                            }: FramedPlaneProps) {
    const [hovered, setHovered] = React.useState(false)
    useCursor(canInteract && hovered)

    const framePolyProps = frameDepthBias
        ? ({ polygonOffset: true as const, polygonOffsetFactor: 1, polygonOffsetUnits: 1 } as const)
        : {}

    const side = doubleSide ? THREE.DoubleSide : THREE.FrontSide
    const frameColor = canInteract && hovered ? hoverColor : borderColor
    const hasFrame = border > 0

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

    const payload = React.useMemo<FramedInspect>(
        () => ({
            kind: 'framed',
            width,
            height,
            color,
            borderColor,
            border,
            doubleSide,
            textureUrl,
            textureFit,
            texturePixelated,
            textureZ,
            inspectDistance,
            ...inspectOverrides,
        }),
        [
            width,
            height,
            color,
            borderColor,
            border,
            doubleSide,
            textureUrl,
            textureFit,
            texturePixelated,
            textureZ,
            inspectOverrides,
            inspectDistance,
        ],
    )

    const handleOver = (e: any) => {
        e.stopPropagation()
        if (textureMagnifierOnly && !isUnderMagnifier()) return
        setHovered(true)
    }
    const handleOut = (e: any) => {
        e.stopPropagation()
        setHovered(false)
    }
    const handleClick = (e: any) => {
        e.stopPropagation()
        if (textureMagnifierOnly && !isUnderMagnifier()) return
        onInspect?.(payload)
    }

    const matKind = lit ? shading : 'basic'

    const hitWidth = width + 2 * (hasFrame ? border : 0)
    const hitHeight = height + 2 * (hasFrame ? border : 0)

    const groupRef = React.useRef<THREE.Group | null>(null)
    const { camera } = useThree()
    const { lensMaskRef, held } = useMagnifierState()

    const isUnderMagnifier = React.useCallback(() => {
        if (!textureMagnifierOnly) return true

        const mask = lensMaskRef.current
        if (!held || !mask.active || !groupRef.current) return false

        const centerWorld = new THREE.Vector3()
        groupRef.current.getWorldPosition(centerWorld)

        const ndc = centerWorld.clone().project(camera as THREE.PerspectiveCamera)
        const persp = camera as THREE.PerspectiveCamera
        const aspect = persp.aspect || 1

        const lensX = mask.origin[0]
        const lensY = mask.origin[1]

        let dx = ndc.x - lensX
        let dy = ndc.y - lensY
        dx *= aspect

        const d = Math.sqrt(dx * dx + dy * dy)
        const extra = 0.05

        return d <= mask.radius + extra
    }, [textureMagnifierOnly, lensMaskRef, held, camera])

    return (
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            {!textureMagnifierOnly && (
                <mesh raycast={() => null} castShadow={lit && castShadow} receiveShadow={lit && receiveShadow}>
                    <planeGeometry args={[width, height]} />
                    {matKind === 'basic' && <meshBasicMaterial color={color} side={side} />}
                    {matKind === 'lambert' && <meshLambertMaterial color={color} side={side} />}
                    {matKind === 'standard' && (
                        <meshStandardMaterial
                            color={color}
                            side={side}
                            metalness={metalness}
                            roughness={roughness}
                            envMapIntensity={envMapIntensity}
                        />
                    )}
                </mesh>
            )}

            {tex && (
                <mesh position={[0, 0, textureZ]} raycast={() => null} receiveShadow={lit && receiveShadow}>
                    <planeGeometry args={finalArtSize} />
                    {textureMagnifierOnly ? (
                        <MagnifierRevealMaterial
                            map={tex}
                            color="#ffffff"
                            side={side}
                            metalness={0}
                            roughness={1}
                        />
                    ) : (
                        <>
                            {matKind === 'basic' && (
                                <meshBasicMaterial map={tex} toneMapped={false} side={side} />
                            )}
                            {matKind === 'lambert' && <meshLambertMaterial map={tex} side={side} />}
                            {matKind === 'standard' && (
                                <meshStandardMaterial
                                    map={tex}
                                    side={side}
                                    metalness={0}
                                    roughness={1}
                                    envMapIntensity={envMapIntensity}
                                />
                            )}
                        </>
                    )}
                </mesh>
            )}

            {hasFrame && !textureMagnifierOnly && (
                <>
                    {/* Top */}
                    <mesh
                        raycast={() => null}
                        position={[0, height / 2 + border / 2, frameZ]}
                        receiveShadow={false}
                    >
                        <planeGeometry args={[width + 2 * border, border]} />
                        <meshBasicMaterial
                            color={frameColor}
                            side={side}
                            toneMapped={false}
                            {...framePolyProps}
                        />
                    </mesh>

                    {/* Bottom */}
                    <mesh
                        raycast={() => null}
                        position={[0, -height / 2 - border / 2, frameZ]}
                        receiveShadow={false}
                    >
                        <planeGeometry args={[width + 2 * border, border]} />
                        <meshBasicMaterial
                            color={frameColor}
                            side={side}
                            toneMapped={false}
                            {...framePolyProps}
                        />
                    </mesh>

                    {/* Left */}
                    <mesh
                        raycast={() => null}
                        position={[-width / 2 - border / 2, 0, frameZ]}
                        receiveShadow={false}
                    >
                        <planeGeometry args={[border, height]} />
                        <meshBasicMaterial
                            color={frameColor}
                            side={side}
                            toneMapped={false}
                            {...framePolyProps}
                        />
                    </mesh>

                    {/* Right */}
                    <mesh
                        raycast={() => null}
                        position={[width / 2 + border / 2, 0, frameZ]}
                        receiveShadow={false}
                    >
                        <planeGeometry args={[border, height]} />
                        <meshBasicMaterial
                            color={frameColor}
                            side={side}
                            toneMapped={false}
                            {...framePolyProps}
                        />
                    </mesh>
                </>
            )}

            {/* Invisible hitbox for interaction / dev picking */}
            {(canInteract || devPickable) && (
                <mesh
                    position={[0, 0, Math.max(textureZ, 0) + 0.002]}
                    onPointerOver={handleOver}
                    onPointerOut={handleOut}
                    onClick={handleClick}
                >
                    <planeGeometry args={[hitWidth, hitHeight]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
                </mesh>
            )}
        </group>
    )
}