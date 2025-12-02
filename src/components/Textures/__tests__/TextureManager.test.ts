import * as THREE from 'three';
import {
    loadManagedTexture,
    releaseManagedTexture,
    preloadTextures,
    disposeAllManagedTextures,
    subscribeTextureLoading,
} from '@/components/Textures/TextureManager';
import type { LoadState } from '@/components/Types/textures';

// We intercept TextureLoader.load so we don't hit the network and so we can
// precisely control when loads "finish".
type LoadCall = {
    url: string;
    tex: THREE.Texture;
    onLoad: (tex: THREE.Texture) => void;
    onError?: (err: any) => void;
};

let loadCalls: LoadCall[] = [];
let loaderSpy: jest.SpyInstance;

beforeEach(() => {
    jest.clearAllMocks();
    loadCalls = [];

    loaderSpy = jest
        .spyOn(THREE.TextureLoader.prototype, 'load')
        .mockImplementation(
            (
                url: string,
                onLoad?: (tex: THREE.Texture) => void,
                _onProgress?: (ev: any) => void,
                onError?: (err: any) => void,
            ) => {
                const tex = new THREE.Texture();
                // Spy-able dispose for later assertions
                tex.dispose = jest.fn() as any;
                loadCalls.push({
                    url,
                    tex,
                    onLoad: onLoad as (t: THREE.Texture) => void,
                    onError,
                });
                return tex as any;
            },
        );

    // Ensure we start from a clean cache each time
    disposeAllManagedTextures();
});

afterEach(() => {
    loaderSpy.mockRestore();
});

