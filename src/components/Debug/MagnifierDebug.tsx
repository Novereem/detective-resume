'use client'

import React from 'react'
import { useFrame } from '@react-three/fiber'
import { useMagnifierState } from '@/components/CameraEffects/Magnifier/MagnifierStateContext'

export function MagnifierDebug() {
    const { held, lensMaskRef } = useMagnifierState()
    const lastKeyRef = React.useRef<string>('')

    useFrame(() => {
        const mask = lensMaskRef.current
        const key = JSON.stringify({
            held,
            active: mask.active,
            origin: mask.origin,
            dir: mask.dir,
            radius: mask.radius,
        })

        if (key !== lastKeyRef.current) {
            lastKeyRef.current = key
            console.log('[MagnifierDebug]', {
                held,
                mask: { ...mask },
            })
        }
    })

    return null
}
