'use client'
import React from 'react'
import RedStringsEffect from '@/components/RedStringsEffect'
import { PoofEffect } from '@/components/Effects/PoofEffect'
import type { Vec3 } from '@/components/Types/room'

interface SceneEffectsProps {
    poofs: { id: string; pos: Vec3 }[]
    onPoofDone: (id: string) => void
}

export function SceneEffects({ poofs, onPoofDone }: SceneEffectsProps) {
    return (
        <>
            <RedStringsEffect
                zoom={1.3}
                vRepeat={2}
                contrast={1.6}
                brightness={0.15}
                baseUnit={0.08}
                radius={0.0035}
            />

            {poofs.map((p) => (
                <PoofEffect key={p.id} position={p.pos} onDone={() => onPoofDone(p.id)} />
            ))}
        </>
    )
}
