'use client'

import React from 'react'

export type LensMask = {
    active: boolean
    origin: [number, number, number]
    dir: [number, number, number]
    radius: number
}

export type MagnifierState = {
    held: boolean
    setHeld: (v: boolean) => void
    lensMaskRef: React.MutableRefObject<LensMask>
}

const MagnifierStateContext = React.createContext<MagnifierState | null>(null)

const defaultLensMask: LensMask = {
    active: false,
    origin: [0, 0, 0],
    dir: [0, 0, -1],
    radius: 0.25,
}

const defaultLensMaskRef: React.MutableRefObject<LensMask> = {
    current: defaultLensMask,
} as React.MutableRefObject<LensMask>

const defaultState: MagnifierState = {
    held: false,
    setHeld: () => {},
    lensMaskRef: defaultLensMaskRef,
}

export function MagnifierStateProvider({ children }: { children: React.ReactNode }) {
    const [held, setHeld] = React.useState(false)
    const [active, setActive] = React.useState(false)

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
            active,
            setActive,
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
        return defaultState
    }
    return ctx
}