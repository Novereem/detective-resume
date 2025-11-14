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

            openInspect({
                ...base,
                puzzle: cfg.view.inspect,
                metadata: {
                    type: 'puzzle',
                    puzzleId: cfg.id,
                    solved: !!status?.solved,
                    solvedAnswer: status?.solvedAnswer,
                },
            })
        },
        [puzzleId, openInspect, puzzlesConfig, puzzleStatus]
    )
}
