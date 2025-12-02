import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { useManagedTexture } from '@/components/Textures/useManagedTexture';
import { useTextureLoading } from '@/components/Textures/useTextureLoading';

// Dedicated mocks for the TextureManager functions used by the hooks
const loadManagedTextureMock = jest.fn();
const releaseManagedTextureMock = jest.fn();
const subscribeTextureLoadingMock = jest.fn();

// IMPORTANT: use a relative path here, not the "@/..." alias
jest.mock('../TextureManager', () => ({
    loadManagedTexture: (...args: any[]) => loadManagedTextureMock(...args),
    releaseManagedTexture: (...args: any[]) => releaseManagedTextureMock(...args),
    subscribeTextureLoading: (...args: any[]) => subscribeTextureLoadingMock(...args),
}));

describe('useManagedTexture', () => {
    function TestComponent({
                               url,
                               onTexture,
                           }: {
        url?: string;
        onTexture: (t: any) => void;
    }) {
        const tex = useManagedTexture(url);
        React.useEffect(() => {
            onTexture(tex);
        }, [tex, onTexture]);
        return null;
    }

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('loads a texture when URL is provided and exposes it', async () => {
        // Goal:
        // Verify that useManagedTexture calls loadManagedTexture for a given URL
        // and surfaces the resolved texture to the component.
        //
        // Why:
        // This hook is the main entry point for components that want a managed
        // texture without dealing with the manager directly.
        //
        // Type:
        // Hook-level unit test (React + React Testing Library).
        //
        // Dependencies:
        // - React Testing Library render/waitFor
        // - jest.mock('../TextureManager') with loadManagedTextureMock
        //
        // How:
        // - Mock loadManagedTexture to resolve to a fake texture.
        // - Render a test component with a URL.
        // - Wait until the callback receives the texture and verify the URL passed in.
        const fakeTex = { id: 'tex-1' };
        loadManagedTextureMock.mockResolvedValue(fakeTex);

        const onTexture = jest.fn();
        render(
            <TestComponent url="/textures/a.jpg" onTexture={onTexture} />,
        );

        await waitFor(() => {
            expect(loadManagedTextureMock).toHaveBeenCalledWith(
                '/textures/a.jpg',
                undefined,
            );
            expect(onTexture).toHaveBeenCalledWith(fakeTex);
        });
    });

    test('releases previous texture when URL changes', async () => {
        // Goal:
        // Ensure that when the URL changes, the hook:
        // - Calls loadManagedTexture for the new URL.
        // - Calls releaseManagedTexture for the previous URL.
        //
        // Why:
        // This prevents leaking references when components swap textures at runtime.
        //
        // Type:
        // Hook-level unit test (React + React Testing Library).
        //
        // Dependencies:
        // - React Testing Library render/waitFor
        // - jest.mock('../TextureManager') with load/release mocks
        //
        // How:
        // - Render with an initial URL and wait for the first texture to resolve.
        // - Re-render with a different URL.
        // - Assert that loadManagedTexture sees both URLs and that
        //   releaseManagedTexture is called with the old one.
        const fakeTex1 = { id: 'tex-1' };
        const fakeTex2 = { id: 'tex-2' };
        loadManagedTextureMock
            .mockResolvedValueOnce(fakeTex1)
            .mockResolvedValueOnce(fakeTex2);

        const onTexture = jest.fn();
        const { rerender } = render(
            <TestComponent url="/textures/a.jpg" onTexture={onTexture} />,
        );

        // Wait for first load
        await waitFor(() => {
            expect(onTexture).toHaveBeenCalledWith(fakeTex1);
        });

        // Change URL
        rerender(
            <TestComponent url="/textures/b.jpg" onTexture={onTexture} />,
        );

        await waitFor(() => {
            expect(loadManagedTextureMock).toHaveBeenCalledWith(
                '/textures/b.jpg',
                undefined,
            );
        });

        expect(releaseManagedTextureMock).toHaveBeenCalledWith(
            '/textures/a.jpg',
        );
    });

    test('clears and releases texture when URL becomes undefined', async () => {
        // Goal:
        // Confirm that when the URL is cleared, the hook:
        // - Sets the texture back to null.
        // - Calls releaseManagedTexture for the previous URL.
        //
        // Why:
        // This is important for components that conditionally render textures
        // based on state; it ensures references are cleaned up properly.
        //
        // Type:
        // Hook-level unit test (React + React Testing Library).
        //
        // Dependencies:
        // - React Testing Library render/waitFor
        // - jest.mock('../TextureManager') with load/release mocks
        //
        // How:
        // - Render with a URL and wait for the texture to resolve.
        // - Re-render with url={undefined}.
        // - Assert that releaseManagedTexture is called with the old URL and
        //   that the callback sees `null`.
        const fakeTex = { id: 'tex-1' };
        loadManagedTextureMock.mockResolvedValue(fakeTex);

        const onTexture = jest.fn();
        const { rerender } = render(
            <TestComponent url="/textures/a.jpg" onTexture={onTexture} />,
        );

        await waitFor(() => {
            expect(onTexture).toHaveBeenCalledWith(fakeTex);
        });

        rerender(
            <TestComponent url={undefined} onTexture={onTexture} />,
        );

        expect(releaseManagedTextureMock).toHaveBeenCalledWith(
            '/textures/a.jpg',
        );
        expect(onTexture).toHaveBeenLastCalledWith(null);
    });
});

