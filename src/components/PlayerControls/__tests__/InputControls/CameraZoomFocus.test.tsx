import React from 'react';
import { render } from '@testing-library/react';
import * as THREE from 'three';

import { MouseZoom } from '@/components/PlayerControls/InputControls';

// Shared mocks so we can inspect them in our tests
const mockDomElement = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};

const mockCamera = {
    // Start with a realistic FOV so zoom math behaves like in the real scene
    fov: 75,
    updateProjectionMatrix: jest.fn(),
    position: new THREE.Vector3(0, 0, 0),
    getWorldDirection: jest.fn((out?: THREE.Vector3) => {
        const v = out ?? new THREE.Vector3();
        v.set(0, 0, -1);
        return v;
    }),
} as unknown as THREE.PerspectiveCamera;

// Mock @react-three/fiber so MouseZoom can call useThree/useFrame
jest.mock('@react-three/fiber', () => {
    const actual = jest.requireActual('@react-three/fiber');
    return {
        ...actual,
        useThree: () => ({
            camera: mockCamera,
            gl: { domElement: mockDomElement },
        }),
        useFrame: () => {
            /* no-op for this test */
        },
    };
});

describe('MouseZoom', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCamera.fov = 75;
    });

    test('registers a wheel listener and changes FOV when scrolled', () => {
        // Goal:
        // Verify that MouseZoom wires a "wheel" listener to the canvas and,
        // when enabled, zooms by updating the camera FOV within the configured bounds.
        //
        // Why:
        // This is the core scroll-to-zoom behavior; if the listener or clamping breaks,
        // the camera will either not zoom or zoom in a way that ignores the settings.
        //
        // How:
        // - Render MouseZoom with mode="fov".
        // - Grab the registered wheel handler from addEventListener.
        // - Call it with a fake wheel event and assert:
        //   - preventDefault is called.
        //   - camera.fov changes, but stays within [fovMin, fovMax].
        //   - updateProjectionMatrix is called to apply the new FOV.
        render(
            <MouseZoom
                enabled={true}
                mode="fov"
                fovMin={50}
                fovMax={100}
                fovSpeed={0.04}
            />,
        );

        // MouseZoom should register a wheel handler on the canvas element
        expect(mockDomElement.addEventListener).toHaveBeenCalledWith(
            'wheel',
            expect.any(Function),
            expect.objectContaining({ passive: false }),
        );

        // Grab the actual handler function that was registered
        const wheelHandler = (mockDomElement.addEventListener as jest.Mock).mock
            .calls[0][1] as (e: WheelEvent) => void;

        const initialFov = mockCamera.fov;

        // Simulate a scroll event
        const preventDefault = jest.fn();
        wheelHandler({
            deltaY: 10,
            preventDefault,
        } as unknown as WheelEvent);

        // It should prevent default scrolling
        expect(preventDefault).toHaveBeenCalled();

        // FOV should have changed (clamped within fovMin/fovMax)
        expect(mockCamera.fov).not.toBe(initialFov);
        expect(mockCamera.fov).toBeGreaterThanOrEqual(50);
        expect(mockCamera.fov).toBeLessThanOrEqual(100);
        expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
    });

    test('when disabled, wheel handler does not change FOV', () => {
        // Goal:
        // Ensure that when MouseZoom is disabled, the wheel handler still exists
        // but bails out immediately and does not affect the camera.
        //
        // Why:
        // This guarantees that toggling zoom off (e.g. via a setting) is safe:
        // no FOV changes, no projection updates, and no interference with page scroll.
        //
        // How:
        // - Render MouseZoom with enabled={false}.
        // - Look up the registered wheel handler.
        // - Call it and assert:
        //   - preventDefault is NOT called.
        //   - camera.fov stays the same.
        //   - updateProjectionMatrix is not called.
        render(
            <MouseZoom
                enabled={false}
                mode="fov"
                fovMin={50}
                fovMax={100}
                fovSpeed={0.04}
            />,
        );

        // Listener is still registered
        expect(mockDomElement.addEventListener).toHaveBeenCalledWith(
            'wheel',
            expect.any(Function),
            expect.objectContaining({ passive: false }),
        );

        const wheelHandler = (mockDomElement.addEventListener as jest.Mock).mock
            .calls[0][1] as (e: WheelEvent) => void;

        const initialFov = mockCamera.fov;
        const preventDefault = jest.fn();

        // Simulate wheel scroll
        wheelHandler({
            deltaY: 10,
            preventDefault,
        } as unknown as WheelEvent);

        // Because enabled = false, it should early-return:
        // - preventDefault is not called
        // - FOV stays the same
        // - updateProjectionMatrix is not called
        expect(preventDefault).not.toHaveBeenCalled();
        expect(mockCamera.fov).toBe(initialFov);
        expect(mockCamera.updateProjectionMatrix).not.toHaveBeenCalled();
    });
});
