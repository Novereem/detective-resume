import React from 'react';
import { render, cleanup } from '@testing-library/react';
import * as THREE from 'three';

import {
    DevFlyMove,
    DevObjectMove,
} from '@/components/PlayerControls/DevControls';

afterEach(() => {
    cleanup();
});

// Shared camera + canvas + scene for these tests
const mockDomElement = {
    style: { cursor: '' as string },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON() { return {}; },
    }),
} as any;

const mockCamera = {
    position: new THREE.Vector3(0, 0, 0),
    quaternion: new THREE.Quaternion(),
    getWorldDirection: jest.fn((out?: THREE.Vector3) => {
        const v = out ?? new THREE.Vector3();
        // Default camera looks down -Z in world space
        v.set(0, 0, -1);
        return v;
    }),
} as unknown as THREE.PerspectiveCamera;

let scene: THREE.Scene;

// Collect useFrame callbacks so tests can step frames manually
const frameCallbacks: Array<(state: any, dt: number) => void> = [];

// Mock R3F to provide our camera/scene/canvas and capture useFrame calls
jest.mock('@react-three/fiber', () => {
    const actual = jest.requireActual('@react-three/fiber');
    return {
        ...actual,
        useThree: () => ({
            camera: mockCamera,
            scene,
            gl: { domElement: mockDomElement },
        }),
        useFrame: (callback: (state: any, dt: number) => void) => {
            frameCallbacks.push(callback);
        },
    };
});

beforeEach(() => {
    jest.clearAllMocks();
    scene = new THREE.Scene();
    mockCamera.position.set(0, 0, 0);
    mockCamera.quaternion.identity();
    frameCallbacks.length = 0;
});

//
// DevFlyMove
//
describe('DevFlyMove', () => {
    test('moves camera forward when W is held', () => {
        // Goal:
        // Verify that DevFlyMove uses WASD to move the camera relative to its
        // view direction; specifically, W should move the camera forward.
        //
        // Why:
        // This is the core dev free-fly behavior for positioning the camera
        // while building/testing scenes. If this breaks, flying around the
        // room in dev mode feels wrong or stops working.
        //
        // How:
        // - Render DevFlyMove with smoothing disabled for deterministic motion.
        // - Dispatch a KeyW down event.
        // - Step the frame callback with dt=1.
        // - Expect the camera to move along its forward vector (negative Z).
        const speed = 2;

        render(
            <DevFlyMove
                enabled={true}
                speed={speed}
                verticalSpeed={0}
                smoothing={0}
            />,
        );

        // Simulate pressing W
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));

        expect(frameCallbacks.length).toBeGreaterThan(0);
        const frame = frameCallbacks[0];

        const before = mockCamera.position.clone();
        frame({}, 1); // dt = 1 for easier reasoning

        expect(mockCamera.position.x).toBeCloseTo(before.x);
        expect(mockCamera.position.y).toBeCloseTo(before.y);
        // Forward (W) moves in -Z with our mocked getWorldDirection
        expect(mockCamera.position.z).toBeCloseTo(before.z - speed);
    });

    test('does nothing when disabled', () => {
        // Goal:
        // Ensure that when DevFlyMove is disabled, frame updates do not move
        // the camera, even if keys are pressed.
        //
        // Why:
        // This allows temporarily disabling dev-fly controls (e.g. when UI
        // overlays are open) without unexpected camera movement.
        //
        // How:
        // - Render DevFlyMove with enabled={false}.
        // - Dispatch a KeyW down event.
        // - Step the frame callback.
        // - Expect the camera position to remain unchanged.
        const speed = 2;

        render(
            <DevFlyMove
                enabled={false}
                speed={speed}
                verticalSpeed={0}
                smoothing={0}
            />,
        );

        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));

        expect(frameCallbacks.length).toBeGreaterThan(0);
        const frame = frameCallbacks[0];

        const before = mockCamera.position.clone();
        frame({}, 1);

        expect(mockCamera.position.equals(before)).toBe(true);
    });
});

