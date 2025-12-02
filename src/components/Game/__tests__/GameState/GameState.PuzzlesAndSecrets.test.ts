import { GameState } from '../../state.logic'
import { ANCHOR } from '../../anchors'
import { FileId, PZ, initialSnapshot } from '../../state.data'

describe('GameState – puzzles + secret files', () => {
    test('solveIdToPuzzle builds a reverse lookup from solvedFromInspectId', () => {
        // Goal:
        // Ensure `solveIdToPuzzle` maps from inspect ids to their PuzzleIds.
        //
        // Why:
        // The text-puzzle system reports solved state by inspect id. The game
        // needs a stable reverse lookup to find which puzzle should be updated.
        //
        // Type:
        // Pure selector unit test (read-only).
        //
        // Dependencies:
        // - GameState.solveIdToPuzzle.
        // - initialSnapshot.puzzlesConfig for ground truth.
        //
        // How:
        // - Read the map from a fresh GameState.
        // - Check several representative entries:
        //   - photo-red-circle → PhotoClue
        //   - puzzle-hbo-ict → HboIct
        //   - puzzle-semester-7 → Semester
        //   - puzzle-group-projects → GroupProjects
        //   - mug-initials → MugInitials

        const state = new GameState()
        const map = state.solveIdToPuzzle

        expect(map['photo-red-circle']).toBe(PZ.PhotoClue)
        expect(map['puzzle-hbo-ict']).toBe(PZ.HboIct)
        expect(map['puzzle-semester-7']).toBe(PZ.Semester)
        expect(map['puzzle-group-projects']).toBe(PZ.GroupProjects)
        expect(map['mug-initials']).toBe(PZ.MugInitials)
    })

    test('getPuzzleOverlay returns puzzle config + metadata derived from status', () => {
        // Goal:
        // Verify that getPuzzleOverlay:
        // - returns the underlying TextPuzzle for a valid id,
        // - derives solved / solvedAnswer from puzzleStatus,
        // - returns null for unknown ids.
        //
        // Why:
        // The puzzle overlay UI relies on this helper to combine static
        // configuration (text puzzle) with runtime status (solved, answer).
        //
        // Type:
        // Pure selector-style unit test, with a small write to change state.
        //
        // Dependencies:
        // - GameState.getPuzzleOverlay.
        // - GameState.pinPuzzle to change status.
        //
        // How:
        // - Call getPuzzleOverlay for HboIct before pinning:
        //   - expect solved=false and solvedAnswer undefined.
        // - Pin HboIct with a known answer.
        // - Call getPuzzleOverlay again:
        //   - expect solved=true and solvedAnswer to match.
        // - Call getPuzzleOverlay with a bogus id and expect null.

        const state = new GameState()

        // Before pinning: unsolved
        const before = state.getPuzzleOverlay(PZ.HboIct)
        expect(before).not.toBeNull()
        expect(before!.puzzle.id).toBe('puzzle-hbo-ict')
        expect(before!.metadata.puzzleId).toBe(PZ.HboIct)
        expect(before!.metadata.solved).toBe(false)
        expect(before!.metadata.solvedAnswer).toBeUndefined()

        // Pin and solve
        state.pinPuzzle(PZ.HboIct, true, 'hbo ict')

        const after = state.getPuzzleOverlay(PZ.HboIct)
        expect(after).not.toBeNull()
        expect(after!.metadata.solved).toBe(true)
        expect(after!.metadata.solvedAnswer).toBe('hbo ict')

        // Unknown id
        const unknown = state.getPuzzleOverlay('puzzle-does-not-exist' as any)
        expect(unknown).toBeNull()
    })

    test('setPuzzleAvailable toggles availability and spawns a poof when enabling a locked puzzle', () => {
        // Goal:
        // Ensure that:
        // - availability is updated,
        // - enabling from false -> true spawns a poof at the desk anchor,
        // - enabling an already-available puzzle does not spawn an extra poof.
        //
        // Why:
        // Unlocking a puzzle should both update logical availability and give
        // a visual cue in the room without duplicating effects on re-calls.
        //
        // Type:
        // Class-level unit test that touches both state and derived effects.
        //
        // Dependencies:
        // - GameState.setPuzzleAvailable.
        // - ANCHOR and initialSnapshot.puzzlesConfig for desk positions.
        //
        // How:
        // - Start with PhotoClue (initially unavailable).
        // - Call setPuzzleAvailable(PhotoClue, true):
        //   - expect available=true,
        //   - expect exactly 1 poof at the desk anchor position.
        // - Call setPuzzleAvailable(PhotoClue, true) again:
        //   - expect no additional poofs.

        const state = new GameState()

        const cfg = initialSnapshot.puzzlesConfig[PZ.PhotoClue]
        const expectedPos = ANCHOR[cfg.deskAnchorKey].position

        expect(state.snapshot.puzzleStatus[PZ.PhotoClue].available).toBe(false)
        expect(state.snapshot.poofs.length).toBe(0)

        state.setPuzzleAvailable(PZ.PhotoClue, true)

        expect(state.snapshot.puzzleStatus[PZ.PhotoClue].available).toBe(true)
        expect(state.snapshot.poofs.length).toBe(1)
        expect(state.snapshot.poofs[0].pos).toEqual(expectedPos)

        // Calling again with available already true should not spawn another poof
        state.setPuzzleAvailable(PZ.PhotoClue, true)
        expect(state.snapshot.poofs.length).toBe(1)
    })

    test('pinPuzzle marks puzzles as solved when pinned and preserves solved state when unpinned', () => {
        // Goal:
        // Verify that:
        // - pinning sets pinned=true and solved=true,
        //   and updates solvedAnswer when provided.
        // - unpinning keeps solved=true and preserves solvedAnswer.
        //
        // Why:
        // The puzzle wall uses "pinned" as a display toggle, while solved
        // status should remain sticky even when the puzzle is unpinned.
        //
        // Type:
        // Pure class-level unit test on the puzzleStatus state machine.
        //
        // Dependencies:
        // - GameState.pinPuzzle.
        // - GameState.snapshot.puzzleStatus.
        //
        // How:
        // - Pin HboIct with a known answer:
        //   - expect pinned=true, solved=true, solvedAnswer set.
        // - Unpin HboIct:
        //   - expect pinned=false but solved=true and solvedAnswer unchanged.

        const state = new GameState()

        state.pinPuzzle(PZ.HboIct, true, 'hbo ict')
        let status = state.snapshot.puzzleStatus[PZ.HboIct]

        expect(status.pinned).toBe(true)
        expect(status.solved).toBe(true)
        expect(status.solvedAnswer).toBe('hbo ict')

        state.pinPuzzle(PZ.HboIct, false)
        status = state.snapshot.puzzleStatus[PZ.HboIct]

        expect(status.pinned).toBe(false)
        expect(status.solved).toBe(true)
        expect(status.solvedAnswer).toBe('hbo ict')
    })

    test('handleSecretOpen for a world file unlocks puzzles, spawns poofs and removes non-persistent files', () => {
        // Goal:
        // Exercise the main secret-open flow for a world-space file:
        // - unlock its puzzle,
        // - spawn a poof at the desk anchor (via setPuzzleAvailable),
        // - spawn a second poof at the provided worldPos,
        // - remove the file if it is not persistent.
        //
        // Why:
        // World files drive the main progression chain. A single entry point
        // should coordinate puzzle unlocking, effects and clean-up.
        //
        // Type:
        // Integration-style unit test across multiple GameState methods.
        //
        // Dependencies:
        // - GameState.handleSecretOpen.
        // - GameState.setPuzzleAvailable (called internally).
        // - ANCHOR / initialSnapshot for desk anchor positions.
        //
        // How:
        // - Use the PhotoClue world file which unlocks PZ.PhotoClue.
        // - Call handleSecretOpen with a specific worldPos.
        // - Expect:
        //   - puzzleStatus[PhotoClue].available === true.
        //   - two poofs:
        //     1) at the desk anchor position,
        //     2) at worldPos.
        //   - the file removed from snapshot.files.

        const state = new GameState()

        const cfg = initialSnapshot.puzzlesConfig[PZ.PhotoClue]
        const deskAnchorPos = ANCHOR[cfg.deskAnchorKey].position
        const worldPos: [number, number, number] = [1, 2, 3]

        state.handleSecretOpen({ id: FileId.PhotoClue, worldPos })

        const puzzleStatus = state.snapshot.puzzleStatus[PZ.PhotoClue]
        expect(puzzleStatus.available).toBe(true)

        // Two poofs:
        // - one from setPuzzleAvailable at the desk anchor,
        // - one from handleSecretOpen at worldPos.
        expect(state.snapshot.poofs.length).toBe(2)
        expect(state.snapshot.poofs[0].pos).toEqual(deskAnchorPos)
        expect(state.snapshot.poofs[1].pos).toEqual(worldPos)

        const fileIds = state.snapshot.files.map(f => f.id)
        expect(fileIds).not.toContain(FileId.PhotoClue)
    })

    test('handleSecretOpen for a drawer file unlocks puzzles, spawns poofs and marks the drawer as empty', () => {
        // Goal:
        // Verify the drawer secret-file flow:
        // - unlocks the puzzle,
        // - spawns a poof at the desk anchor (via setPuzzleAvailable),
        // - spawns a poof at worldPos when provided,
        // - removes the drawer file when not persistent,
        // - sets the drawer entry fileAlive=false.
        //
        // Why:
        // Drawer-based secrets should behave similarly to world files but also
        // update the drawer’s state so the UI stops rendering the document.
        //
        // Type:
        // Integration-style unit test across GameState methods.
        //
        // Dependencies:
        // - GameState.handleSecretOpen.
        // - GameState.setDrawer and setPuzzleAvailable (indirectly).
        // - ANCHOR / initialSnapshot for desk anchor positions.
        //
        // How:
        // - Use the InDrawer file which unlocks GroupProjects.
        // - Provide a worldPos to force a visible poof.
        // - Expect:
        //   - puzzleStatus[GroupProjects].available === true.
        //   - drawer_files no longer contain InDrawer.
        //   - drawers.leftTop.fileAlive === false.
        //   - two poofs:
        //     1) at the desk anchor,
        //     2) at worldPos.

        const state = new GameState()

        const worldPos: [number, number, number] = [0.5, 0.6, 0.7]
        const cfg = initialSnapshot.puzzlesConfig[PZ.GroupProjects]
        const deskAnchorPos = ANCHOR[cfg.deskAnchorKey].position

        expect(state.snapshot.puzzleStatus[PZ.GroupProjects].available).toBe(false)

        state.handleSecretOpen({ id: FileId.InDrawer, worldPos })

        const puzzleStatus = state.snapshot.puzzleStatus[PZ.GroupProjects]
        expect(puzzleStatus.available).toBe(true)

        // Drawer file should be gone
        const drawerIds = state.snapshot.drawer_files.map(f => f.id)
        expect(drawerIds).not.toContain(FileId.InDrawer)

        // Drawer state should be updated
        const drawer = state.snapshot.drawers.leftTop
        expect(drawer?.fileAlive).toBe(false)

        // Two poofs:
        // - one at the desk anchor from setPuzzleAvailable,
        // - one at the worldPos from handleSecretOpen.
        expect(state.snapshot.poofs.length).toBe(2)
        expect(state.snapshot.poofs[0].pos).toEqual(deskAnchorPos)
        expect(state.snapshot.poofs[1].pos).toEqual(worldPos)
    })
})
