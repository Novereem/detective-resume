import { GameState } from '../../state.logic'
import { FileId, initialSnapshot } from '../../state.data'

describe('GameState – core + poofs', () => {
    test('notifies subscribers on state changes', () => {
        // Goal:
        // Verify that calling a mutation method causes subscribed listeners
        // to be invoked exactly once per state change.
        //
        // Why:
        // The React hooks rely on this notification mechanism to trigger
        // re-renders whenever the game snapshot changes.
        //
        // Type:
        // Pure class-level unit test (no React / R3F).
        //
        // Dependencies:
        // - GameState.subscribe / GameState.spawnPoof.
        // - Jest assertions for counting callbacks.
        //
        // How:
        // - Subscribe with a callback that increments a counter.
        // - Call a mutation (`spawnPoof`).
        // - Expect the counter to have been incremented exactly once.

        const state = new GameState()
        let calls = 0

        const unsubscribe = state.subscribe(() => {
            calls += 1
        })

        state.spawnPoof([0, 0, 0] as any)

        expect(calls).toBe(1)
        unsubscribe()
    })

    test('spawnPoof appends a poof with an id and the given position', () => {
        // Goal:
        // Ensure spawnPoof adds a poof entry with:
        // - a non-empty id string,
        // - the exact requested position.
        //
        // Why:
        // Poofs are used as transient visual feedback. They must have stable
        // ids for React keys and the position must match the requested effect
        // location in world space.
        //
        // Type:
        // Pure class-level unit test focusing on state mutation.
        //
        // Dependencies:
        // - GameState.spawnPoof.
        // - GameState.snapshot.poofs.
        //
        // How:
        // - Call spawnPoof with a Vec3.
        // - Inspect snapshot.poofs and assert:
        //   - length is 1,
        //   - id is a non-empty string,
        //   - pos equals the provided Vec3.

        const state = new GameState()
        const pos: [number, number, number] = [1, 2, 3]

        state.spawnPoof(pos)

        const poofs = state.snapshot.poofs
        expect(poofs.length).toBe(1)

        const [poof] = poofs
        expect(typeof poof.id).toBe('string')
        expect(poof.id.length).toBeGreaterThan(0)
        expect(poof.pos).toEqual(pos)
    })

    test('removePoof removes a poof by id', () => {
        // Goal:
        // Verify that removePoof filters out the correct poof by id and
        // leaves other entries intact.
        //
        // Why:
        // Poofs are short-lived. Components will request removal when their
        // animation finishes; this must not affect other active poofs.
        //
        // Type:
        // Pure class-level unit test focusing on list filtering.
        //
        // Dependencies:
        // - GameState.spawnPoof.
        // - GameState.removePoof.
        // - GameState.snapshot.poofs.
        //
        // How:
        // - Spawn two poofs.
        // - Remove the first one by id.
        // - Expect only the second to remain with its original position.

        const state = new GameState()

        state.spawnPoof([0, 0, 0] as any)
        state.spawnPoof([1, 1, 1] as any)

        const [first, second] = state.snapshot.poofs
        state.removePoof(first.id)

        const poofs = state.snapshot.poofs
        expect(poofs.length).toBe(1)
        expect(poofs[0].id).toBe(second.id)
        expect(poofs[0].pos).toEqual([1, 1, 1])
    })

    test('removeFile removes a world-space file by SecretFileId', () => {
        // Goal:
        // Ensure removeFile only affects the `files` array and leaves other
        // snapshot fields intact.
        //
        // Why:
        // World-space secret files should disappear permanently once taken,
        // but their removal must not accidentally wipe other game state.
        //
        // Type:
        // Pure class-level unit test focusing on array filtering.
        //
        // Dependencies:
        // - GameState.removeFile.
        // - initialSnapshot.files for baseline ids.
        //
        // How:
        // - Capture initial world-file ids from initialSnapshot.
        // - Remove `FileId.Badge`.
        // - Expect:
        //   - Badge id no longer present,
        //   - number of files decreased by exactly 1.

        const state = new GameState()

        const originalIds = initialSnapshot.files.map(f => f.id)
        expect(originalIds).toContain(FileId.Badge)

        state.removeFile(FileId.Badge)

        const currentIds = state.snapshot.files.map(f => f.id)
        expect(currentIds).not.toContain(FileId.Badge)
        expect(currentIds.length).toBe(originalIds.length - 1)
    })

    test('setDrawer merges patches into drawer state', () => {
        // Goal:
        // Verify that setDrawer:
        // - merges the patch into the existing drawer object,
        // - keeps other drawers and fields untouched.
        //
        // Why:
        // Drawers may carry multiple bits of state over time. Patches must
        // be applied shallowly without resetting the entire `drawers` map.
        //
        // Type:
        // Pure class-level unit test for partial updates.
        //
        // Dependencies:
        // - GameState.setDrawer.
        // - GameState.snapshot.drawers.
        //
        // How:
        // - Check the initial `leftTop.fileAlive` flag.
        // - Patch `leftTop` with `{ fileAlive: false }`.
        // - Expect:
        //   - `fileAlive` to be false,
        //   - other drawer entries unaffected (implicit).

        const state = new GameState()

        const before = state.snapshot.drawers.leftTop
        expect(before?.fileAlive).toBe(true)

        state.setDrawer('leftTop', { fileAlive: false })

        const after = state.snapshot.drawers.leftTop
        expect(after?.fileAlive).toBe(false)
    })

    test('cardboard box open flow updates status and openNonce correctly', () => {
        // Goal:
        // Ensure the cardboard box helpers transition through:
        //   - closed -> opening -> opened
        // and bump `openNonce` when opening is requested.
        //
        // Why:
        // Box animations need a stable change token (`openNonce`) and an
        // explicit status, so they can react correctly to user input and
        // avoid repeated open transitions.
        //
        // Type:
        // Pure class-level unit test for a small state machine.
        //
        // Dependencies:
        // - GameState.requestOpenCardboardBox.
        // - GameState.finishOpenCardboardBox.
        // - GameState.snapshot.cardboardBoxes.
        //
        // How:
        // - Call requestOpenCardboardBox('box-1').
        // - Assert status='opening' and openNonce=1.
        // - Call finishOpenCardboardBox('box-1').
        // - Assert status='opened' and openNonce unchanged.

        const state = new GameState()

        state.requestOpenCardboardBox('box-1')
        let box = state.snapshot.cardboardBoxes['box-1']
        expect(box).toBeDefined()
        expect(box!.status).toBe('opening')
        expect(box!.openNonce).toBe(1)

        state.finishOpenCardboardBox('box-1')
        box = state.snapshot.cardboardBoxes['box-1']
        expect(box).toBeDefined()
        expect(box!.status).toBe('opened')
        expect(box!.openNonce).toBe(1)
    })
})
