'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

type CoatRackProps = Inherited & {
    height?: number
    poleRadius?: number

    baseAttachRatio?: number

    groundY?: number

    legAngleDeg?: number

    baseSpread?: number

    legThickness?: number

    hookReach?: number
    hookRise?: number
    hookThickness?: number

    ringRadius?: number
    ringThickness?: number

    footPadRadius?: number
    footPadScale?: number

    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const CoatRack = memo(function CoatRack({
                                                   height = 1.5,
                                                   poleRadius = 0.018,

                                                   baseAttachRatio = 0.22,
                                                   groundY = 0,

                                                   legAngleDeg = 45,
                                                   baseSpread,

                                                   legThickness = 0.014,

                                                   hookReach = 0.22,
                                                   hookRise = 0.16,
                                                   hookThickness = 0.012,

                                                   ringRadius = 0.075,
                                                   ringThickness = 0.012,

                                                   footPadRadius,
                                                   footPadScale = 1.3,

                                                   color = '#2a2a2a',
                                                   outlineColor = '#fff',
                                                   hoverColor = '#ff3b30',
                                                   outlineScale = 1.035,
                                                   initialRotation = [0, 0, 0] as Vec3,
                                                   materialsById,
                                                   ...rest
                                               }: CoatRackProps) {
    const tube = (pts: THREE.Vector3[], radius: number, radial = 12, segs = 60) => (
        <tubeGeometry args={[new THREE.CatmullRomCurve3(pts), segs, radius, radial, false]} />
    )

    // Derived basics
    const baseY = height * baseAttachRatio
    const dropToFloor = Math.max(0.001, baseY - groundY)
    const angleRad = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(legAngleDeg, 5, 80))
    const reach = baseSpread ?? (dropToFloor / Math.tan(angleRad))

    const makeLegPoints = (a: number) => {
        const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a))
        const root = new THREE.Vector3(0, baseY, 0)

        const out1 = root.clone()
            .addScaledVector(dir, reach * 0.35)
            .add(new THREE.Vector3(0, -dropToFloor * 0.35, 0))

        const out2 = root.clone()
            .addScaledVector(dir, reach * 0.75)
            .add(new THREE.Vector3(0, -dropToFloor * 0.85, 0))

        const foot = new THREE.Vector3(0, baseY, 0)
            .addScaledVector(dir, reach)
            .add(new THREE.Vector3(0, -dropToFloor, 0))

        const tip = foot.clone().add(new THREE.Vector3(0, 0.02, 0))

        return [root, out1, out2, foot, tip]
    }

    const makeTopHookPoints = (a: number) => {
        const y = height * 0.98
        const base = new THREE.Vector3(0, y, 0)
        const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a))
        const p1 = base.clone().add(new THREE.Vector3(0, hookRise * 0.15, 0))
        const p2 = base.clone().addScaledVector(dir, hookReach * 0.55).add(new THREE.Vector3(0, hookRise * 0.4, 0))
        const p3 = base.clone().addScaledVector(dir, hookReach).add(new THREE.Vector3(0, hookRise, 0))
        const p4 = p3.clone().add(new THREE.Vector3(0, hookRise * 0.25, 0))
        return [base, p1, p2, p3, p4]
    }

    const makeMidHookPoints = (a: number) => {
        const y = height * 0.885
        const base = new THREE.Vector3(0, y, 0)
        const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a))
        const reachM = hookReach * 0.66
        const riseM = hookRise * 0.55
        const p1 = base.clone().add(new THREE.Vector3(0, riseM * -0.15, 0))
        const p2 = base.clone().addScaledVector(dir, reachM * 0.55).add(new THREE.Vector3(0, riseM * 0.2, 0))
        const p3 = base.clone().addScaledVector(dir, reachM).add(new THREE.Vector3(0, riseM * 0.55, 0))
        return [base, p1, p2, p3]
    }

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        const h1 = height * 0.60
        const h2 = height - h1

        // Pole
        p.push({
            id: 'pole',
            geometry: <cylinderGeometry args={[poleRadius, poleRadius, h1, 24]} />,
            position: [0, h1 / 2, 0],
            color, outlineColor, boundingRadius: h1 * 0.5,
        })
        p.push({
            id: 'pole',
            geometry: <cylinderGeometry args={[poleRadius * 0.98, poleRadius * 0.98, h2, 24]} />,
            position: [0, h1 + h2 / 2, 0],
            color, outlineColor, boundingRadius: h2 * 0.5,
        })

        // Mid ring
        p.push({
            id: 'ring',
            geometry: <torusGeometry args={[ringRadius, ringThickness, 12, 40]} />,
            position: [0, baseY, 0],
            rotation: [Math.PI / 2, 0, 0],
            color, outlineColor, boundingRadius: ringRadius + ringThickness,
        })

        // 4 base legs
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2
            p.push({
                id: 'leg',
                geometry: tube(makeLegPoints(a), legThickness, 14, 70),
                color, outlineColor, boundingRadius: reach,
            })
        }

        // 4 top hooks
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2
            p.push({
                id: 'hook',
                geometry: tube(makeTopHookPoints(a), hookThickness, 12, 60),
                color, outlineColor, boundingRadius: hookReach + hookRise,
            })
        }

        // 4 mid hooks (between the big ones)
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2 + Math.PI / 4
            p.push({
                id: 'hook',
                geometry: tube(makeMidHookPoints(a), hookThickness * 0.9, 12, 48),
                color, outlineColor, boundingRadius: hookReach * 0.8,
            })
        }

        // Feet pads
        const padR = footPadRadius ?? legThickness * 0.9
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2
            const x = Math.cos(a) * reach
            const z = Math.sin(a) * reach
            const y = groundY + 0.01
            p.push({
                id: 'foot',
                geometry: <sphereGeometry args={[padR, 16, 16]} />,
                position: [x, y, z],
                scale: [footPadScale, 0.5, footPadScale],
                color, outlineColor, boundingRadius: padR * footPadScale,
            })
        }

        // Top cap
        p.push({
            id: 'cap',
            geometry: <sphereGeometry args={[poleRadius * 0.9, 16, 16]} />,
            position: [0, height, 0],
            color, outlineColor, boundingRadius: poleRadius,
        })

        return p
    }, [
        height, poleRadius, baseAttachRatio, groundY,
        legAngleDeg, baseSpread, legThickness,
        hookReach, hookRise, hookThickness,
        ringRadius, ringThickness,
        footPadRadius, footPadScale,
        color, outlineColor
    ])

    const hitboxSize: Vec3 = [reach * 2.1, height, reach * 2.1]
    const hitboxCenter: Vec3 = [0, height / 2, 0]

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={materialsById}
            hitbox={{ size: hitboxSize, center: hitboxCenter }}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            initialRotation={initialRotation}
            outlineScale={outlineScale}
        />
    )
})
