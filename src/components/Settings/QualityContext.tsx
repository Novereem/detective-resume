'use client'
import React, { createContext, useContext } from 'react'
import { useSettings } from './SettingsProvider'

export type QualityLevel = 'low' | 'medium' | 'high'

const QualityCtx = createContext<QualityLevel>('high')

type Props = {
    level?: QualityLevel
    children: React.ReactNode
}

/**
 * Provide a quality level for 3D models to all descendants.
 *
 * Responsibilities:
 * - Read `modelQuality` from global settings as the default.
 * - Optionally override the level via the local `level` prop, which is useful
 *   for forcing low/medium/high quality on a subtree.
 *
 * Used by:
 * - Model components that want a simple `useQuality()` hook instead of
 *   wiring the full SettingsProvider everywhere.
 */
export function QualityProvider({ level, children }: Props) {
    const { modelQuality } = useSettings()
    const effective = level ?? modelQuality
    return <QualityCtx.Provider value={effective}>{children}</QualityCtx.Provider>
}

/**
 * Read the current effective model quality level.
 *
 * Returns:
 * - 'low' | 'medium' | 'high'
 *
 * Can be used outside of a QualityProvider; in that case it falls back
 * to the default context value of 'high'.
 */
export function useQuality() {
    return useContext(QualityCtx)
}