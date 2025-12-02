import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import * as THREE from 'three';

import { Outlined } from '@/components/Models/Generic/Outlined/Outlined';

// Silence React / R3F console noise for this test file.
//
// JSDOM doesn't know about <mesh>, <group>, meshStandardMaterial, etc.,
// so React logs a lot of warnings that are irrelevant for these tests.
// We mute console.error here to keep the output readable. Assertions will
// still fail normally if something actually breaks.

let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty: swallow all console.error output in this file.
    });
});

afterAll(() => {
    consoleErrorSpy.mockRestore();
});

// Mock drei cursor hook so we can assert it is called without touching real cursor
const useCursorMock = jest.fn();
jest.mock('@react-three/drei', () => ({
    useCursor: (...args: any[]) => useCursorMock(...args),
}));

// Mock R3F hooks so Outlined can mount without a real Canvas
jest.mock('@react-three/fiber', () => {
    const actual = jest.requireActual('@react-three/fiber');
    return {
        ...actual,
        useThree: () => ({
            camera: new THREE.PerspectiveCamera(),
        }),
        useFrame: () => {
            /* no-op in tests */
        },
    };
});

// Mock geometry
const TestGeometry: React.FC = () => null;

// Mock magnifier state so the shader/mask code has something to read
jest.mock('../../../CameraEffects/Magnifier/MagnifierStateContext', () => ({
    useMagnifierState: () => ({
        lensMaskRef: {
            current: {
                active: false,
                origin: new THREE.Vector3(),
                radius: 1,
                aspect: 1,
            },
        },
        held: false,
        setHeld: jest.fn(),
    }),
}));

// Mock texture hook – we mainly care that Outlined calls it correctly in one test
const useManagedTextureMock = jest.fn();
jest.mock('../../../Textures/useManagedTexture', () => ({
    useManagedTexture: (...args: any[]) => useManagedTextureMock(...args),
}));

