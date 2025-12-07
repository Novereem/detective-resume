'use client'
import React from 'react'
import { useGameState } from '@/components/Game/state'
import type { PuzzleId } from '@/components/Types/game'
import type { PuzzleConfig } from '@/components/Game/state.data'
import {useSettings} from "@/components/Settings/SettingsProvider";

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const cornerStyle: Record<Corner, React.CSSProperties> = {
    'top-left': { top: 12, left: 12 },
    'top-right': { top: 12, right: 12 },
    'bottom-left': { bottom: 12, left: 12 },
    'bottom-right': { bottom: 12, right: 12 },
}

export function CaseProgressHud({
                                    position = 'top-right',
                                    scale = 1.0,
                                }: {
    position?: Corner
    scale?: number
}) {
    const { menuOpen, setMenuOpen, isInspecting } = useSettings()

    const toggleMenu = React.useCallback(() => {
        if (isInspecting) return
        setMenuOpen(!menuOpen)
    }, [menuOpen, setMenuOpen, isInspecting])

    const { puzzlesConfig, puzzleStatus } = useGameState()

    const entries = React.useMemo(
        () => Object.entries(puzzlesConfig) as [PuzzleId, PuzzleConfig][],
        [puzzlesConfig]
    )

    if (!entries.length) return null

    const total = entries.length
    const solved = entries.reduce(
        (acc, [id]) => acc + (puzzleStatus[id]?.solved ? 1 : 0),
        0
    )
    const pinned = entries.reduce(
        (acc, [id]) => acc + (puzzleStatus[id]?.pinned ? 1 : 0),
        0
    )
    const available = entries.reduce(
        (acc, [id]) => acc + (puzzleStatus[id]?.available ? 1 : 0),
        0
    )

    const allSolved = solved === total
    const progress = total > 0 ? solved / total : 0

    const transformOrigin =
        position === 'top-left'
            ? 'top left'
            : position === 'top-right'
                ? 'top right'
                : position === 'bottom-left'
                    ? 'bottom left'
                    : 'bottom right'

    return (
        <div
            style={{
                position: 'fixed',
                zIndex: 110,
                pointerEvents: 'auto',
                ...cornerStyle[position],
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin,
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gap: 6,
                        padding: '10px 12px',
                        borderRadius: 14,
                        background: 'rgba(0,0,0,0.55)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(4px)',
                        fontSize: 13,
                        lineHeight: 1.25,
                        boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                        minWidth: 170,
                        maxWidth: 220,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                        }}
                    >
                        <div style={{fontWeight: 700}}>Case progress</div>

                        <button
                            type="button"
                            onClick={toggleMenu}
                            aria-label="Toggle game menu"
                            title="Open/close game menu (Esc)"
                            style={{
                                padding: '0 8px',
                                minWidth: 32,
                                height: 22,
                                borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.08)',
                                color: 'white',
                                fontSize: 11,
                                lineHeight: 1,
                                cursor: 'pointer',
                            }}
                        >
                            Esc
                        </button>
                    </div>

                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: 6,
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.1)',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.round(progress * 100)}%`,
                                height: '100%',
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.9)',
                                transition: 'width 0.25s ease-out',
                            }}
                        />
                    </div>

                    <div style={{fontSize: 12, opacity: 0.9}}>
                        {solved} / {total} puzzles solved
                    </div>
                    <div style={{fontSize: 11, opacity: 0.8}}>
                        {available} discovered · {pinned} pinned
                        {allSolved ? ' · Case closed!' : ''}
                    </div>
                </div>
            </div>
        </div>
    )
}
