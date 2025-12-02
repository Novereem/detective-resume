import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import * as THREE from 'three';

import { MagnifierPickupControls } from '@/components/PlayerControls/GameplayControls';
import {
    MagnifierStateProvider,
    useMagnifierState,
} from '@/components/CameraEffects/Magnifier/MagnifierStateContext';

// Let TypeScript infer the shape of the context
type MagnifierState = ReturnType<typeof useMagnifierState>;

// Shared R3F mocks (camera, scene, WebGL canvas, frame loop)
let mockCamera: THREE.PerspectiveCamera;
let mockScene: THREE.Scene;
let mockDomElement: {
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
    getBoundingClientRect: () => DOMRect;
};
let frameCallback: ((state: any, dt: number) => void) | null = null;

jest.mock('@react-three/fiber', () => {
    const actual = jest.requireActual('@react-three/fiber');
    return {
        ...actual,
        useThree: () => ({
            camera: mockCamera,
            scene: mockScene,
            gl: { domElement: mockDomElement },
        }),
        useFrame: (fn: any) => {
            frameCallback = fn;
        },
    };
});

// Spy component so tests can read the current magnifier state from context
let capturedState: MagnifierState | null = null;

function MagnifierStateSpy({ children }: { children: React.ReactNode }) {
    const state = useMagnifierState();
    React.useEffect(() => {
        capturedState = state;
    }, [state]);
    return <>{children}</>;
}

// Patch Raycaster so we don’t depend on real intersection logic
let raycasterIntersectSpy: jest.SpyInstance;
let raycasterSetFromCameraSpy: jest.SpyInstance;

beforeAll(() => {
    raycasterIntersectSpy = jest
        .spyOn(THREE.Raycaster.prototype, 'intersectObject')
        .mockImplementation(
            () => [{ point: new THREE.Vector3(0, 0, 0) }] as any
        );

    raycasterSetFromCameraSpy = jest
        .spyOn(THREE.Raycaster.prototype, 'setFromCamera')
        .mockImplementation(() => undefined as any);
});

afterAll(() => {
    raycasterIntersectSpy.mockRestore();
    raycasterSetFromCameraSpy.mockRestore();
});

describe('MagnifierPickupControls', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedState = null;
        frameCallback = null;

        // Camera looking roughly forward from a standing height
        mockCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
        mockCamera.position.set(0, 1.6, 5);
        mockCamera.lookAt(0, 1.6, 0);

        // Scene with a single magnifier object under a parent
        mockScene = new THREE.Scene();
        const magnifierParent = new THREE.Object3D();
        const magnifier = new THREE.Object3D();
        (magnifier as any).userData = { pickupId: 'magnifier' };
        magnifierParent.add(magnifier);
        mockScene.add(magnifierParent);

        // Fake WebGL canvas DOM element
        mockDomElement = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            getBoundingClientRect: () =>
                ({
                    left: 0,
                    top: 0,
                    width: 200,
                    height: 100,
                    right: 200,
                    bottom: 100,
                    x: 0,
                    y: 0,
                    toJSON: () => {},
                } as DOMRect),
        };
    });

    test('picks up the magnifier on left-click and activates the lens mask while holding', async () => {
        // Goal:
        // Verify the “happy path” for the magnifier:
        // - Clicking the magnifier picks it up.
        // - The context marks it as held.
        // - The lens mask becomes active with a usable direction and radius.
        //
        // Why:
        // This is the core interaction other developers rely on when designing
        // rooms with magnifier secrets. If this breaks, the magnifier mechanic
        // effectively stops working.
        //
        // How:
        // - Render MagnifierPickupControls inside a real MagnifierStateProvider.
        // - Use a fake scene containing a magnifier object.
        // - Simulate a left-click on the canvas (raycast hitting the magnifier).
        // - Run one frame and assert on the context state and lens mask values.
        render(
            <MagnifierStateProvider>
                <MagnifierStateSpy>
                    <MagnifierPickupControls enabled />
                </MagnifierStateSpy>
            </MagnifierStateProvider>
        );

        // Effect should register a mousedown handler on the WebGL canvas
        const addCalls = (mockDomElement.addEventListener as jest.Mock).mock.calls;
        const downCall = addCalls.find(([type]) => type === 'mousedown');
        expect(downCall).toBeDefined();

        const onMouseDown = downCall![1] as (ev: MouseEvent) => void;

        const ev = {
            button: 0,
            clientX: 100,
            clientY: 50,
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        } as unknown as MouseEvent;

        // Simulate clicking directly on the magnifier (wrapped in act for React)
        act(() => {
            onMouseDown(ev);
        });

        // Pick-up click should consume the event
        expect(ev.preventDefault).toHaveBeenCalled();
        expect(ev.stopPropagation).toHaveBeenCalled();

        // Context should mark the magnifier as "held"
        await waitFor(() => {
            expect(capturedState).not.toBeNull();
            expect(capturedState!.held).toBe(true);
        });

        // Per-frame update should compute lens world position + mask settings
        expect(frameCallback).toBeTruthy();

        act(() => {
            frameCallback?.({} as any, 1 / 60);
        });

        const mask = capturedState!.lensMaskRef.current;

        // Lens mask should become active with a non-zero direction and configured radius
        expect(mask.active).toBe(true);
        expect(mask.radius).toBeCloseTo(0.47);

        const dir = new THREE.Vector3(mask.dir[0], mask.dir[1], mask.dir[2]);
        expect(dir.length()).toBeGreaterThan(0);
    });

    test('when disabled, it does not register handlers or activate the lens mask', async () => {
        // Goal:
        // Check that disabling MagnifierPickupControls fully deactivates it:
        // - No mouse handlers are registered.
        // - The lens mask never becomes active, even if the frame loop runs.
        //
        // Why:
        // This ensures that turning off magnifier controls (e.g. in non-game
        // contexts or editor states) really isolates the mechanic and prevents
        // accidental state updates.
        //
        // How:
        // - Render MagnifierPickupControls with enabled={false}.
        // - Assert that no mousedown listener is attached to the canvas.
        // - Run the frame callback if present.
        // - Assert that the lens mask stays inactive in context.
        render(
            <MagnifierStateProvider>
                <MagnifierStateSpy>
                    <MagnifierPickupControls enabled={false} />
                </MagnifierStateSpy>
            </MagnifierStateProvider>
        );

        // No mousedown handler should be registered when the controls are disabled
        const addCalls = (mockDomElement.addEventListener as jest.Mock).mock.calls;
        const downCall = addCalls.find(([type]) => type === 'mousedown');
        expect(downCall).toBeUndefined();

        // Even if the frame loop runs, the mask should stay inactive
        act(() => {
            frameCallback?.({} as any, 1 / 60);
        });

        await waitFor(() => {
            expect(capturedState).not.toBeNull();
            expect(capturedState!.lensMaskRef.current.active).toBe(false);
        });
    });
});