describe('useTextureLoading', () => {
    function LoadingTest({ onState }: { onState: (s: any) => void }) {
        const state = useTextureLoading();
        React.useEffect(() => {
            onState(state);
        }, [state, onState]);
        return null;
    }

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('subscribes to manager and maps pending > 0 to isLoading', async () => {
        // Goal:
        // Verify that useTextureLoading:
        // - Calls subscribeTextureLoading.
        // - Derives isLoading from the pending counter.
        //
        // Why:
        // This hook is used by UI to show a global “textures loading” state
        // without wiring into the manager manually.
        //
        // Type:
        // Hook-level unit test (React + React Testing Library).
        //
        // Dependencies:
        // - React Testing Library render/waitFor
        // - jest.mock('../TextureManager') with subscribeTextureLoadingMock
        //
        // How:
        // - Mock subscribeTextureLoading to immediately emit a non-zero pending
        //   state and return an unsubscribe function.
        // - Render a test component and record the hook state.
        // - Assert that isLoading is true.
        subscribeTextureLoadingMock.mockImplementation(
            (
                cb: (s: {
                    pending: number;
                    inFlight: number;
                    queued: number;
                }) => void,
            ) => {
                cb({ pending: 2, inFlight: 1, queued: 0 });
                return jest.fn(); // unsubscribe
            },
        );

        const onState = jest.fn();
        render(<LoadingTest onState={onState} />);

        await waitFor(() => {
            expect(subscribeTextureLoadingMock).toHaveBeenCalledTimes(1);
            expect(onState).toHaveBeenCalled();
        });

        const lastState = onState.mock.calls[onState.mock.calls.length - 1][0];
        expect(lastState.pending).toBe(2);
        expect(lastState.inFlight).toBe(1);
        expect(lastState.queued).toBe(0);
        expect(lastState.isLoading).toBe(true);
    });

    test('reports isLoading=false when pending is zero', async () => {
        // Goal:
        // Confirm that when the manager reports no pending loads, the hook
        // returns isLoading=false.
        //
        // Why:
        // This ensures the UI does not get stuck in a “loading” state after
        // all textures have finished loading.
        //
        // Type:
        // Hook-level unit test (React + React Testing Library).
        //
        // Dependencies:
        // - React Testing Library render/waitFor
        // - jest.mock('../TextureManager') with subscribeTextureLoadingMock
        //
        // How:
        // - Mock subscribeTextureLoading with a zero-pending state.
        // - Render the test component and inspect the last reported state.
        subscribeTextureLoadingMock.mockImplementation(
            (
                cb: (s: {
                    pending: number;
                    inFlight: number;
                    queued: number;
                }) => void,
            ) => {
                cb({ pending: 0, inFlight: 0, queued: 0 });
                return jest.fn();
            },
        );

        const onState = jest.fn();
        render(<LoadingTest onState={onState} />);

        await waitFor(() => {
            expect(onState).toHaveBeenCalled();
        });

        const lastState = onState.mock.calls[onState.mock.calls.length - 1][0];
        expect(lastState.isLoading).toBe(false);
    });
});
