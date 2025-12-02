import React from 'react';
import { render } from '@testing-library/react';
import * as THREE from 'three';

import { useRightClickFocus } from '@/components/PlayerControls/InputControls';

const mockDomElement = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};

const mockCamera = {
    fov: 75,
    updateProjectionMatrix: jest.fn(),
    position: new THREE.Vector3(0, 0, 0),
    getWorldDirection: jest.fn((out?: THREE.Vector3) => {
        const v = out ?? new THREE.Vector3();
        v.set(0, 0, -1);
        return v;
    }),
} as unknown as THREE.PerspectiveCamera;

// Global mock for R3F in this test file
jest.mock('@react-three/fiber', () => {
    const actual = jest.requireActual('@react-three/fiber');
    return {
        ...actual,
        useThree: () => ({
            camera: mockCamera,
            gl: { domElement: mockDomElement },
        }),
        useFrame: () => {
            /* no-op */
        },
    };
});

function RightClickFocusTest(props: {
    requestMove: jest.Mock;
    options?: any;
    event?: any;
}) {
    const { requestMove, options, event } = props;
    const focus = useRightClickFocus(requestMove);

    React.useEffect(() => {
        if (!event) return;
        const handler = focus(options);
        handler(event);
    }, [focus, options, event]);

    return null;
}

describe('useRightClickFocus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCamera.position.set(0, 1, 5);
        mockCamera.fov = 75;
    });

    test('focuses on event.point, keeps height and clamps distance', () => {
        // Goal:
        // Validate the default behavior when right-clicking a point in space:
        // - Use the event.point as focus target.
        // - Call requestMove once with camera + lookAt.
        // - Keep the original camera height.
        // - Clamp the world-space distance in a way that respects [minDist, maxDist]
        //   plus the fixed height.
        //
        // Why:
        // This is the primary "look at what I clicked" behavior and is critical
        // for how the detective room feels when navigating with right-click focus.
        //
        // How:
        // - Render a helper component that uses useRightClickFocus.
        // - Pass an event with a point at the origin.
        // - Verify:
        //   - preventDefault/stopPropagation are called.
        //   - requestMove is called once.
        //   - lookAt equals the clicked point.
        //   - distance is >= minDist and <= max distance allowed by clamped d + fixed height.
        //   - camera.y is preserved.
        const requestMove = jest.fn();

        const targetPoint = new THREE.Vector3(0, 0, 0);
        const preventDefault = jest.fn();
        const stopPropagation = jest.fn();

        const event = {
            point: targetPoint,
            nativeEvent: { preventDefault },
            stopPropagation,
        };

        const minDist = 0.8;
        const maxDist = 3.5;

        render(
            <RightClickFocusTest
                requestMove={requestMove}
                options={{ minDist, maxDist }}
                event={event}
            />,
        );

        expect(preventDefault).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
        expect(requestMove).toHaveBeenCalledTimes(1);

        const moveArg = requestMove.mock.calls[0][0];
        const eyeArr = moveArg.camera as [number, number, number];
        const lookArr = moveArg.lookAt as [number, number, number];

        // lookAt == clicked point
        expect(lookArr).toEqual([0, 0, 0]);

        const eye = new THREE.Vector3(...eyeArr);
        const dist = eye.distanceTo(targetPoint);

        // Lower bound is still the configured minDist
        expect(dist).toBeGreaterThanOrEqual(minDist);

        // Upper bound: account for keepHeight
        // The ground-distance is clamped to maxDist, but we reapply the original Y,
        // so the final world-space distance can be slightly > maxDist.
        const deltaY = mockCamera.position.y - targetPoint.y;
        const maxAllowed = Math.sqrt(maxDist * maxDist + deltaY * deltaY);

        expect(dist).toBeLessThanOrEqual(maxAllowed + 1e-6);

        // And we still keep the original height
        expect(eye.y).toBeCloseTo(mockCamera.position.y);
    });

    test('clamps finalEye when bounds are provided', () => {
        // Goal:
        // Verify that optional bounds are respected by clamping the final
        // camera position into the given axis-aligned box.
        //
        // Why:
        // Bounds protect against flying the camera outside the playable area.
        // If this breaks, right-click focus might push the camera into invalid space.
        //
        // How:
        // - Move the camera far away.
        // - Provide bounds with a small min/max box.
        // - Trigger focus and assert that the resulting camera position
        //   lies inside [min, max] for all axes.
        const requestMove = jest.fn();

        mockCamera.position.set(10, 10, 10);

        const targetPoint = new THREE.Vector3(0, 0, 0);
        const preventDefault = jest.fn();
        const stopPropagation = jest.fn();

        const event = {
            point: targetPoint,
            nativeEvent: { preventDefault },
            stopPropagation,
        };

        const bounds = {
            min: [-1, 0.5, -2],
            max: [1, 2, 1],
        };

        render(
            <RightClickFocusTest
                requestMove={requestMove}
                options={{ bounds }}
                event={event}
            />,
        );

        expect(requestMove).toHaveBeenCalledTimes(1);

        const moveArg = requestMove.mock.calls[0][0];
        const eyeArr = moveArg.camera as [number, number, number];
        const eye = new THREE.Vector3(...eyeArr);

        expect(eye.x).toBeGreaterThanOrEqual(bounds.min[0]);
        expect(eye.x).toBeLessThanOrEqual(bounds.max[0]);
        expect(eye.y).toBeGreaterThanOrEqual(bounds.min[1]);
        expect(eye.y).toBeLessThanOrEqual(bounds.max[1]);
        expect(eye.z).toBeGreaterThanOrEqual(bounds.min[2]);
        expect(eye.z).toBeLessThanOrEqual(bounds.max[2]);
    });

    test('does nothing when event is missing', () => {
        // Goal:
        // Ensure that if the helper component is rendered without an event,
        // no focus handler is invoked and no camera move is requested.
        //
        // Why:
        // This protects against accidentally triggering focus when the
        // calling code has nothing to act on yet.
        //
        // How:
        // - Render without an event.
        // - Assert that requestMove is never called.
        const requestMove = jest.fn();

        render(
            <RightClickFocusTest
                requestMove={requestMove}
                options={{}}
                event={undefined}
            />,
        );

        expect(requestMove).not.toHaveBeenCalled();
    });

    test('does not call requestMove when there is no point and no object', () => {
        // Goal:
        // Verify that when the event has neither a point nor an object,
        // the hook effectively no-ops and does not request a camera move.
        //
        // Why:
        // It makes the focus behavior robust against incomplete or unexpected
        // events; we don't want to move the camera toward an arbitrary default.
        //
        // How:
        // - Provide an event that lacks both `point` and `object`.
        // - Expect requestMove to NOT be called.
        const requestMove = jest.fn();

        const event = {
            nativeEvent: { preventDefault: jest.fn() },
            stopPropagation: jest.fn(),
            // no point, no object
        };

        render(
            <RightClickFocusTest
                requestMove={requestMove}
                options={{}}
                event={event}
            />,
        );

        expect(requestMove).not.toHaveBeenCalled();
    });
});
