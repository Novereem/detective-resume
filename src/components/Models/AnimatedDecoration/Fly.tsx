'use client'

import React, { useState, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { Vec3 } from '@/components/Types/room'

type FlyBounds = {
    min: Vec3
    max: Vec3
}

type FlyProps = {
    bounds?: FlyBounds
    speed?: number
}

type SimMode = 'travel' | 'circle'

type SimState = {
    bounds: { min: THREE.Vector3; max: THREE.Vector3 }
    pos: THREE.Vector3

    mode: SimMode

    target: THREE.Vector3
    baseSpeed: number
    legStartTime: number
    legDuration: number

    circleCenter: THREE.Vector3
    circleRadius: number
    circleVertAmp: number
    circleSpeed: number
    circleBasePhase: number
    circleDuration: number
}

function makeDefaultBounds(): { min: THREE.Vector3; max: THREE.Vector3 } {
    return {
        min: new THREE.Vector3(-1.4, 0.4, 1.1),
        max: new THREE.Vector3(2.4, 2.3, 3.9),
    }
}

function toVec3(b: FlyBounds | undefined): { min: THREE.Vector3; max: THREE.Vector3 } {
    if (!b) return makeDefaultBounds()
    return {
        min: new THREE.Vector3(...b.min),
        max: new THREE.Vector3(...b.max),
    }
}

function randomInRange(min: number, max: number): number {
    return THREE.MathUtils.lerp(min, max, Math.random())
}

function randomPoint(bounds: { min: THREE.Vector3; max: THREE.Vector3 }): THREE.Vector3 {
    return new THREE.Vector3(
        randomInRange(bounds.min.x + 0.05, bounds.max.x - 0.05),
        randomInRange(bounds.min.y + 0.1, bounds.max.y - 0.1),
        randomInRange(bounds.min.z + 0.05, bounds.max.z - 0.05)
    )
}

export const Fly: React.FC<FlyProps> = ({ bounds, speed = 0.8 }) => {
    const groupRef = useRef<THREE.Group>(null)
    const leftWingRef = useRef<THREE.Mesh>(null)
    const rightWingRef = useRef<THREE.Mesh>(null)

    const [sim] = useState<SimState>(() => {
        const b = toVec3(bounds)
        const startPos = new THREE.Vector3(
            (b.min.x + b.max.x) * 0.5,
            THREE.MathUtils.lerp(b.min.y, b.max.y, 0.6),
            (b.min.z + b.max.z) * 0.5
        )

        const firstTarget = randomPoint(b)
        const baseSpeed = speed * randomInRange(0.85, 1.15)
        const now = 0

        const legDuration = randomInRange(3, 8)
        const circleRadius = randomInRange(0.04, 0.08)
        const circleVertAmp = randomInRange(0.01, 0.02)
        const circleSpeed = randomInRange(1.5, 3.0)
        const circleDuration = randomInRange(1.5, 4)

        return {
            bounds: b,
            pos: startPos,

            mode: 'travel',

            target: firstTarget,
            baseSpeed,
            legStartTime: now,
            legDuration,

            circleCenter: firstTarget.clone(),
            circleRadius,
            circleVertAmp,
            circleSpeed,
            circleBasePhase: Math.random() * Math.PI * 2,
            circleDuration,
        }
    })

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime()
        const dt = delta || 0.016

        const {
            bounds,
            pos,
        } = sim

        if (sim.mode === 'travel') {
            const toTarget = sim.target.clone().sub(pos)
            const dist = toTarget.length()
            const arrivedEps = 0.05
            const timeInLeg = t - sim.legStartTime

            if (dist > 1e-4) {
                toTarget.normalize()
                const step = sim.baseSpeed * dt
                pos.addScaledVector(toTarget, Math.min(step, dist))
            }

            pos.x = THREE.MathUtils.clamp(pos.x, bounds.min.x, bounds.max.x)
            pos.y = THREE.MathUtils.clamp(pos.y, bounds.min.y, bounds.max.y)
            pos.z = THREE.MathUtils.clamp(pos.z, bounds.min.z, bounds.max.z)

            const arrived = dist < arrivedEps
            const legExpired = timeInLeg >= sim.legDuration

            if (arrived) {
                sim.mode = 'circle'
                sim.circleCenter.copy(sim.target)
                sim.circleRadius = randomInRange(0.04, 0.08)
                sim.circleVertAmp = randomInRange(0.01, 0.02)
                sim.circleSpeed = randomInRange(1.5, 3.0)
                sim.circleBasePhase = Math.random() * Math.PI * 2
                sim.circleDuration = randomInRange(1.5, 4)
                sim.legStartTime = t
            } else if (legExpired) {
                sim.target = randomPoint(bounds)
                sim.baseSpeed = speed * randomInRange(0.85, 1.15)
                sim.legStartTime = t
                sim.legDuration = randomInRange(3, 8)
            }
        } else {
            const timeInCircle = t - sim.legStartTime
            const phase = sim.circleBasePhase + timeInCircle * sim.circleSpeed

            const cx = sim.circleCenter.x
            const cy = sim.circleCenter.y
            const cz = sim.circleCenter.z

            pos.set(
                cx + Math.cos(phase) * sim.circleRadius,
                cy + Math.sin(phase * 2) * sim.circleVertAmp,
                cz + Math.sin(phase) * sim.circleRadius
            )

            const circleExpired = timeInCircle >= sim.circleDuration
            if (circleExpired) {
                sim.mode = 'travel'
                sim.target = randomPoint(bounds)
                sim.baseSpeed = speed * randomInRange(0.85, 1.15)
                sim.legStartTime = t
                sim.legDuration = randomInRange(3, 8)
            }
        }

        if (!groupRef.current) return

        groupRef.current.position.copy(pos)
        groupRef.current.quaternion.copy(state.camera.quaternion)

        const flapT = t * 400
        const flap = Math.sin(flapT) * 0.004

        if (leftWingRef.current) {
            leftWingRef.current.position.y = flap
        }
        if (rightWingRef.current) {
            rightWingRef.current.position.y = flap
        }
    })

    return (
        <group ref={groupRef} raycast={() => null}>
            <mesh castShadow={false} receiveShadow={false}>
                <planeGeometry args={[0.014, 0.02]} />
                <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
            </mesh>

            <mesh ref={leftWingRef} position={[-0.008, 0, 0]} castShadow={false} receiveShadow={false}>
                <planeGeometry args={[0.02, 0.01]} />
                <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
            </mesh>

            <mesh ref={rightWingRef} position={[0.008, 0, 0]} castShadow={false} receiveShadow={false}>
                <planeGeometry args={[0.02, 0.01]} />
                <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
            </mesh>
        </group>
    )
}
