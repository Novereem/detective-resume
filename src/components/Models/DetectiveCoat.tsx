'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

export type DetectiveCoatProps = Inherited & {
    mainColor?: string
    beltColor?: string
    buttonColor?: string
}

export const DetectiveCoat: React.FC<DetectiveCoatProps> = ({
                                                                mainColor = '#e5dcc7',
                                                                beltColor = '#d2c3a3',
                                                                buttonColor = '#7a6b54',
                                                                outlineColor = '#ffffff',
                                                                color,
                                                                initialRotation = [0, 0, 0],
                                                                outlineScale = 1.03,
                                                                ...rest
                                                            }) => {
    const coatColor = color ?? mainColor

    const parts = useMemo<PartSpec[]>(() => {
        const roughFabric = 0.96
        const metal = 0.0

        const bodyHeight = 1.1
        const bodyRadius = 0.22
        const bodyScaleX = 1.28
        const bodyScaleZ = 0.72

        const hemScaleX = 1.45
        const hemScaleZ = 0.82

        const yTop = 0.0
        const yBodyCenter = yTop - bodyHeight * 0.5
        const yHem = yTop - bodyHeight

        const sleeveRadius = 0.085
        const sleeveLength = 0.64

        const p: PartSpec[] = []

        // Hanger stem
        p.push({
            id: 'coatHangerStem',
            geometry: (
                <cylinderGeometry args={[0.01, 0.01, 0.16, 12]} />
            ),
            position: [0, yTop + 0.08, -0.03],
            color: '#777777',
            outlineColor,
            roughness: 0.35,
            metalness: 0.85,
        })

        // Curved hanger bar (semi circle)
        const barRadius = 0.26
        const barThickness = 0.008
        p.push({
            id: 'coatHangerBar',
            geometry: (
                <torusGeometry args={[barRadius, barThickness, 14, 48, Math.PI]} />
            ),
            position: [0, yTop - 0.02, -0.06],
            rotation: [Math.PI / 2, 0, 0],
            color: '#777777',
            outlineColor,
            roughness: 0.35,
            metalness: 0.85,
        })

        // Hook
        const hookRadius = 0.055
        const hookThickness = 0.007
        p.push({
            id: 'coatHangerHook',
            geometry: (
                <torusGeometry
                    args={[hookRadius, hookThickness, 10, 32, Math.PI * 1.2]}
                />
            ),
            position: [0, yTop + 0.15, -0.01],
            rotation: [Math.PI / 2, Math.PI * 0.15, 0],
            color: '#777777',
            outlineColor,
            roughness: 0.35,
            metalness: 0.85,
        })

        // Upper torso: straight, oval cylinder
        p.push({
            id: 'coatBody',
            geometry: (
                <cylinderGeometry
                    args={[
                        bodyRadius * 1.02,
                        bodyRadius * 0.98,
                        bodyHeight * 0.8,
                        28,
                        1,
                        true,
                    ]}
                />
            ),
            position: [0, yBodyCenter + 0.06, 0],
            rotation: [0, 0, 0],
            scale: [bodyScaleX, 1, bodyScaleZ],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        // Hem: flared oval cylinder
        p.push({
            id: 'coatHem',
            geometry: (
                <cylinderGeometry
                    args={[
                        bodyRadius * 1.05,
                        bodyRadius * 1.12,
                        0.32,
                        26,
                        1,
                        true,
                    ]}
                />
            ),
            position: [0, yHem - 0.16, 0.01],
            rotation: [0, 0, 0],
            scale: [hemScaleX, 1, hemScaleZ],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        // Front overlap
        p.push({
            id: 'coatFoldFront',
            geometry: (
                <boxGeometry
                    args={[
                        bodyRadius * 2.05 * bodyScaleX,
                        bodyHeight * 0.92,
                        0.025,
                    ]}
                />
            ),
            position: [0, yBodyCenter + 0.05, bodyRadius * bodyScaleZ * 0.86],
            rotation: [0, 0, 0],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        // Back fold over hanger
        p.push({
            id: 'coatHookFold',
            geometry: (
                <cylinderGeometry
                    args={[
                        bodyRadius * 0.58,
                        bodyRadius * 0.64,
                        0.22,
                        20,
                        1,
                        true,
                    ]}
                />
            ),
            position: [0, yTop - 0.09, -bodyRadius * bodyScaleZ * 0.7],
            rotation: [THREE.MathUtils.degToRad(-18), 0, 0],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        // Collar
        const collarY = yTop - 0.11
        const collarDepth = 0.09

        p.push({
            id: 'coatCollarBack',
            geometry: (
                <boxGeometry args={[0.46, 0.075, collarDepth]} />
            ),
            position: [0, collarY + 0.02, 0.0],
            rotation: [THREE.MathUtils.degToRad(-6), 0, 0],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        const flapW = 0.26
        const flapH = 0.11
        const flapDepth = 0.04
        const flapTilt = THREE.MathUtils.degToRad(18)

        p.push({
            id: 'coatCollarLeft',
            geometry: (
                <boxGeometry args={[flapW, flapH, flapDepth]} />
            ),
            position: [
                -flapW * 0.6,
                collarY - flapH * 0.35,
                bodyRadius * bodyScaleZ * 0.95,
            ],
            rotation: [THREE.MathUtils.degToRad(11), 0, flapTilt],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        p.push({
            id: 'coatCollarRight',
            geometry: (
                <boxGeometry args={[flapW, flapH, flapDepth]} />
            ),
            position: [
                flapW * 0.6,
                collarY - flapH * 0.35,
                bodyRadius * bodyScaleZ * 0.95,
            ],
            rotation: [THREE.MathUtils.degToRad(11), 0, -flapTilt],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        // Sleeves (round, slightly fanned out)
        const sleeveCenterY = yTop - 0.44
        const sleeveOffsetX = bodyRadius * bodyScaleX * 1.25
        const sleeveTiltZ = THREE.MathUtils.degToRad(16)

        p.push({
            id: 'coatSleeveL',
            geometry: (
                <cylinderGeometry
                    args={[
                        sleeveRadius * 1.02,
                        sleeveRadius * 0.98,
                        sleeveLength,
                        24,
                    ]}
                />
            ),
            position: [-sleeveOffsetX, sleeveCenterY, -0.03],
            rotation: [0, 0, sleeveTiltZ],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        p.push({
            id: 'coatSleeveR',
            geometry: (
                <cylinderGeometry
                    args={[
                        sleeveRadius * 1.02,
                        sleeveRadius * 0.98,
                        sleeveLength,
                        24,
                    ]}
                />
            ),
            position: [sleeveOffsetX, sleeveCenterY, -0.03],
            rotation: [0, 0, -sleeveTiltZ],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        const cuffHeight = 0.11
        const cuffYOffset = sleeveLength * 0.5 - cuffHeight * 0.45

        p.push({
            id: 'coatSleeveCuffL',
            geometry: (
                <cylinderGeometry
                    args={[
                        sleeveRadius * 1.05,
                        sleeveRadius * 1.05,
                        cuffHeight,
                        24,
                    ]}
                />
            ),
            position: [-sleeveOffsetX, sleeveCenterY - cuffYOffset, -0.03],
            rotation: [0, 0, sleeveTiltZ],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        p.push({
            id: 'coatSleeveCuffR',
            geometry: (
                <cylinderGeometry
                    args={[
                        sleeveRadius * 1.05,
                        sleeveRadius * 1.05,
                        cuffHeight,
                        24,
                    ]}
                />
            ),
            position: [sleeveOffsetX, sleeveCenterY - cuffYOffset, -0.03],
            rotation: [0, 0, -sleeveTiltZ],
            color: coatColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        // Belt & tail
        const beltY = yBodyCenter - 0.04

        p.push({
            id: 'coatBelt',
            geometry: (
                <cylinderGeometry
                    args={[
                        0.035,
                        0.035,
                        bodyRadius * 2.15 * bodyScaleX,
                        16,
                    ]}
                />
            ),
            position: [0, beltY, bodyRadius * bodyScaleZ * 0.92],
            rotation: [0, 0, Math.PI / 2],
            color: beltColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        p.push({
            id: 'coatBeltTail',
            geometry: (
                <boxGeometry args={[0.06, 0.5, 0.03]} />
            ),
            position: [
                bodyRadius * bodyScaleX * 0.3,
                beltY - 0.3,
                bodyRadius * bodyScaleZ * 0.96,
            ],
            rotation: [0, 0, THREE.MathUtils.degToRad(14)],
            color: beltColor,
            outlineColor,
            roughness: roughFabric,
            metalness: metal,
        })

        // Buttons
        const buttonCount = 4
        const buttonSpacing = 0.18
        const buttonStartY = yBodyCenter + 0.13

        for (let i = 0; i < buttonCount; i++) {
            const y = buttonStartY - i * buttonSpacing
            p.push({
                id: 'coatButton',
                geometry: (
                    <cylinderGeometry args={[0.013, 0.013, 0.01, 12]} />
                ),
                position: [
                    bodyRadius * bodyScaleX * 0.24,
                    y,
                    bodyRadius * bodyScaleZ * 1.02,
                ],
                rotation: [Math.PI / 2, 0, 0],
                color: buttonColor,
                outlineColor,
                roughness: 0.4,
                metalness: 0.1,
            })
        }

        return p
    }, [beltColor, buttonColor, coatColor, outlineColor])

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            color={coatColor}
            outlineColor={outlineColor}
            initialRotation={initialRotation}
            disableOutline={true}
            outlineScale={outlineScale}
            castShadowDefault
            receiveShadowDefault
        />
    )
}
