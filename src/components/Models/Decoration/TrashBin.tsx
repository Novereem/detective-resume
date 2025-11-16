'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'
import { useQuality } from '@/components/Settings/QualityContext'

export type TrashBinProps = Omit<
    React.ComponentProps<typeof ModelGroup>,
    'parts' | 'materialsById'
> & {
    size?: [rt: number, rb: number, h: number]
    rimT?: number
    baseT?: number
    baseInset?: number

    spiralAngleDeg?: number
    ribbonW?: number
    ribbonT?: number
    spiralCountPerDir?: number
    stepsPerTurn?: number

    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

/** Helix whose radius tapers from Rb (bottom) to Rt (top) */
class TaperedHelixCurve extends THREE.Curve<THREE.Vector3> {
    constructor(
        public Rt: number,
        public Rb: number,
        public H: number,
        public turns: number,
        public theta0 = 0
    ) { super() }

    getPoint(t: number) {
        const y = -this.H / 2 + t * this.H
        const r = THREE.MathUtils.lerp(this.Rb, this.Rt, t)
        const theta = this.theta0 + t * this.turns * Math.PI * 2
        return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta))
    }
}

export const TrashBin = memo(function TrashBin({
                                                   size = [0.16, 0.11, 0.28],
                                                   rimT = 0.0075,
                                                   baseT = 0.004,
                                                   baseInset = 0.01,

                                                   spiralAngleDeg = 52,
                                                   ribbonW = 0.0036,
                                                   ribbonT = 0.0012,
                                                   spiralCountPerDir = 20,
                                                   stepsPerTurn = 140,

                                                   color = '#bfc5cc',
                                                   outlineColor = '#ffffff',
                                                   hoverColor = '#ff3b30',
                                                   outlineScale = 1.03,
                                                   initialRotation = [0, 0, 0] as Vec3,
                                                   materialsById,
                                                   ...rest
                                               }: TrashBinProps) {
    const quality = useQuality()

    const [Rt, Rb, H] = size
    const midR = (Rt + Rb) * 0.5

    let spiralCount = spiralCountPerDir
    let stepsPerTurnEff = stepsPerTurn
    let showSpirals = true
    let showSolidBodyLow = false

    if (quality === 'high') {
        spiralCount = Math.max(1, Math.round(spiralCountPerDir * (2 / 3)))
        stepsPerTurnEff = Math.max(60, Math.round(stepsPerTurn * 0.7))
    } else if (quality === 'medium') {
        spiralCount = Math.max(1, Math.round(spiralCountPerDir * (1 / 3)))
        stepsPerTurnEff = Math.max(40, Math.round(stepsPerTurn * 0.5))
    } else {
        showSpirals = false
        showSolidBodyLow = true
    }

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // --- rims ---
        p.push({
            id: 'rimTop',
            geometry: <torusGeometry args={[Rt, rimT / 2, 16, 64]} />,
            rotation: [Math.PI / 2, 0, 0],
            position: [0, H / 2 - rimT / 2, 0],
            color, outlineColor, roughness: 0.35, metalness: 0.85,
        })
        p.push({
            id: 'rimBottom',
            geometry: <torusGeometry args={[Rb, rimT / 2, 16, 64]} />,
            rotation: [Math.PI / 2, 0, 0],
            position: [0, -H / 2 + rimT / 2, 0],
            color, outlineColor, roughness: 0.4, metalness: 0.85,
        })

        if (showSolidBodyLow) {
            const bodyH = H - rimT * 2
            p.push({
                id: 'bodyLow',
                geometry: <cylinderGeometry args={[Rt - rimT * 0.6, Rb + rimT * 0.6, bodyH, 32, 1, true]} />,
                position: [0, 0, 0],
                side: THREE.DoubleSide,
                outlineColor, roughness: 0.5, metalness: 0.6,
            })
        }

        if (showSpirals) {
            // --- lattice ribbons (spirals in both directions) ---
            const rMean = (Rt + Rb) / 2
            const angleRad = THREE.MathUtils.degToRad(spiralAngleDeg)
            const risePerTurn = Math.max(0.004, 2 * Math.PI * rMean * Math.tan(angleRad))
            const turns = Math.max(0.25, H / risePerTurn)

            // keep clear of rims slightly
            const RtInner = Rt - rimT * 0.5
            const RbInner = Rb + rimT * 0.5
            const useH = H - rimT

            // ribbon cross-section
            const hw = ribbonW / 2
            const ht = ribbonT / 2
            const shape = new THREE.Shape()
            shape.moveTo(-hw, -ht); shape.lineTo(hw, -ht); shape.lineTo(hw, ht); shape.lineTo(-hw, ht); shape.closePath()

            const steps = Math.max(40, Math.round(turns * stepsPerTurnEff))

            function makeRibbon(theta0: number, dir: 1 | -1, idx: number) {
                const curve = new TaperedHelixCurve(RtInner, RbInner, useH, dir * turns, theta0)
                const geom = new THREE.ExtrudeGeometry(shape, {
                    steps, bevelEnabled: false, extrudePath: curve,
                })
                geom.computeVertexNormals()
                p.push({
                    id: `rib_${dir > 0 ? 'A' : 'B'}_${idx}`,
                    geometry: <primitive object={geom} />,
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    color, outlineColor, roughness: 0.45, metalness: 0.85,
                })
            }

            // distribute start angles around the circle for both directions
            const count = Math.max(1, Math.floor(spiralCount))
            for (let i = 0; i < count; i++) {
                const offsetA = (i / count) * Math.PI * 2
                const offsetB = offsetA + (Math.PI / count)
                makeRibbon(offsetA, +1, i)
                makeRibbon(offsetB, -1, i)
            }
        }

        // base disk
        const baseR = Math.max(0.01, Rb - baseInset)
        p.push({
            id: 'base',
            geometry: <cylinderGeometry args={[baseR + 0.01, baseR + 0.01, baseT, 32, 1, false]} />,
            position: [0, -H / 2 + baseT / 2 + 0.0005, 0],
            rotation: [0, 0, 0],
            color, outlineColor, roughness: 0.55, metalness: 0.75,
        })

        return p
    }, [
        Rt,
        Rb,
        H,
        rimT,
        baseT,
        baseInset,
        spiralAngleDeg,
        ribbonW,
        ribbonT,
        color,
        outlineColor,
        spiralCount,
        stepsPerTurnEff,
        showSpirals,
        showSolidBodyLow,
    ])

    const hitbox: { size: Vec3; center: Vec3 } = {
        size: [midR * 2 + rimT, H, midR * 2 + rimT],
        center: [0, 0, 0],
    }

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={materialsById}
            hitbox={hitbox}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            initialRotation={initialRotation}
            outlineScale={outlineScale}
        />
    )
})

export default TrashBin
