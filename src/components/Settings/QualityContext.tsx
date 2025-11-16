'use client'
import React, { createContext, useContext } from 'react'
import { useSettings } from './SettingsProvider'

export type QualityLevel = 'low' | 'medium' | 'high'

const QualityCtx = createContext<QualityLevel>('high')

type Props = {
    level?: QualityLevel
    children: React.ReactNode
}

export function QualityProvider({ level, children }: Props) {
    const { modelQuality } = useSettings()
    const effective = level ?? modelQuality
    return <QualityCtx.Provider value={effective}>{children}</QualityCtx.Provider>
}

export function useQuality() {
    return useContext(QualityCtx)
}