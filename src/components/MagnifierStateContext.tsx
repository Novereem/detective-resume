'use client'

import React from 'react'

export type LensMask = {
    active: boolean
    origin: [number, number, number]  // camera position
    dir: [number, number, number]     // normalized world-space ray direction
    radius: number                    // world-space radius around that ray
}

export type MagnifierState = {
    held: boolean
    setHeld: (v: boolean) => void
    lensMaskRef: React.MutableRefObject<LensMask>
}

const MagnifierStateContext = React.createContext<MagnifierState | null>(null)

export function MagnifierStateProvider({ children }: { children: React.ReactNode }) {
    const [held, setHeld] = React.useState(false)

    const lensMaskRef = React.useRef<LensMask>({
        active: false,
        origin: [0, 0, 0],
        dir: [0, 0, -1],
        radius: 0.25,
    })

    const value = React.useMemo(
        () => ({
            held,
            setHeld,
            lensMaskRef,
        }),
        [held]
    )

    return (
        <MagnifierStateContext.Provider value={value}>
            {children}
        </MagnifierStateContext.Provider>
    )
}

export function useMagnifierState(): MagnifierState {
    const ctx = React.useContext(MagnifierStateContext)
    if (!ctx) {
        throw new Error('useMagnifierState must be used within MagnifierStateProvider')
    }
    return ctx
}
