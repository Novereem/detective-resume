import React from 'react'
import { ThreeElements, useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import { Outlined } from '@/components/Primitives/Outlined'
import * as THREE from 'three'
import {Vec3} from "@/components/Types/room";
import {InspectState, OutlinedGroupInspect} from "@/components/Types/inspectModels";

export type PartSpec = {
    id?: string
    geometry: React.ReactElement
    color?: string
    outlineColor?: string
    hoverColor?: string
    outlineScale?: number
    outlineThickness?: number
    worldThickness?: number
    boundingRadius?: number
    position?: Vec3
    rotation?: Vec3
    scale?: number | Vec3
    textureUrl?: string
    texturePixelated?: boolean
    metalness?: number
    roughness?: number
    transparent?: boolean
    opacity?: number
    depthWrite?: boolean
    side?: THREE.Side
    castShadow?: boolean
    receiveShadow?: boolean
}

export type PartMaterialOverride = {
    color?: string
    outlineColor?: string
    textureUrl?: string
    texturePixelated?: boolean
    metalness?: number
    roughness?: number
    transparent?: boolean
    opacity?: number
    depthWrite?: boolean
    side?: THREE.Side
}

type ModelGroupProps = ThreeElements['group'] & {
    parts: PartSpec[]
    hitbox?: { size: Vec3; center?: Vec3 }
    color?: string
    outlineColor?: string
    hoverColor?: string
    onInspect?: (payload: InspectState) => void
    inspectPixelSize?: number
    initialRotation?: Vec3
    inspectDistance?: number
    disablePointer?: boolean
    outlineThickness?: number
    outlineWorldThickness?: number
    outlineScale?: number
    materialsById?: Record<string, PartMaterialOverride>
    disableOutline?: boolean
    inspectDisableOutline?: boolean
    visualizeHitbox?: boolean
    visualizeColor?: string
    castShadowDefault?: boolean
    receiveShadowDefault?: boolean
}

type BoxSpec = { size: Vec3; center: Vec3 }

const _v = new THREE.Vector3()
const _mat = new THREE.Matrix4()
const _inv = new THREE.Matrix4()

function computeTightLocalBox(partsRoot: THREE.Object3D, localRoot: THREE.Object3D): BoxSpec | null {
    localRoot.updateWorldMatrix(true, true)
    partsRoot.updateWorldMatrix(true, true)

    const inv = _inv.copy(localRoot.matrixWorld).invert()
    const localBox = new THREE.Box3()
    let hasAny = false

    partsRoot.traverse((obj: any) => {
        if (!obj?.isMesh || !obj.visible || obj.userData?.noBounds || /outline|hitbox|helper/i.test(obj.name || '')) return

        const geom: THREE.BufferGeometry = obj.geometry
        if (!geom) return

        if (!geom.boundingBox) geom.computeBoundingBox()
        const bb = geom.boundingBox
        if (!bb || bb.isEmpty()) return

        const toLocal = _mat.multiplyMatrices(inv, obj.matrixWorld)
        const meshBoxLocal = bb.clone().applyMatrix4(toLocal)

        if (!hasAny) {
            localBox.copy(meshBoxLocal)
            hasAny = true
        } else {
            localBox.union(meshBoxLocal)
        }
    })

    if (!hasAny || localBox.isEmpty()) return null

    const sizeV = localBox.getSize(_v)
    const centerV = localBox.getCenter(new THREE.Vector3())

    return {
        size: [sizeV.x, sizeV.y, sizeV.z],
        center: [centerV.x, centerV.y, centerV.z],
    }
}

export function ModelGroup({
                               parts,
                               hitbox,
                               color = '#808080',
                               outlineColor = '#ffffff',
                               hoverColor = '#ff3b30',
                               onInspect,
                               inspectPixelSize,
                               initialRotation = [0, 0, 0],
                               disablePointer = false,
                               outlineThickness,
                               outlineWorldThickness,
                               outlineScale = 1.035,
                               inspectDistance,
                               materialsById,
                               disableOutline = false,
                               inspectDisableOutline = false,
                               visualizeHitbox = false,
                               visualizeColor = '#00ffff',
                               castShadowDefault = true,
                               receiveShadowDefault = true,
                               ...groupProps
                           }: ModelGroupProps) {
    const [hovered, setHovered] = React.useState(false)
    useCursor(!disablePointer && hovered)

    const groupRef = React.useRef<THREE.Group>(null)
    const partsRef = React.useRef<THREE.Group>(null)

    const groupThickness = outlineThickness ?? outlineWorldThickness
    const resolveScale = React.useCallback(
        (p: PartSpec) => {
            if (p.outlineScale != null) return p.outlineScale
            if (outlineScale != null) return outlineScale
            const t = p.outlineThickness ?? p.worldThickness ?? groupThickness
            if (t != null && p.boundingRadius != null) return 1 + t / p.boundingRadius
            return 1.035
        },
        [groupThickness, outlineScale]
    )

    const payload = React.useMemo<OutlinedGroupInspect>(
        () => ({
            kind: 'outlinedGroup',
            initialRotation,
            pixelSize: inspectPixelSize,
            inspectDistance,
            inspectDisableOutline,
            parts: parts.map((p) => {
                const ov = p.id ? materialsById?.[p.id] : undefined
                return {
                    geometry: p.geometry,
                    color: ov?.color ?? p.color ?? color,
                    outlineColor: ov?.outlineColor ?? p.outlineColor ?? outlineColor,
                    outlineScale: resolveScale(p),
                    position: p.position,
                    rotation: p.rotation,
                    scale: p.scale,
                    textureUrl: ov?.textureUrl ?? p.textureUrl,
                    texturePixelated: ov?.texturePixelated ?? p.texturePixelated,
                    metalness: ov?.metalness ?? p.metalness,
                    roughness: ov?.roughness ?? p.roughness,
                }
            }),
        }),
        [parts, color, outlineColor, initialRotation, inspectPixelSize, inspectDistance, resolveScale, materialsById, inspectDisableOutline]
    )

    const useHitbox = !!hitbox
    const [autoBox, setAutoBox] = React.useState<BoxSpec | null>(null)

    useFrame(({ clock }) => {
        if ((clock.getElapsedTime() * 6) % 1 > 0.02) return
        if (!!hitbox || !partsRef.current || !groupRef.current) return

        const next = computeTightLocalBox(partsRef.current, groupRef.current)
        if (!next) return

        const prev = autoBox
        const eps = 1e-4
        const same =
            !!prev &&
            Math.abs(prev.center[0] - next.center[0]) < eps &&
            Math.abs(prev.center[1] - next.center[1]) < eps &&
            Math.abs(prev.center[2] - next.center[2]) < eps &&
            Math.abs(prev.size[0]   - next.size[0])   < eps &&
            Math.abs(prev.size[1]   - next.size[1])   < eps &&
            Math.abs(prev.size[2]   - next.size[2])   < eps

        if (!same) setAutoBox(next)
    })

    const { onPointerDown, ...restGroupProps } = groupProps as any

    const autoHandlers =
        !disablePointer && !useHitbox
            ? {
                onPointerOver: (e: any) => { e.stopPropagation(); setHovered(true) },
                onPointerOut:  (e: any) => { e.stopPropagation(); setHovered(false) },
                onClick:       (e: any) => { e.stopPropagation(); onInspect?.(payload) },
                onPointerDown,
            }
            : {}

    const showManualProxy = useHitbox && !!hitbox && !disablePointer
    const showManualViz   = useHitbox && !!hitbox && visualizeHitbox
    const showAutoProxy = !useHitbox && !!autoBox && !disablePointer
    const showAutoViz   = !useHitbox && !!autoBox && visualizeHitbox

    return (
        <group ref={groupRef} {...restGroupProps}>
            {showManualProxy && (
                <mesh
                    name="__manual_hitbox_interaction"
                    userData={{noBounds: true}}
                    position={hitbox!.center ?? [0, 0, 0]}
                    onPointerOver={(e: any) => {
                        e.stopPropagation();
                        setHovered(true)
                    }}
                    onPointerOut={(e: any) => {
                        e.stopPropagation();
                        setHovered(false)
                    }}
                    onClick={(e: any) => {
                        e.stopPropagation();
                        onInspect?.(payload)
                    }}
                    onPointerDown={onPointerDown}
                >
                    <boxGeometry args={hitbox!.size}/>
                    <meshBasicMaterial
                        transparent
                        opacity={visualizeHitbox ? 0.2 : 0}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        color={visualizeHitbox ? visualizeColor : '#ffffff'}
                    />
                </mesh>
            )}
            {showManualViz && !showManualProxy && (
                <mesh
                    name="__manual_hitbox_vis"
                    userData={{ noBounds: true }}
                    raycast={() => null}
                    position={hitbox!.center ?? [0, 0, 0]}
                >
                    <boxGeometry args={hitbox!.size} />
                    <meshBasicMaterial transparent opacity={0.2} depthWrite={false} />
                </mesh>
            )}

                    <group ref={partsRef} {...autoHandlers}>
                        {parts.map((p, i) => {
                            const ov = p.id ? materialsById?.[p.id] : undefined
                            const effColor = ov?.color ?? p.color ?? color
                            const effOutline = ov?.outlineColor ?? p.outlineColor ?? outlineColor
                            const effTex = ov?.textureUrl ?? p.textureUrl
                            const effPix = ov?.texturePixelated ?? p.texturePixelated
                            const effMetal = ov?.metalness ?? p.metalness
                            const effRough = ov?.roughness ?? p.roughness
                            const effTransparent = ov?.transparent ?? p.transparent
                            const effOpacity     = ov?.opacity ?? p.opacity
                            const effDepthWrite  = ov?.depthWrite ?? p.depthWrite
                            const effSide        = ov?.side ?? p.side
                            const effCast = p.castShadow ?? castShadowDefault
                            const effReceive = p.receiveShadow ?? receiveShadowDefault
                            return (
                                <Outlined
                                    key={i}
                                    disablePointer={disablePointer}
                                    hovered={!disablePointer && hovered}
                                    geometry={p.geometry}
                                    color={effColor}
                                    outlineColor={effOutline}
                                    hoverColor={p.hoverColor ?? hoverColor}
                                    outlineScale={resolveScale(p)}
                                    position={p.position}
                                    rotation={p.rotation}
                                    scale={p.scale}
                                    textureUrl={effTex}
                                    texturePixelated={effPix}
                                    metalness={effMetal}
                                    roughness={effRough}
                                    disableOutline={disableOutline}
                                    transparent={effTransparent}
                                    opacity={effOpacity}
                                    depthWrite={effDepthWrite}
                                    side={effSide}
                                    castShadow={effCast}
                                    receiveShadow={effReceive}
                                />
                            )
                        })}
                    </group>

                    {showAutoProxy && (
                        <mesh
                            name="__auto_hitbox_interaction"
                            userData={{noBounds: true}}
                            position={autoBox.center as Vec3}
                            onPointerOver={(e: any) => {
                                e.stopPropagation();
                                setHovered(true)
                            }}
                            onPointerOut={(e: any) => {
                                e.stopPropagation();
                                setHovered(false)
                            }}
                            onClick={(e: any) => {
                                e.stopPropagation();
                                onInspect?.(payload)
                            }}
                            onPointerDown={onPointerDown}
                        >
                            <boxGeometry args={autoBox.size as Vec3}/>
                            <meshBasicMaterial transparent opacity={visualizeHitbox ? 0.2 : 0} depthWrite={false}/>
                        </mesh>
                    )}

                    {showAutoViz && !showAutoProxy && (
                        <mesh
                            name="__auto_hitbox_vis"
                            userData={{noBounds: true}}
                            raycast={() => null}
                            position={autoBox.center as Vec3}
                        >
                            <boxGeometry args={autoBox.size as Vec3}/>
                            <meshBasicMaterial transparent opacity={0.2} depthWrite={false}/>
                        </mesh>
                    )}
                </group>
            )
            }