describe('Outlined', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fires onInspect and onClick when clicked and interaction is enabled', () => {
        // Goal:
        // Verify that clicking an interactive Outlined component:
        // - Calls onInspect with a payload describing the outlined mesh.
        // - Calls onClick with a click-like event.
        //
        // Why:
        // Outlined is the core primitive used throughout ModelGroup; if it
        // does not surface inspect payloads correctly, the inspector UI
        // cannot show details about meshes.
        //
        // Type:
        // Component-level unit test (React + React Testing Library).
        //
        // Dependencies:
        // - React Testing Library render/fireEvent
        // - Jest mocks for:
        //   - @react-three/fiber (useThree/useFrame)
        //   - MagnifierStateContext
        //   - useManagedTexture (not asserted in this test)
        //
        // How:
        // - Render Outlined with geometry, canInteract=true, and handlers.
        // - Click the root group element.
        // - Assert that:
        //   - onInspect is called once with kind='outlined' and passed props.
        //   - onClick is called once with a SyntheticEvent whose type is 'click'.
        const onInspect = jest.fn();
        const onClick = jest.fn();

        const { container } = render(
            <Outlined
                geometry={<TestGeometry />}
                color="#123456"
                outlineColor="#ffffff"
                outlineScale={1.1}
                canInteract={true}
                onInspect={onInspect}
                onClick={onClick}
                inspectOverrides={{ label: 'Test box' } as any}
            />,
        );

        const group = container.querySelector('group');
        expect(group).not.toBeNull();
        if (!group) return;

        fireEvent.click(group);

        expect(onInspect).toHaveBeenCalledTimes(1);
        expect(onInspect.mock.calls[0][0]).toMatchObject({
            kind: 'outlined',
            geometry: expect.any(Object),
            color: '#123456',
            outlineColor: '#ffffff',
            outlineScale: 1.1,
            label: 'Test box',
        });

        expect(onClick).toHaveBeenCalledTimes(1);
        const evt = onClick.mock.calls[0][0];

        expect(evt).toBeDefined();
        expect(evt.type).toBe('click');
    });

    test('does not call handlers when interaction is disabled', () => {
        // Goal:
        // Ensure that when interaction is disabled, clicking the group does
        // not call onInspect or onClick.
        //
        // Why:
        // Some outlined meshes are purely decorative; they should not be
        // clickable and must not interfere with pointer events.
        //
        // Type:
        // Component-level negative test (React + React Testing Library).
        //
        // Dependencies:
        // - React Testing Library render/fireEvent
        // - Same mocks as the previous test.
        //
        // How:
        // - Render Outlined with canInteract=false and disablePointer=true.
        // - Click the root group element.
        // - Assert that handlers are never called.
        const onInspect = jest.fn();
        const onClick = jest.fn();

        const { container } = render(
            <Outlined
                geometry={<TestGeometry />}
                canInteract={false}
                disablePointer={true}
                onInspect={onInspect}
                onClick={onClick}
            />,
        );

        const group = container.querySelector('group');
        expect(group).not.toBeNull();
        if (!group) return;

        fireEvent.click(group);

        expect(onInspect).not.toHaveBeenCalled();
        expect(onClick).not.toHaveBeenCalled();
    });

    test('calls useManagedTexture with expected options for pixelated vs non-pixelated textures', () => {
        // Goal:
        // Confirm that Outlined wires texture loading through useManagedTexture
        // with the right sampling options depending on texturePixelated.
        //
        // Why:
        // This ensures the component participates correctly in the central
        // texture management pipeline and that pixel-art vs smooth-texture
        // styles are requested properly.
        //
        // Type:
        // Component-level unit test focused on hook integration.
        //
        // Dependencies:
        // - React Testing Library render
        // - Jest mock for '../../../../Textures/useManagedTexture'
        //
        // How:
        // - Render Outlined twice:
        //   - Once with texturePixelated=true.
        //   - Once with texturePixelated=false (default).
        // - Assert that useManagedTexture is called with the correct filter
        //   options for each case.
        useManagedTextureMock.mockReturnValue(null);

        render(
            <Outlined
                geometry={<TestGeometry />}
                textureUrl="/textures/a.jpg"
                texturePixelated={true}
            />,
        );

        render(
            <Outlined
                geometry={<TestGeometry />}
                textureUrl="/textures/b.jpg"
                texturePixelated={false}
            />,
        );

        expect(useManagedTextureMock).toHaveBeenCalledTimes(2);

        const firstCallArgs = useManagedTextureMock.mock.calls[0];
        expect(firstCallArgs[0]).toBe('/textures/a.jpg');
        expect(firstCallArgs[1]).toMatchObject({
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            generateMipmaps: false,
        });

        const secondCallArgs = useManagedTextureMock.mock.calls[1];
        expect(secondCallArgs[0]).toBe('/textures/b.jpg');
        expect(secondCallArgs[1]).toMatchObject({
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            generateMipmaps: true,
        });
    });

    test('uses external hovered prop to drive cursor state', () => {
        // Goal:
        // Verify that when a `hovered` prop is provided, Outlined:
        // - Uses it as the source of truth for hover state.
        // - Forwards it to useCursor, instead of relying on internal pointer events.
        //
        // Why:
        // ModelGroup controls hover at the group level and passes it down
        // as `hovered` to each Outlined part. If Outlined ignores this prop,
        // group-level hover styling and cursor feedback will break.
        //
        // Type:
        // Component-level unit test focused on external hover control.
        //
        // Dependencies:
        // - React Testing Library render/rerender.
        // - jest.mock('@react-three/drei') with useCursorMock.
        //
        // How:
        // - Render Outlined with hovered=true and check that useCursor
        //   sees `true`.
        // - Re-render with hovered=false and check that useCursor sees `false`.
        const { rerender } = render(
            <Outlined geometry={<TestGeometry />} hovered={true} />,
        );

        expect(useCursorMock).toHaveBeenLastCalledWith(true);

        rerender(
            <Outlined geometry={<TestGeometry />} hovered={false} />,
        );

        expect(useCursorMock).toHaveBeenLastCalledWith(false);
    });
});