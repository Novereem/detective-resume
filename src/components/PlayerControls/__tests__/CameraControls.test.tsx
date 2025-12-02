import React from 'react';
import { render } from '@testing-library/react';
import * as THREE from 'three';

import {
    FreeLookControls,
    PlayerMover,
    CameraPoseBridge,
} from '@/components/PlayerControls/CameraControls';

// Shared camera + canvas mocks
const mockDomElement = {
    style: { cursor: '' as string },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};

const mockCamera = {
    position: new THREE.Vector3(0, 0, 0),
    quaternion: new THREE.Quaternion(),
    getWorldDirection: jest.fn((out?: THREE.Vector3) => {
        const v = out ?? new THREE.Vector3();
        v.set(0, 0, -1);
        return v;
    }),
} as unknown as THREE.PerspectiveCamera;

// We capture frame callbacks registered via useFrame so tests can drive them.
const frameCallbacks: Array<(state: any, dt: number) => void> = [];

// We also capture window-level listeners that FreeLookControls uses.
const windowListeners: Record<string, (ev: any) => void> = {};

// Spy window.addEventListener so we can drive mousemove / mouseup
jest.spyOn(window, 'addEventListener').mockImplementation(
    ((type: string, listener: EventListenerOrEventListenerObject) => {
        const fn =
            typeof listener === 'function'
                ? listener
                : (listener as EventListenerObject).handleEvent;
        windowListeners[type] = fn as (ev: any) => void;
    }) as any,
);

// Matching removeEventListener to keep Jest happy
jest.spyOn(window, 'removeEventListener').mockImplementation(
    ((type: string) => {
        delete windowListeners[type];
    }) as any,
);

// Mock R3F
jest.mock('@react-three/fiber', () => {
    const actual = jest.requireActual('@react-three/fiber');
    return {
        ...actual,
        useThree: () => ({
            camera: mockCamera,
            gl: { domElement: mockDomElement },
        }),
        useFrame: (callback: (state: any, dt: number) => void) => {
            frameCallbacks.push(callback);
        },
    };
});

beforeEach(() => {
    jest.clearAllMocks();
    // Reset camera
    mockCamera.position.set(0, 0, 0);
    mockCamera.quaternion.identity();
    // Reset canvas
    mockDomElement.style.cursor = '';
    (mockDomElement.addEventListener as jest.Mock).mockImplementation(
        (type: string, handler: any) => {
            // Store the latest handler per type
            (mockDomElement as any)[`on_${type}`] = handler;
        },
    );
    (mockDomElement.removeEventListener as jest.Mock).mockImplementation(
        (type: string) => {
            delete (mockDomElement as any)[`on_${type}`];
        },
    );
    // Reset frame callbacks and window listeners
    frameCallbacks.length = 0;
    for (const k of Object.keys(windowListeners)) delete windowListeners[k];
});

