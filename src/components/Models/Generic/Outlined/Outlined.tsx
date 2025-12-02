import * as THREE from 'three'
import React from 'react'
import { useCursor } from '@react-three/drei'
import type { InspectState, OutlinedInspect } from '@/components/Types/inspectModels'
import { useManagedTexture } from '@/components/Textures/useManagedTexture'
import MagnifierRevealMaterial from '@/components/CameraEffects/Magnifier/MagnifierRevealMaterial'
import { useFrame, useThree } from '@react-three/fiber'
import { useMagnifierState } from '@/components/CameraEffects/Magnifier/MagnifierStateContext'

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
    transparent?: boolean
    opacity?: number
    depthWrite?: boolean
    side?: THREE.Side
    castShadow?: boolean
    receiveShadow?: boolean
    magnifierRevealMaterial?: boolean
}

/**
 * Single outlined mesh with optional texture, inspect behavior and magnifier support.
 *
 * Responsibilities:
 * - Wrap an arbitrary geometry in a mesh + outline mesh.
 * - Track hover state to drive cursor and hover/outline styling.
 * - Emit an `OutlinedInspect` payload via `onInspect` when clicked.
 * - Load an optional texture through `useManagedTexture` with pixel-art friendly options.
 * - Optionally render with `MagnifierRevealMaterial` when `magnifierRevealMaterial` is enabled.
 *
 * Used both directly and via `ModelGroup` for most detective-room meshes.
 */
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
                             inspectOverrides = { initialRotation: [0.2, 0.6, 0] },
                             hovered,
                             disablePointer = false,
                             textureUrl,
                             texturePixelated,
                             metalness,
                             roughness,
                             disableOutline = false,
                             transparent = false,
                             opacity = 1,
                             depthWrite = true,
                             side,
                             castShadow = true,
                             receiveShadow = true,
                             magnifierRevealMaterial = false,
                         }: OutlinedProps) {
    const [localHover, setLocalHover] = React.useState(false)
    const isHover = hovered !== undefined ? hovered : localHover

    const meshRef = React.useRef<THREE.Mesh | null>(null)
    const outlineMatRef = React.useRef<THREE.MeshBasicMaterial | null>(null)
    const visibleForShadowRef = React.useRef<boolean>(!magnifierRevealMaterial)

    const { camera } = useThree()
    const { lensMaskRef } = useMagnifierState()

    const tmp = React.useMemo(
        () => ({
            center: new THREE.Vector3(),
        }),
        []
    )

    const tex = useManagedTexture(textureUrl, {
        minFilter: texturePixelated ? THREE.NearestFilter : THREE.LinearFilter,
        magFilter: texturePixelated ? THREE.NearestFilter : THREE.LinearFilter,
        generateMipmaps: !texturePixelated,
    })

    useFrame(() => {
        if (!magnifierRevealMaterial) {
            visibleForShadowRef.current = true
        } else {
            const mesh = meshRef.current
            if (!mesh) {
                visibleForShadowRef.current = false
            } else {
                const mask = lensMaskRef.current
                if (!mask || !mask.active) {
                    visibleForShadowRef.current = false
                    mesh.castShadow = false
                } else {
                    const { center } = tmp
                    mesh.getWorldPosition(center)

                    const persp = camera as THREE.PerspectiveCamera
                    const ndc = center.clone().project(persp)
                    const aspect = persp.aspect || 1

                    const lensX = mask.origin[0]
                    const lensY = mask.origin[1]

                    let dx = ndc.x - lensX
                    let dy = ndc.y - lensY
                    dx *= aspect

                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const maxR = mask.radius + 0.05

                    const visible = dist <= maxR

                    visibleForShadowRef.current = visible
                    mesh.castShadow = visible
                }
            }
        }

        if (!magnifierRevealMaterial) return

        const outlineMat = outlineMatRef.current as any
        const shader = outlineMat?.userData?.maskShader
        if (!shader) return

        const mask = lensMaskRef.current
        const persp = camera as THREE.PerspectiveCamera

        if (!mask || !mask.active) {
            shader.uniforms.uMaskActive.value = 0
        } else {
            shader.uniforms.uMaskActive.value = 1
            shader.uniforms.uMaskOrigin.value.fromArray(mask.origin)
            shader.uniforms.uMaskRadius.value = mask.radius
            shader.uniforms.uAspect.value = persp.aspect || 1
        }
    })

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
                onPointerOver: (e: any) => {
                    e.stopPropagation()
                    setLocalHover(true)
                },
                onPointerOut: (e: any) => {
                    e.stopPropagation()
                    setLocalHover(false)
                },
                onClick: handleClick,
            }
            : {}

    const effTransparent = !!transparent
    const effOpacity = opacity ?? 1
    const effDepthWrite = depthWrite ?? !effTransparent
    const effSide = side ?? THREE.FrontSide

    const showOutline = !disableOutline

    return (
        <group position={position} rotation={rotation} scale={scale} {...bind}>
            <mesh
                ref={meshRef}
                renderOrder={0}
                castShadow={castShadow}
                receiveShadow={receiveShadow}
            >
                {React.cloneElement(geometry)}
                {magnifierRevealMaterial ? (
                    <MagnifierRevealMaterial
                        color={color}
                        map={tex ?? null}
                        metalness={metalness ?? 0}
                        roughness={roughness ?? 1}
                        transparent={effTransparent}
                        opacity={effOpacity}
                        depthWrite={effDepthWrite}
                        side={effSide}
                    />
                ) : (
                    <meshStandardMaterial
                        key={tex ? 'std-with-map' : 'std-no-map'}
                        color={color}
                        map={tex ?? null}
                        metalness={metalness ?? 0}
                        roughness={roughness ?? 1}
                        transparent={effTransparent}
                        opacity={effOpacity}
                        depthWrite={effDepthWrite}
                        side={effSide}
                    />
                )}
            </mesh>

            {showOutline && (
                <group scale={outlineScale} renderOrder={10}>
                    <mesh raycast={() => null}>
                        {React.cloneElement(geometry)}
                        {magnifierRevealMaterial ? (
                            <meshBasicMaterial
                                ref={outlineMatRef}
                                color={currentOutline}
                                side={THREE.BackSide}
                                polygonOffset
                                polygonOffsetFactor={1}
                                polygonOffsetUnits={1}
                                depthTest={true}
                                depthWrite={false}
                                onBeforeCompile={(shader: any) => {
                                    shader.uniforms.uMaskActive = { value: 0 }
                                    shader.uniforms.uMaskOrigin = {
                                        value: new THREE.Vector3(),
                                    }
                                    shader.uniforms.uMaskRadius = { value: 0.25 }
                                    shader.uniforms.uAspect = { value: 1 }

                                    shader.vertexShader =
                                        'varying vec4 vClipPosition;\n' +
                                        shader.vertexShader

                                    shader.vertexShader = shader.vertexShader.replace(
                                        '#include <project_vertex>',
                                        `
                                        #include <project_vertex>
                                        vClipPosition = gl_Position;
                                    `
                                    )

                                    shader.fragmentShader =
                                        `
                                        varying vec4 vClipPosition;
                                        uniform float uMaskActive;
                                        uniform vec3 uMaskOrigin;
                                        uniform float uMaskRadius;
                                        uniform float uAspect;
                                    ` + shader.fragmentShader

                                    shader.fragmentShader =
                                        shader.fragmentShader.replace(
                                            'void main() {',
                                            `
                                            void main() {
                                                if (uMaskActive < 0.5) {
                                                    discard;
                                                }
                                                vec3 ndc = vClipPosition.xyz / vClipPosition.w;
                                                vec2 fragNdc = ndc.xy;
                                                vec2 lensNdc = uMaskOrigin.xy;
                                                vec2 diff = fragNdc - lensNdc;
                                                diff.x *= uAspect;
                                                float d = length(diff);
                                                if (d > uMaskRadius) {
                                                    discard;
                                                }
                                        `
                                        )

                                    if (outlineMatRef.current) {
                                        ;(outlineMatRef.current as any).userData.maskShader =
                                            shader
                                    }
                                }}
                            />
                        ) : (
                            <meshBasicMaterial
                                color={currentOutline}
                                side={THREE.BackSide}
                                polygonOffset
                                polygonOffsetFactor={1}
                                polygonOffsetUnits={1}
                                depthTest={true}
                                depthWrite={false}
                            />
                        )}
                    </mesh>
                </group>
            )}
        </group>
    )
}