describe('TextureManager', () => {
    test('loadManagedTexture caches textures and reuses the same instance for repeated URLs', async () => {
        // Goal:
        // Ensure that the manager loads a texture once per URL and reuses the
        // same instance/promise when called multiple times with the same URL.
        //
        // Why:
        // This is the core caching behaviour that keeps GPU memory and network
        // usage under control across the detective room.
        //
        // How:
        // - Call loadManagedTexture twice with the same URL before the load resolves.
        // - Verify that TextureLoader.load was called only once.
        // - Manually trigger the onLoad callback.
        // - Await both Promises and assert they resolve to the same texture.
        const url = '/textures/testimage.jpg';

        const p1 = loadManagedTexture(url);
        const p2 = loadManagedTexture(url);

        expect(loaderSpy).toHaveBeenCalledTimes(1);
        expect(loadCalls.length).toBe(1);
        const call = loadCalls[0];

        // Simulate successful load
        call.onLoad(call.tex);

        const [t1, t2] = await Promise.all([p1, p2]);

        expect(t1).toBe(call.tex);
        expect(t2).toBe(call.tex);
        expect((t1.dispose as jest.Mock).mock.calls.length).toBe(0);
    });

    test('releaseManagedTexture only disposes after the last reference', async () => {
        // Goal:
        // Verify that ref counting works and textures are only disposed when
        // the last consumer releases them.
        //
        // Why:
        // This prevents premature disposal while multiple meshes share the same
        // texture, which would otherwise cause rendering glitches.
        //
        // How:
        // - Load the same URL twice (two logical references).
        // - Resolve the load.
        // - Call releaseManagedTexture once: expect no dispose.
        // - Call releaseManagedTexture a second time: expect a single dispose call.
        const url = '/textures/cardboard.jpg';

        const p1 = loadManagedTexture(url);
        const p2 = loadManagedTexture(url);

        const call = loadCalls[0];
        call.onLoad(call.tex);

        const tex = await p1;
        await p2;

        const disposeMock = tex.dispose as jest.Mock;

        releaseManagedTexture(url);
        expect(disposeMock).not.toHaveBeenCalled();

        releaseManagedTexture(url);
        expect(disposeMock).toHaveBeenCalledTimes(1);
    });

    test('preloadTextures deduplicates URLs and resolves when all are loaded', async () => {
        // Goal:
        // Ensure preloadTextures:
        // - Filters out duplicates.
        // - Triggers exactly one load per unique URL.
        // - Resolves once all loads finish.
        //
        // Why:
        // This is used to preload the full detective room texture set; any
        // over-fetch or hanging promise would show up as slower loads or
        // incomplete rooms.
        //
        // How:
        // - Call preloadTextures with some duplicates.
        // - Verify TextureLoader.load is invoked once per unique URL.
        // - Manually resolve each load and await the preload Promise.
        const urls = ['/textures/a.jpg', '/textures/a.jpg', '/textures/b.jpg'];

        const preloadPromise = preloadTextures(urls);

        // Two unique URLs -> two load calls
        expect(loaderSpy).toHaveBeenCalledTimes(2);
        expect(loadCalls.map(c => c.url).sort()).toEqual(
            ['/textures/a.jpg', '/textures/b.jpg'].sort(),
        );

        // Resolve both loads
        loadCalls.forEach(c => c.onLoad(c.tex));

        await expect(preloadPromise).resolves.toBeUndefined();
    });

    test('disposeAllManagedTextures disposes all cached textures and clears them', async () => {
        // Goal:
        // Confirm that disposeAllManagedTextures cleans up all textures and
        // does not double-dispose when releaseManagedTexture is called later.
        //
        // Why:
        // This prevents GPU memory leaks when leaving the detective room and
        // makes it safe to hard-reset the scene.
        //
        // How:
        // - Load a couple of textures and resolve them.
        // - Call disposeAllManagedTextures and assert each texture’s dispose()
        //   is called exactly once.
        // - Call releaseManagedTexture afterwards and ensure no extra disposes occur.
        const urls = ['/textures/x.jpg', '/textures/y.jpg'];

        const p1 = loadManagedTexture(urls[0]);
        const p2 = loadManagedTexture(urls[1]);

        loadCalls.forEach(c => c.onLoad(c.tex));
        const [t1, t2] = await Promise.all([p1, p2]);

        const d1 = t1.dispose as jest.Mock;
        const d2 = t2.dispose as jest.Mock;

        disposeAllManagedTextures();

        expect(d1).toHaveBeenCalledTimes(1);
        expect(d2).toHaveBeenCalledTimes(1);

        // Further releases should not cause new dispose calls
        releaseManagedTexture(urls[0]);
        releaseManagedTexture(urls[1]);

        expect(d1).toHaveBeenCalledTimes(1);
        expect(d2).toHaveBeenCalledTimes(1);
    });

    test('subscribeTextureLoading reports state changes while loading and after completion', async () => {
        // Goal:
        // Check that subscribeTextureLoading:
        // - Immediately emits an initial state.
        // - Emits non-zero pending/inFlight while loads are active.
        // - Returns to zero once loads complete.
        //
        // Why:
        // The UI (and dev overlays) rely on this state to show accurate loading
        // feedback during heavy texture loads.
        //
        // How:
        // - Subscribe and record all states.
        // - Start a couple of loads and ensure we see pending/inFlight > 0.
        // - Resolve all loads and ensure the final state has all counters at zero.
        const states: LoadState[] = [];
        const unsubscribe = subscribeTextureLoading((s) => {
            states.push(s);
        });

        // Initial state
        expect(states[0]).toEqual({ pending: 0, inFlight: 0, queued: 0 });

        const p1 = loadManagedTexture('/textures/1.jpg');
        const p2 = loadManagedTexture('/textures/2.jpg');

        // After requesting two loads, we should see at least one non-zero state
        expect(states.some(s => s.pending > 0)).toBe(true);
        expect(states.some(s => s.inFlight > 0)).toBe(true);

        // Resolve both loads
        loadCalls.forEach(c => c.onLoad(c.tex));
        await Promise.all([p1, p2]);

        const last = states[states.length - 1];
        expect(last.pending).toBe(0);
        expect(last.inFlight).toBe(0);
        expect(last.queued).toBe(0);

        unsubscribe();
    });
});