describe('FreeLookControls', () => {
    test('initializes qGoalRef from camera and sets grab cursor when enabled', () => {
        // Goal:
        // Ensure that on mount, FreeLookControls copies the current camera orientation
        // into qGoalRef and sets the canvas cursor to "grab" when enabled.
        //
        // Why:
        // The look control needs a stable starting orientation and visual feedback
        // to feel responsive and predictable.
        //
        // How:
        // - Give the camera a non-identity quaternion.
        // - Render FreeLookControls with enabled={true}.
        // - Expect qGoalRef.current to equal the camera quaternion.
        // - Expect the domElement cursor to be "grab".
        const qGoalRef = React.createRef<THREE.Quaternion>();
        qGoalRef.current = new THREE.Quaternion();

        const initialQuat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(0.1, 0.2, 0),
        );
        mockCamera.quaternion.copy(initialQuat);

        render(
            <FreeLookControls
                enabled={true}
                qGoalRef={qGoalRef}
            />,
        );

        expect(qGoalRef.current).toBeDefined();
        expect(qGoalRef.current!.equals(mockCamera.quaternion)).toBe(true);
        expect(mockDomElement.style.cursor).toBe('grab');
    });

    test('updates qGoalRef on left-drag and restores cursor on mouseup', () => {
        // Goal:
        // Verify that dragging with the left mouse button changes the goal
        // orientation and updates the cursor between "grab" and "grabbing".
        //
        // Why:
        // This is the core look interaction; if this breaks, the player can't
        // look around using drag input.
        //
        // How:
        // - Render FreeLookControls.
        // - Simulate mousedown on the canvas with button=0.
        // - Capture qGoalRef before and after a simulated mousemove.
        // - Expect the quaternion to change and the cursor to flip to "grabbing".
        // - Simulate mouseup and expect the cursor to go back to "grab".
        const qGoalRef = React.createRef<THREE.Quaternion>();
        qGoalRef.current = new THREE.Quaternion();

        render(
            <FreeLookControls
                enabled={true}
                qGoalRef={qGoalRef}
            />,
        );

        const onMouseDown = (mockDomElement as any).on_mousedown as
            | ((ev: MouseEvent) => void)
            | undefined;
        expect(onMouseDown).toBeDefined();

        // Start drag with left mouse button
        onMouseDown!(
            { button: 0 } as unknown as MouseEvent,
        );

        const before = qGoalRef.current!.clone();

        const onMouseMove = windowListeners['mousemove'];
        expect(onMouseMove).toBeDefined();

        // Simulate some mouse movement
        onMouseMove!(
            { movementX: 10, movementY: 5 } as unknown as MouseEvent,
        );

        const after = qGoalRef.current!;
        expect(after.equals(before)).toBe(false);
        expect(mockDomElement.style.cursor).toBe('grabbing');

        const onMouseUp = windowListeners['mouseup'];
        expect(onMouseUp).toBeDefined();

        onMouseUp!({} as unknown as MouseEvent);
        expect(mockDomElement.style.cursor).toBe('grab');
    });

    test('does not react to drag when disabled', () => {
        // Goal:
        // Ensure that when FreeLookControls is disabled, it does not change
        // the goal orientation or cursor in response to mouse events.
        //
        // Why:
        // This protects situations where look input is intentionally disabled
        // (e.g. menus, cutscenes).
        //
        // How:
        // - Render with enabled={false}.
        // - Simulate mousedown + mousemove.
        // - Expect qGoalRef to remain unchanged and cursor to stay empty.
        const qGoalRef = React.createRef<THREE.Quaternion>();
        qGoalRef.current = new THREE.Quaternion();

        render(
            <FreeLookControls
                enabled={false}
                qGoalRef={qGoalRef}
            />,
        );

        const before = qGoalRef.current!.clone();
        expect(mockDomElement.style.cursor).toBe('');

        const onMouseDown = (mockDomElement as any).on_mousedown as
            | ((ev: MouseEvent) => void)
            | undefined;
        if (onMouseDown) {
            onMouseDown(
                { button: 0 } as unknown as MouseEvent,
            );
        }

        const onMouseMove = windowListeners['mousemove'];
        if (onMouseMove) {
            onMouseMove(
                { movementX: 10, movementY: 5 } as unknown as MouseEvent,
            );
        }

        expect(qGoalRef.current!.equals(before)).toBe(true);
        expect(mockDomElement.style.cursor).toBe('');
    });

    test('slerps camera quaternion towards qGoalRef over time', () => {
        // Goal:
        // Confirm that the per-frame update interpolates the camera orientation
        // towards qGoalRef, rather than snapping immediately.
        //
        // Why:
        // This smoothing is what makes camera motion feel natural instead of jittery.
        //
        // How:
        // - Render FreeLookControls and capture the useFrame callback.
        // - Change qGoalRef to a rotated orientation after mount.
        // - Call the frame callback with a fixed dt.
        // - Assert that the camera quaternion moved closer to qGoalRef.
        const qGoalRef = React.createRef<THREE.Quaternion>();
        qGoalRef.current = new THREE.Quaternion();

        render(
            <FreeLookControls
                enabled={true}
                qGoalRef={qGoalRef}
            />,
        );

        expect(frameCallbacks.length).toBeGreaterThan(0);
        const frame = frameCallbacks[0];

        // Set qGoalRef to some rotated orientation
        const targetQuat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(0, Math.PI / 3, 0),
        );
        qGoalRef.current!.copy(targetQuat);

        const dotBefore = mockCamera.quaternion.dot(qGoalRef.current!);
        frame({}, 1 / 60);
        const dotAfter = mockCamera.quaternion.dot(qGoalRef.current!);

        expect(dotAfter).toBeGreaterThan(dotBefore);
    });
});

