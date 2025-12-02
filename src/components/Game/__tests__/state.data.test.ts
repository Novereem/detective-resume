import { PZ, initialSnapshot } from '../state.data'
import { ANCHOR } from '../anchors'
import type { PuzzleId } from '../../Types/game'

describe('state.data – puzzle + file invariants', () => {
    test('puzzlesConfig, puzzleStatus and PZ stay in sync', () => {
        // Goal:
        // Ensure that every declared PuzzleId:
        // - has a config entry,
        // - has a status entry,
        // and there are no extra configs or statuses for unknown ids.
        //
        // Why:
        // When new puzzles are added or existing ones are renamed, it is easy
        // to forget to update all three places. This test acts as a guardrail
        // so the game logic and overlays never see half-configured puzzles.
        //
        // Type:
        // Data invariants unit test (read-only).
        //
        // Dependencies:
        // - PZ for the authoritative list of puzzle ids.
        // - initialSnapshot.puzzlesConfig.
        // - initialSnapshot.puzzleStatus.
        //
        // How:
        // - Collect ids from PZ, puzzlesConfig and puzzleStatus.
        // - Compare them as sorted sets to ensure they are identical.

        const declaredIds = Object.values(PZ).slice().sort()
        const configIds = Object.keys(initialSnapshot.puzzlesConfig).slice().sort()
        const statusIds = Object.keys(initialSnapshot.puzzleStatus).slice().sort()

        expect(configIds).toEqual(declaredIds)
        expect(statusIds).toEqual(declaredIds)
    })

    test('each puzzle has a unique, non-empty solvedFromInspectId', () => {
        // Goal:
        // Verify that every puzzle defines a non-empty `solvedFromInspectId`
        // and that no two puzzles share the same id.
        //
        // Why:
        // The solveIdToPuzzle lookup relies on these ids being unique. If two
        // puzzles reuse the same inspect id, the game cannot reliably decide
        // which puzzle was solved.
        //
        // Type:
        // Data invariants unit test (read-only).
        //
        // Dependencies:
        // - initialSnapshot.puzzlesConfig.
        //
        // How:
        // - Collect all solvedFromInspectId values.
        // - Assert that each is a non-empty string.
        // - Assert that the number of unique ids equals the total length.

        const solvedIds = Object.values(initialSnapshot.puzzlesConfig).map(
            cfg => cfg.solvedFromInspectId,
        )

        solvedIds.forEach(id => {
            expect(typeof id).toBe('string')
            expect(id.length).toBeGreaterThan(0)
        })

        const unique = new Set(solvedIds)
        expect(unique.size).toBe(solvedIds.length)
    })

    test('every unlocksPuzzleId points to a known puzzle', () => {
        // Goal:
        // Ensure that all secret files and drawer files reference valid
        // puzzles when they specify `unlocksPuzzleId`.
        //
        // Why:
        // When wiring new secrets into the room, a typo or stale puzzle id
        // would silently break progression. This test fails fast instead.
        //
        // Type:
        // Data invariants unit test (read-only).
        //
        // Dependencies:
        // - initialSnapshot.files.
        // - initialSnapshot.drawer_files.
        // - initialSnapshot.puzzlesConfig.
        //
        // How:
        // - Build a Set of valid puzzle ids from puzzlesConfig.
        // - Collect all unlocksPuzzleId values from files and drawer_files.
        // - Assert that each one exists in the valid id set.

        const validPuzzleIds = new Set<PuzzleId>(
            Object.keys(initialSnapshot.puzzlesConfig) as PuzzleId[],
        )

        const unlocksFromFiles = initialSnapshot.files
            .map(f => f.unlocksPuzzleId)
            .filter((id): id is PuzzleId => !!id)

        const unlocksFromDrawers = initialSnapshot.drawer_files
            .map(f => f.unlocksPuzzleId)
            .filter((id): id is PuzzleId => !!id)

        const allUnlocks: PuzzleId[] = [...unlocksFromFiles, ...unlocksFromDrawers]

        allUnlocks.forEach(id => {
            expect(validPuzzleIds.has(id)).toBe(true)
        })
    })

    test('all puzzle anchors resolve to an existing ANCHOR entry', () => {
        // Goal:
        // Verify that deskAnchorKey and wallAnchorKey for each puzzle both
        // point to defined anchors.
        //
        // Why:
        // When adding new puzzles, it is easy to mistype an AnchorKey or to
        // forget to add a corresponding entry in anchors.ts. This test makes
        // those wiring issues visible immediately.
        //
        // Type:
        // Data invariants unit test (read-only).
        //
        // Dependencies:
        // - initialSnapshot.puzzlesConfig.
        // - ANCHOR map from anchors.ts.
        //
        // How:
        // - Iterate all puzzles.
        // - Assert that ANCHOR[deskAnchorKey] and ANCHOR[wallAnchorKey] are
        //   both defined.

        for (const cfg of Object.values(initialSnapshot.puzzlesConfig)) {
            expect(ANCHOR[cfg.deskAnchorKey]).toBeDefined()
            expect(ANCHOR[cfg.wallAnchorKey]).toBeDefined()
        }
    })
})
