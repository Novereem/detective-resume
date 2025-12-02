import * as React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {usePuzzleInspect} from '../usePuzzleInspect'
import {gameState} from '../state'
import {PZ, initialSnapshot} from '../state.data'

describe('usePuzzleInspect', () => {
    function resetGameState() {
        const anyState = gameState as any
        anyState._snapshot = initialSnapshot
        if (anyState.listeners && typeof anyState.listeners.clear === 'function') {
            anyState.listeners.clear()
        }
    }

    beforeEach(() => {
        resetGameState()
    })

    type InspectLike = {
        pixelSize?: number
        inspectDistance?: number
        puzzle?: any
        metadata?: any
    }

    function TestComponent(props: {
        puzzleId: any
        base: InspectLike
        onInspect: (s: InspectLike) => void
    }) {
        const {puzzleId, base, onInspect} = props
        const openPuzzleInspect = usePuzzleInspect(puzzleId, onInspect as any)

        return (
            <button
                type="button"
                onClick={() => {
                    openPuzzleInspect(base as any)
                }}
            >
                Trigger
            </button>
        )
    }

    test('falls back to base inspect state when puzzle config is missing', () => {
        // Goal:
        // Ensure that if `puzzlesConfig[puzzleId]` is missing, the hook simply
        // forwards the original inspect state to `openInspect` without changes.
        //
        // Why:
        // This makes the hook safe to use with dynamic or stale puzzle ids
        // without crashing or silently constructing half-baked inspect states.
        //
        // Type:
        // Hook-level unit test with a minimal wrapper component.
        //
        // Dependencies:
        // - usePuzzleInspect (subject under test).
        // - gameState / initialSnapshot for baseline config.
        // - React Testing Library for rendering and event simulation.
        //
        // How:
        // - Use a fake puzzle id that does not exist in puzzlesConfig.
        // - Provide a base inspect-like object.
        // - Click the trigger button.
        // - Expect `onInspect` to have been called exactly once with the
        //   original base object.

        const onInspect = jest.fn()
        const base: InspectLike = {
            pixelSize: 2,
            inspectDistance: 1.23,
            metadata: {fromBase: true},
        }

        const {getByText} = render(
            <TestComponent
                puzzleId={'puzzle-does-not-exist' as any}
                base={base}
                onInspect={onInspect}
            />,
        )

        fireEvent.click(getByText('Trigger'))

        expect(onInspect).toHaveBeenCalledTimes(1)
        expect(onInspect).toHaveBeenCalledWith(base)
    })

    test('applies puzzle view overrides and injects puzzle metadata', () => {
        // Goal:
        // Verify that the hook:
        // - reads the puzzle config for a valid PuzzleId,
        // - overrides pixelSize and inspectDistance from `cfg.view` when set,
        // - injects the puzzle inspect model and metadata.
        //
        // Why:
        // This is the core behavior that ties game state to the inspect
        // overlay: puzzles must control zoom level, distance and the content
        // shown, while preserving any existing metadata from the caller.
        //
        // Type:
        // Hook-level integration test against the real gameState snapshot.
        //
        // Dependencies:
        // - usePuzzleInspect.
        // - gameState / initialSnapshot with the built-in puzzles.
        // - PZ.HboIct to target a known puzzle that defines pixelSize and
        //   inspectDistance in its view config.
        //
        // How:
        // - Render TestComponent for PZ.HboIct.
        // - Use a base inspect-like object with its own pixelSize,
        //   inspectDistance and metadata.
        // - Trigger the hook and capture the merged inspect state.
        // - Assert:
        //   - pixelSize / inspectDistance equal the config values.
        //   - puzzle equals `cfg.view.inspect`.
        //   - metadata keeps base fields but overwrites type, puzzleId,
        //     solved and solvedAnswer.

        const onInspect = jest.fn()
        const base: InspectLike = {
            pixelSize: 10,
            inspectDistance: 999,
            metadata: {
                fromBase: true,
                type: 'other',
                note: 'keep me',
            },
        }

        const {getByText} = render(
            <TestComponent
                puzzleId={PZ.HboIct}
                base={base}
                onInspect={onInspect}
            />,
        )

        fireEvent.click(getByText('Trigger'))

        expect(onInspect).toHaveBeenCalledTimes(1)
        const merged = onInspect.mock.calls[0][0] as InspectLike

        const cfg = initialSnapshot.puzzlesConfig[PZ.HboIct]

        // View overrides
        expect(merged.pixelSize).toBe(cfg.view.pixelSize)
        expect(merged.inspectDistance).toBe(cfg.view.inspectDistance)
        expect(merged.puzzle).toBe(cfg.view.inspect)

        // Base metadata is preserved
        expect(merged.metadata.fromBase).toBe(true)
        expect(merged.metadata.note).toBe('keep me')

        // Puzzle metadata is injected / overrides type etc.
        expect(merged.metadata.type).toBe('puzzle')
        expect(merged.metadata.puzzleId).toBe(cfg.id)
        expect(merged.metadata.solved).toBe(false)
        expect(merged.metadata.solvedAnswer).toBeUndefined()
    })

    test('reflects solved state from puzzleStatus in metadata', () => {
        // Goal:
        // Ensure that the hook reads `puzzleStatus[puzzleId]` and correctly
        // exposes `solved` and `solvedAnswer` in the outgoing metadata.
        //
        // Why:
        // The inspect overlay needs to show different UI when a puzzle has
        // already been solved (for example, confirmation messages or locking
        // input), so this wiring must be reliable.
        //
        // Type:
        // Hook-level integration test using the real gameState and its
        // mutation helpers.
        //
        // Dependencies:
        // - usePuzzleInspect.
        // - gameState.pinPuzzle to mark a puzzle as solved.
        // - initialSnapshot.puzzlesConfig for the reference puzzle id.
        //
        // How:
        // - Mark PZ.HboIct as solved with a known answer using gameState.
        // - Render TestComponent for PZ.HboIct.
        // - Trigger the hook and capture the metadata.
        // - Assert that:
        //   - metadata.solved === true.
        //   - metadata.solvedAnswer equals the answer we passed.

        gameState.pinPuzzle(PZ.HboIct, true, 'hbo ict')

        const onInspect = jest.fn()
        const base: InspectLike = {
            metadata: {fromBase: true},
        }

        const {getByText} = render(
            <TestComponent
                puzzleId={PZ.HboIct}
                base={base}
                onInspect={onInspect}
            />,
        )

        fireEvent.click(getByText('Trigger'))

        expect(onInspect).toHaveBeenCalledTimes(1)
        const merged = onInspect.mock.calls[0][0] as InspectLike

        expect(merged.metadata.solved).toBe(true)
        expect(merged.metadata.solvedAnswer).toBe('hbo ict')
        expect(merged.metadata.fromBase).toBe(true)
    })
})