describe('PlayerMover', () => {
    test('moves camera towards target and calls onArrive when close', () => {
        // Goal:
        // Verify that PlayerMover damps the camera position towards the target
        // and calls onArrive once when the camera reaches it (assuming orientation is ok).
        //
        // Why:
        // This is the core "click to move camera" behavior; it must stop at the
        // correct pose and signal completion exactly once.
        //
        // How:
        // - Provide a MoveRequest with target camera/lookAt.
        // - Render PlayerMover with a non-null qGoalRef.
        // - After render, align camera.quaternion with qGoalRef so orientation is valid.
        // - Step the frame callback several times.
        // - Expect the camera position to be close to the target and onArrive to have been called once.
        const qGoalRef = React.createRef<THREE.Quaternion>();
        qGoalRef.current = new THREE.Quaternion();

        const targetCam = [0, 1, 5] as [number, number, number];
        const targetLook = [0, 1, 0] as [number, number, number];

        const onArrive = jest.fn();

        render(
            <PlayerMover
                move={{ camera: targetCam, lookAt: targetLook }}
                onArrive={onArrive}
                qGoalRef={qGoalRef}
            />,
        );

        expect(frameCallbacks.length).toBeGreaterThan(0);
        const frame = frameCallbacks[0];

        // Orientation: make camera already match qGoalRef to satisfy oriOk condition.
        // qGoalRef has been set in the effect; copy it to camera.
        mockCamera.quaternion.copy(qGoalRef.current!);

        // Step the simulation forward a bit
        for (let i = 0; i < 120; i++) {
            frame({}, 1 / 60);
        }

        const goal = new THREE.Vector3().fromArray(targetCam);
        const dist = mockCamera.position.distanceTo(goal);

        expect(dist).toBeLessThan(0.05);
        expect(onArrive).toHaveBeenCalledTimes(1);
    });

    test('does nothing when move is null', () => {
        // Goal:
        // Ensure that when `move` is null, PlayerMover never activates and
        // does not call onArrive.
        //
        // Why:
        // This protects against spurious moves when there is no active request.
        //
        // How:
        // - Render with move={null}.
        // - Step the frame callback.
        // - Expect onArrive not to be called and the camera position to remain unchanged.
        const qGoalRef = React.createRef<THREE.Quaternion>();
        qGoalRef.current = new THREE.Quaternion();

        const onArrive = jest.fn();

        render(
            <PlayerMover
                move={null}
                onArrive={onArrive}
                qGoalRef={qGoalRef}
            />,
        );

        expect(frameCallbacks.length).toBeGreaterThan(0);
        const frame = frameCallbacks[0];

        const before = mockCamera.position.clone();

        for (let i = 0; i < 60; i++) {
            frame({}, 1 / 60);
        }

        expect(mockCamera.position.equals(before)).toBe(true);
        expect(onArrive).not.toHaveBeenCalled();
    });
});

describe('CameraPoseBridge', () => {
    test('writes camera position and lookAt into refs each frame', () => {
        // Goal:
        // Check that CameraPoseBridge keeps posRef and lookAtRef in sync
        // with the current camera pose.
        //
        // Why:
        // Other parts of the system rely on these plain Vec3 refs instead of
        // accessing the Three.js camera directly.
        //
        // How:
        // - Set a known camera position and forward direction.
        // - Render CameraPoseBridge.
        // - Invoke the frame callback.
        // - Expect posRef to equal the camera position and lookAtRef to equal
        //   position + forward direction.
        const posRef = { current: [0, 0, 0] as [number, number, number] };
        const lookAtRef = { current: [0, 0, 0] as [number, number, number] };

        mockCamera.position.set(1, 2, 3);
        mockCamera.getWorldDirection = jest
            .fn()
            .mockImplementation((out?: THREE.Vector3) => {
                const v = out ?? new THREE.Vector3();
                v.set(0, 0, -1);
                return v;
            });

        render(
            <CameraPoseBridge
                posRef={posRef}
                lookAtRef={lookAtRef}
            />,
        );

        expect(frameCallbacks.length).toBeGreaterThan(0);
        const frame = frameCallbacks[frameCallbacks.length - 1];

        frame({}, 1 / 60);

        expect(posRef.current).toEqual([1, 2, 3]);
        expect(lookAtRef.current).toEqual([1, 2, 2]);
    });
});
