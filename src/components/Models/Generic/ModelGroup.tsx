import React from 'react'
import { ThreeElements, useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import { Outlined } from '@/components/Primitives/Outlined'
import { InspectState, OutlinedGroupInspect, Vec3 } from '@/shaders/inspectTypes'
import * as THREE from 'three'

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
}

export type PartMaterialOverride = {
    color?: string
    outlineColor?: string
    textureUrl?: string
    texturePixelated?: boolean
    metalness?: number
    roughness?: number
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
            const t = p.outlineThickness ?? p.worldThickness ?? groupThickness
            if (t != null && p.boundingRadius != null) return 1 + t / p.boundingRadius
            return outlineScale
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

    const bind = disablePointer
        ? {}
        : {
            onPointerOver: (e: any) => { e.stopPropagation(); setHovered(true) },
            onPointerOut:  (e: any) => { e.stopPropagation(); setHovered(false) },
            onClick:       (e: any) => { e.stopPropagation(); onInspect?.(payload) },
        }

    const useHitbox = !!hitbox

    const [autoBox, setAutoBox] = React.useState<{ size: Vec3; center: Vec3 } | null>(null)
    useFrame(() => {
        if (!visualizeHitbox || useHitbox || !partsRef.current || !groupRef.current) return
        const box = new THREE.Box3().setFromObject(partsRef.current)
        if (!box.isEmpty()) {
            const size = box.getSize(new THREE.Vector3())
            const centerW = box.getCenter(new THREE.Vector3())
            const center = groupRef.current.worldToLocal(centerW.clone())
            setAutoBox({ size: [size.x, size.y, size.z], center: [center.x, center.y, center.z] })
        }
    })

    const { onPointerDown, ...restGroupProps } = groupProps as any

    return (
        <group ref={groupRef} {...restGroupProps} {...bind}>
            {useHitbox && hitbox && (
                <mesh
                    position={hitbox.center ?? [0, 0, 0]}
                    onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true) }}
                    onPointerOut={(e: any)  => { e.stopPropagation(); setHovered(false) }}
                    onClick={(e: any)       => { e.stopPropagation(); onInspect?.(payload) }}
                    onPointerDown={onPointerDown}
                >
                    <boxGeometry args={hitbox.size} />
                    <meshBasicMaterial
                        transparent
                        opacity={visualizeHitbox ? 0.2 : 0}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        color={visualizeHitbox ? visualizeColor : '#ffffff'}
                    />
                </mesh>
            )}

            <group ref={partsRef}>
                {parts.map((p, i) => {
                    const ov = p.id ? materialsById?.[p.id] : undefined
                    const effColor = ov?.color ?? p.color ?? color
                    const effOutline = ov?.outlineColor ?? p.outlineColor ?? outlineColor
                    const effTex = ov?.textureUrl ?? p.textureUrl
                    const effPix = ov?.texturePixelated ?? p.texturePixelated
                    const effMetal = ov?.metalness ?? p.metalness
                    const effRough = ov?.roughness ?? p.roughness
                    return (
                        <Outlined
                            key={i}
                            disablePointer={useHitbox || disablePointer}
                            hovered={!disablePointer && hovered && useHitbox}
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
                        />
                    )
                })}
            </group>

            {!useHitbox && visualizeHitbox && autoBox && (
                <mesh raycast={() => null} position={autoBox.center as Vec3}>
                    <boxGeometry args={autoBox.size as Vec3} />
                    <meshBasicMaterial transparent opacity={0.2} depthWrite={false} color={visualizeColor} />
                </mesh>
            )}
        </group>
    )
}
