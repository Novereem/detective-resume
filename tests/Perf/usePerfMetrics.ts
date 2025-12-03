'use client'

import { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'

type PerfSample = { timestamp: number; frameTime: number }

declare global {
    interface Window {
        __TT_DETECTIVE_PERF__?: {
            avgFps: number
            maxFrameTime: number
            drawCalls: number
            geometries: number
            textures: number
            sampleCount: number
        }
    }
}

export function usePerfMetrics(enabled = true) {
    const { gl } = useThree()
    const last = useRef<number | null>(null)
    const samples = useRef<PerfSample[]>([])

    useFrame(() => {
        if (!enabled) return

        const now = performance.now()
        if (last.current == null) {
            last.current = now
            return
        }

        const frameTime = now - last.current
        last.current = now

        samples.current.push({ timestamp: now, frameTime })

        // Keep the last 20s instead of 10s
        const cutoff = now - 20_000
        samples.current = samples.current.filter(s => s.timestamp >= cutoff)

        const total = samples.current.reduce((acc, s) => acc + s.frameTime, 0)
        const avgFrameTime = samples.current.length
            ? total / samples.current.length
            : 16.67
        const avgFps = 1000 / avgFrameTime
        const maxFrameTime = samples.current.reduce(
            (max, s) => (s.frameTime > max ? s.frameTime : max),
            0
        )

        const info = gl.info

        if (typeof window !== 'undefined') {
            window.__TT_DETECTIVE_PERF__ = {
                avgFps,
                maxFrameTime,
                drawCalls: info.render.calls,
                geometries: info.memory.geometries,
                textures: info.memory.textures,
                sampleCount: samples.current.length,
            }
        }
    })
}
