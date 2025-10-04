'use client'
import * as React from 'react'
import * as THREE from 'three'
import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

function rngFromSeed(seed: number) {
    // mulberry32 – tiny deterministic PRNG
    return function () {
        let t = (seed += 0x6D2B79F5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export function PoofEffect({
                               position = [0, 0, 0],
                               count = 5,
                               duration = 0.8,
                               stagger = 0.06,
                               jitterRadius = 0.06,    // NEW: how far to scatter each ring (meters)
                               jitterSeed,             // NEW: optional seed for deterministic scatter
                               onDone,
                           }: {
    position?: [number, number, number] | THREE.Vector3
    count?: number
    duration?: number
    stagger?: number
    jitterRadius?: number
    jitterSeed?: number
    onDone?: () => void
}) {
    const meshes = React.useRef<THREE.Mesh[]>([])
    const materials = React.useRef<THREE.MeshBasicMaterial[]>([])
    const start = React.useRef<number | null>(null)
    const offsets = React.useMemo(
        () => Array.from({ length: count }, (_, i) => i * stagger),
        [count, stagger]
    )

    // NEW: precompute tiny random XY offsets for each ring (once per mount/prop set)
    const jitters = React.useMemo(() => {
        const r = jitterSeed != null ? rngFromSeed(jitterSeed) : Math.random
        const arr: [number, number, number][] = []
        for (let i = 0; i < count; i++) {
            // polar random in circle (uniform)
            const u = r()
            const v = r()
            const theta = 2 * Math.PI * u
            const radius = jitterRadius * Math.sqrt(v)
            const x = Math.cos(theta) * radius
            const y = Math.sin(theta) * radius
            arr.push([x, y, 0]) // Billboard faces camera; local z not needed
        }
        return arr
    }, [count, jitterRadius, jitterSeed])

    useFrame((state) => {
        if (start.current === null) start.current = state.clock.getElapsedTime()
        const t = state.clock.getElapsedTime() - start.current

        let anyAlive = false
        for (let i = 0; i < count; i++) {
            const p = (t - offsets[i]) / duration // 0..1
            const mesh = meshes.current[i]
            const mat = materials.current[i]
            if (!mesh || !mat) continue

            if (p < 0) {
                mesh.scale.setScalar(0.001)
                mat.opacity = 0
                continue
            }
            if (p <= 1) {
                anyAlive = true
                const eased = Math.sin(Math.PI * p) // 0..1..0
                const scale = 0.05 + 0.35 * eased
                mesh.scale.setScalar(scale)
                mat.opacity = 1 - p
                mat.needsUpdate = true
            } else {
                mesh.scale.setScalar(0.001)
                mat.opacity = 0
            }
        }

        if (!anyAlive) onDone?.()
    })

    return (
        <group position={position as any}>
            {offsets.map((_, i) => (
                <Billboard key={i} follow position={jitters[i]}>
                    <mesh ref={(m) => m && (meshes.current[i] = m)}>
                        {/* thin ring */}
                        <ringGeometry args={[0.18, 0.22, 48]} />
                        <meshBasicMaterial
                            ref={(m) => m && (materials.current[i] = m)}
                            color="white"
                            transparent
                            opacity={0}
                            depthWrite={false}
                        />
                    </mesh>
                </Billboard>
            ))}
        </group>
    )
}