//
// DevObjectMove
//
describe('DevObjectMove', () => {
    test('attaches helpers and listeners when enabled', () => {
        // Goal:
        // Check that when enabled, DevObjectMove:
        // - Creates the selection box helper and gizmo in the scene.
        // - Registers pointer and keyboard listeners for interaction.
        //
        // Why:
        // These are the essentials for the dev move/rotate workflow. If the
        // helpers or listeners are not registered, other devs cannot select
        // and manipulate objects reliably.
        //
        // How:
        // - Spy on window.addEventListener to capture global listeners.
        // - Render DevObjectMove with enabled={true}.
        // - Assert:
        //   - Canvas has pointermove / pointerdown listeners.
        //   - Window has pointerup / keydown / keyup listeners.
        //   - Scene contains one Box3Helper and a gizmo group named "__gizmo".
        const onBusyChange = jest.fn();
        const addEventSpy = jest.spyOn(window, 'addEventListener');

        render(
            <DevObjectMove
                enabled={true}
                onBusyChange={onBusyChange}
                snap={null}
            />,
        );

        // Canvas pointer listeners
        expect(mockDomElement.addEventListener).toHaveBeenCalledWith(
            'pointermove',
            expect.any(Function),
        );
        expect(mockDomElement.addEventListener).toHaveBeenCalledWith(
            'pointerdown',
            expect.any(Function),
        );

        // Global window listeners
        expect(addEventSpy).toHaveBeenCalledWith(
            'pointerup',
            expect.any(Function),
        );
        expect(addEventSpy).toHaveBeenCalledWith(
            'keydown',
            expect.any(Function),
        );
        expect(addEventSpy).toHaveBeenCalledWith(
            'keyup',
            expect.any(Function),
        );

        // Helpers in the scene
        const boxHelpers = scene.children.filter(
            (o) => o instanceof THREE.Box3Helper,
        );
        expect(boxHelpers.length).toBe(1);

        const gizmo = scene.children.find((o) => o.name === '__gizmo');
        expect(gizmo).toBeDefined();

        addEventSpy.mockRestore();
    });

    test('cleans up helpers and resets busy on unmount', () => {
        // Goal:
        // Verify that when DevObjectMove is unmounted:
        // - Visual helpers (box + gizmo) are hidden.
        // - onBusyChange is called with false to clear any busy state.
        //
        // Why:
        // This prevents stale gizmos from hanging around when leaving editor
        // mode and guarantees that busy flags are reset.
        //
        // How:
        // - Render DevObjectMove with enabled={true} and a busy callback.
        // - Capture the Box3Helper and gizmo from the scene.
        // - Unmount the component.
        // - Assert the helpers are now invisible and onBusyChange(false) was called.
        const onBusyChange = jest.fn();

        const { unmount } = render(
            <DevObjectMove
                enabled={true}
                onBusyChange={onBusyChange}
            />,
        );

        const boxHelpers = scene.children.filter(
            (o) => o instanceof THREE.Box3Helper,
        ) as THREE.Box3Helper[];
        const gizmo = scene.children.find(
            (o) => o.name === '__gizmo',
        ) as THREE.Group | undefined;

        expect(boxHelpers.length).toBe(1);
        const helper = boxHelpers[0];

        unmount();

        expect(helper.visible).toBe(false);
        if (gizmo) {
            expect(gizmo.visible).toBe(false);
        }
        expect(onBusyChange).toHaveBeenCalledWith(false);
    });

    test('does not attach listeners when disabled', () => {
        // Goal:
        // Ensure that when DevObjectMove is disabled, it does not register
        // any event listeners or helpers.
        //
        // Why:
        // This guarantees that turning the dev gizmo off truly isolates it,
        // avoiding accidental pointer/keyboard interception.
        //
        // How:
        // - Spy on window.addEventListener.
        // - Render DevObjectMove with enabled={false}.
        // - Assert that no canvas or window listeners were registered.
        const onBusyChange = jest.fn();
        const addEventSpy = jest.spyOn(window, 'addEventListener');

        render(
            <DevObjectMove
                enabled={false}
                onBusyChange={onBusyChange}
            />,
        );

        expect(mockDomElement.addEventListener).not.toHaveBeenCalled();
        expect(addEventSpy).not.toHaveBeenCalled();

        addEventSpy.mockRestore();
    });
});
