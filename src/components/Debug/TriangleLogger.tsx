'use client'
import React from 'react'
import { useThree, useFrame } from '@react-three/fiber'

export function TriangleLogger() {
    const { gl } = useThree()
    const lastLogRef = React.useRef(0)

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()
        if (t - lastLogRef.current > 1) {
            lastLogRef.current = t
            const { triangles, calls } = gl.info.render
            //console.log('[Perf] triangles =', triangles, 'drawCalls =', calls)
        }
    })

    return null
}