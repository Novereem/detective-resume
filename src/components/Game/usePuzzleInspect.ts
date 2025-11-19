'use client'

import * as React from 'react'
import { useGameState } from '@/components/Game/state'
import type { PuzzleId } from '@/components/Types/game'
import type { InspectState } from '@/components/Types/inspectModels'

export function usePuzzleInspect(
    puzzleId: PuzzleId,
    openInspect: (s: InspectState) => void
) {
    const { puzzlesConfig, puzzleStatus } = useGameState()

    return React.useCallback(
        (base: InspectState) => {
            const cfg = puzzlesConfig[puzzleId]
            if (!cfg) {
                openInspect(base)
                return
            }

            const status = puzzleStatus[puzzleId]

            const merged: InspectState = {
                ...base,
                pixelSize: cfg.view.pixelSize ?? base.pixelSize,
                inspectDistance: cfg.view.inspectDistance ?? base.inspectDistance,
                puzzle: cfg.view.inspect,
                metadata: {
                    ...(base as any).metadata,
                    type: 'puzzle',
                    puzzleId: cfg.id,
                    solved: !!status?.solved,
                    solvedAnswer: status?.solvedAnswer,
                },
            }

            openInspect(merged)
        },
        [puzzleId, openInspect, puzzlesConfig, puzzleStatus]
    )
}