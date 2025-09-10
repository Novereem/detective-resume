'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import { Vec3 } from '@/shaders/inspectTypes'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

type LightBulbProps = Inherited & {
    bulbRadius?: number
    neckHeight?: number
    neckRadius?: number
    baseHeight?: number
    baseRadius?: number
    collarHeight?: number
    glassColor?: string
    glassTransmission?: number
    glassRoughness?: number
    glassThickness?: number
    showFilament?: boolean
    emitterColor?: string
    emitterIntensity?: number
    emitterRadiusFactor?: number
    enableLight?: boolean
    lightColor?: string
    lightIntensity?: number
    lightDistance?: number
    lightDecay?: number
    lightOffset?: Vec3
    castShadow?: boolean
}

export const LightBulb = memo(function LightBulb({
                                                     bulbRadius = 0.04,
                                                     neckHeight = 0.016,
                                                     neckRadius = 0.016,
                                                     baseHeight = 0.024,
                                                     baseRadius = 0.012,
                                                     collarHeight = 0.006,
                                                     glassColor = '#ffffff',
                                                     glassTransmission = 0.98,
                                                     glassRoughness = 0.05,
                                                     glassThickness = 0.003,
                                                     showFilament = true,
                                                     emitterColor = '#fff6c8',
                                                     emitterIntensity = 1.25,
                                                     emitterRadiusFactor = 0.55,
                                                     enableLight = true,
                                                     lightColor = '#fff6c8',
                                                     lightIntensity = 3.6,
                                                     lightDistance = 6,
                                                     lightDecay = 1.5,
                                                     lightOffset = [0, 0.0, 0],
                                                     castShadow = false,
                                                     color = '#c9c9c9',
                                                     outlineColor = '#ffffff',
                                                     hoverColor = '#ff3b30',
                                                     outlineScale = 1.035,
                                                     initialRotation = [0, 0, 0] as Vec3,
                                                     ...rest
                                                 }: LightBulbProps) {
    const globeY = 0
    const neckY = globeY - bulbRadius + neckHeight / 2
    const baseY = neckY - neckHeight / 2 - baseHeight / 2
    const collarY = neckY - neckHeight / 2 - collarHeight / 2

    const postH = Math.max(0.5 * bulbRadius, 0.018)
    const postR = 0.0009
    const postY = globeY - 0.01
    const postX = 0.0045
    const filamentY = postY + postH / 2 + 0.001
    const filamentR = bulbRadius * 0.16
    const filamentTube = 0.0009

    const parts = useMemo<PartSpec[]>(() => {
        const arr: PartSpec[] = [
            { id: 'base',   geometry: <cylinderGeometry args={[baseRadius, baseRadius, baseHeight, 24]} />, position: [0, baseY, 0], color, outlineColor, metalness: 0.85, roughness: 0.35 },
            { id: 'tip',    geometry: <sphereGeometry args={[baseRadius * 0.45, 16, 12]} />,              position: [0, baseY - baseHeight / 2 + baseRadius * 0.45, 0], color, outlineColor, metalness: 0.9, roughness: 0.25 },
            { id: 'collar', geometry: <cylinderGeometry args={[neckRadius * 0.95, neckRadius * 0.95, collarHeight, 24]} />, position: [0, collarY, 0], color: '#e6e6e6', outlineColor, metalness: 0.05, roughness: 0.65 },
            { id: 'neck',   geometry: <cylinderGeometry args={[neckRadius, neckRadius, neckHeight, 24]} />, position: [0, neckY, 0], color: '#dcdcdc', outlineColor, metalness: 0.0, roughness: 0.9 },
        ]
        if (showFilament) {
            arr.push(
                { id: 'postL', geometry: <cylinderGeometry args={[postR, postR, postH, 12]} />, position: [-postX, postY, 0], color: '#b9bcc0', outlineColor, metalness: 0.8, roughness: 0.3 },
                { id: 'postR', geometry: <cylinderGeometry args={[postR, postR, postH, 12]} />, position: [ postX, postY, 0], color: '#b9bcc0', outlineColor, metalness: 0.8, roughness: 0.3 },
                { id: 'filament', geometry: <torusGeometry args={[filamentR, filamentTube, 12, 28]} />, position: [0, filamentY, 0], rotation: [Math.PI / 2, 0, 0], color: '#ffcc55', outlineColor, metalness: 0.2, roughness: 0.4 },
            )
        }
        return arr
    }, [
        baseRadius, baseHeight, baseY,
        neckRadius, neckHeight, neckY, collarHeight, collarY,
        postR, postH, postY, postX,
        filamentR, filamentTube, filamentY, showFilament,
        color, outlineColor
    ])

    const totalH = bulbRadius * 2 + neckHeight + baseHeight
    const hitboxSize: Vec3 = [bulbRadius * 2, totalH, bulbRadius * 2]
    const hitboxCenter: Vec3 = [0, baseY + baseHeight / 2 + totalH / 2 - baseHeight, 0]

    const emitterRadius = bulbRadius * emitterRadiusFactor

    return (
        <group position={rest.position as any} rotation={rest.rotation as any} scale={rest.scale as any}>
            <ModelGroup
                parts={parts}
                hitbox={{ size: hitboxSize, center: hitboxCenter }}
                color={color}
                outlineColor={outlineColor}
                hoverColor={hoverColor}
                outlineScale={outlineScale}
                initialRotation={initialRotation}
                onInspect={(rest as any).onInspect}
                materialsById={(rest as any).materialsById}
                disableOutline={(rest as any).disableOutline}
                inspectDisableOutline={(rest as any).inspectDisableOutline}
                inspectDistance={(rest as any).inspectDistance}
                inspectPixelSize={(rest as any).inspectPixelSize}
            />

            {/* inner emitter */}
            <mesh position={[0, globeY + bulbRadius * 0.08, 0]}>
                <sphereGeometry args={[emitterRadius, 24, 18]} />
                <meshStandardMaterial emissive={new THREE.Color(emitterColor)} emissiveIntensity={emitterIntensity} color={'#000'} roughness={1} metalness={0} />
            </mesh>

            {/* glass globe + short glass neck */}
            <group renderOrder={2}>
                <mesh raycast={() => null} position={[0, globeY, 0]}>
                    <sphereGeometry args={[bulbRadius, 32, 24]} />
                    <meshPhysicalMaterial
                        color={glassColor}
                        transmission={glassTransmission}
                        thickness={glassThickness}
                        roughness={glassRoughness}
                        ior={1.45}
                        transparent
                        opacity={1}
                        reflectivity={0.1}
                        metalness={0}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                <mesh raycast={() => null} position={[0, neckY, 0]}>
                    <cylinderGeometry args={[neckRadius * 0.98, neckRadius * 0.98, neckHeight * 0.9, 24]} />
                    <meshPhysicalMaterial
                        color={glassColor}
                        transmission={glassTransmission}
                        thickness={glassThickness}
                        roughness={glassRoughness}
                        ior={1.45}
                        transparent
                        opacity={1}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>

            {enableLight && (
                <pointLight
                    color={new THREE.Color(lightColor)}
                    intensity={lightIntensity}
                    distance={lightDistance}
                    decay={lightDecay}
                    position={[lightOffset[0], lightOffset[1] + bulbRadius * 0.08, lightOffset[2]]}
                    castShadow={castShadow}
                />
            )}
        </group>
    )
})
