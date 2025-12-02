import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import * as THREE from 'three';

import { ModelGroup } from "../ModelGroup"

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

// Mock R3F hooks so ModelGroup can mount without a real Canvas
jest.mock('@react-three/fiber', () => {
    const actual = jest.requireActual('@react-three/fiber');
    return {
        ...actual,
        useThree: () => ({
            camera: new THREE.PerspectiveCamera(),
        }),
        // We do not run frame callbacks in this test file to avoid
        // touching real THREE.Object3D methods on DOM nodes.
        useFrame: () => {
            /* no-op in tests */
        },
    };
});

// Mock magnifier state so magnifier-only logic has stable inputs
jest.mock('../../../../components/CameraEffects/Magnifier/MagnifierStateContext', () => ({
    useMagnifierState: () => ({
        lensMaskRef: {
            current: {
                active: false,
                origin: new THREE.Vector3(),
                radius: 0.25,
                aspect: 1,
            },
        },
        held: false,
        setHeld: jest.fn(),
    }),
}));

// Mock Outlined so we can inspect how ModelGroup wires props into it
const outlinedMock = jest.fn();
jest.mock('../Outlined/Outlined', () => ({
    Outlined: (props: any) => {
        outlinedMock(props);
        return null;
    },
}));

// Simple geometry placeholder
const TestGeometry: React.FC = () => null;

describe('ModelGroup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('creates one Outlined per part and merges group defaults, part props and materialsById overrides', () => {
        // Goal:
        // Verify that ModelGroup:
        // - Instantiates one Outlined for each PartSpec.
        // - Resolves effective color / outlineColor / hoverColor / texture
        //   using the precedence:
        //   materialsById override > part spec > group default.
        //
        // Why:
        // This is the core "model-building" contract: authors can define
        // base parts and then tweak them per-instance via materialsById
        // and group-level defaults without touching the geometry.
        //
        // Type:
        // Component-level unit test with Outlined mocked out.
        //
        // Dependencies:
        // - React Testing Library render.
        // - jest.mock for:
        //   - @react-three/drei/useCursor
        //   - @react-three/fiber
        //   - useMagnifierState
        //   - Outlined (captured via outlinedMock).
        //
        // How:
        // - Render a ModelGroup with two parts and a materialsById override
        //   for one of them.
        // - Assert that:
        //   - Outlined is called twice.
        //   - The first call uses the override color/texture.
        //   - The second call falls back to group defaults where part props
        //     are missing, and respects per-part hoverColor and castShadow.
        const parts = [
            {
                id: 'wood',
                geometry: <TestGeometry />,
                color: '#111111',
                outlineColor: '#aaaaaa',
                textureUrl: '/textures/base-wood.jpg',
                texturePixelated: false,
            },
            {
                id: 'metal',
                geometry: <TestGeometry />,
                hoverColor: '#ff0000',
                textureUrl: '/textures/base-metal.jpg',
                texturePixelated: true,
                castShadow: true,
            },
        ];

        const materialsById = {
            wood: {
                color: '#222222',
                textureUrl: '/textures/override-wood.jpg',
                texturePixelated: true,
            },
        };

        render(
            <ModelGroup
                parts={parts as any}
                color="#000000"
                outlineColor="#ffffff"
                hoverColor="#00ff00"
                materialsById={materialsById as any}
                castShadowDefault={false}
                receiveShadowDefault={false}
            />,
        );

        expect(outlinedMock).toHaveBeenCalledTimes(2);

        const firstCallProps = outlinedMock.mock.calls[0][0];
        const secondCallProps = outlinedMock.mock.calls[1][0];

        // Part 1: materialsById.override > part > group
        expect(firstCallProps.geometry).toEqual(parts[0].geometry);
        expect(firstCallProps.color).toBe('#222222'); // override color
        expect(firstCallProps.outlineColor).toBe('#aaaaaa'); // part outlineColor
        expect(firstCallProps.textureUrl).toBe('/textures/override-wood.jpg');
        expect(firstCallProps.texturePixelated).toBe(true);

        // Part 2: no override, so part > group
        expect(secondCallProps.geometry).toEqual(parts[1].geometry);
        expect(secondCallProps.color).toBe('#000000'); // group default
        expect(secondCallProps.hoverColor).toBe('#ff0000'); // part hoverColor
        expect(secondCallProps.textureUrl).toBe('/textures/base-metal.jpg');
        expect(secondCallProps.texturePixelated).toBe(true);

        // Shadow flags: use per-part or fall back to group defaults
        expect(firstCallProps.castShadow).toBe(false); // castShadowDefault
        expect(firstCallProps.receiveShadow).toBe(false);
        expect(secondCallProps.castShadow).toBe(true); // per-part override
        expect(secondCallProps.receiveShadow).toBe(false);
    });

    test('prefers per-part outlineScale and otherwise uses group outlineScale', () => {
        // Goal:
        // Verify that resolveScale uses:
        // - p.outlineScale when provided for a part.
        // - Else the group-level outlineScale for all other parts.
        //
        // Why:
        // This is the primary knob authors use to tweak outlines per part,
        // while keeping a consistent group default for the rest.
        //
        // Type:
        // Component-level unit test with Outlined mocked out.
        //
        // Dependencies:
        // - React Testing Library render.
        // - outlinedMock to capture props passed into Outlined.
        //
        // How:
        // - Render ModelGroup with three parts:
        //   - Part A: has outlineScale=1.2.
        //   - Part B: no part outlineScale.
        //   - Part C: no part outlineScale but has worldThickness/boundingRadius.
        // - Pass outlineScale={1.5} on the group.
        // - Assert:
        //   - Part A gets 1.2.
        //   - Parts B and C both get 1.5 (group-level).
        const parts = [
            {
                id: 'explicit',
                geometry: <TestGeometry />,
                outlineScale: 1.2,
                boundingRadius: 1,
            },
            {
                id: 'group-1',
                geometry: <TestGeometry />,
                boundingRadius: 1,
            },
            {
                id: 'group-2',
                geometry: <TestGeometry />,
                worldThickness: 0.2,
                boundingRadius: 2,
            },
        ];

        render(
            <ModelGroup
                parts={parts as any}
                outlineScale={1.5}
                // outlineThickness / outlineWorldThickness are irrelevant here
                // because outlineScale (group-level) already wins.
            />,
        );

        expect(outlinedMock).toHaveBeenCalledTimes(3);

        const a = outlinedMock.mock.calls[0][0];
        const b = outlinedMock.mock.calls[1][0];
        const c = outlinedMock.mock.calls[2][0];

        // Part A: explicit outlineScale wins
        expect(a.outlineScale).toBeCloseTo(1.2);

        // Parts B and C: group outlineScale, since they have no own outlineScale
        expect(b.outlineScale).toBeCloseTo(1.5);
        expect(c.outlineScale).toBeCloseTo(1.5);
    });

    test('prefers per-part outlineScale and otherwise uses group outlineScale', () => {
        // Goal:
        // Verify that resolveScale uses:
        // - p.outlineScale when provided for a part.
        // - Else the group-level outlineScale for all other parts.
        //
        // Why:
        // This is the primary knob authors use to tweak outlines per part,
        // while keeping a consistent group default for the rest.
        //
        // Type:
        // Component-level unit test with Outlined mocked out.
        //
        // Dependencies:
        // - React Testing Library render.
        // - outlinedMock to capture props passed into Outlined.
        //
        // How:
        // - Render ModelGroup with three parts:
        //   - Part A: has outlineScale=1.2.
        //   - Part B: no part outlineScale.
        //   - Part C: no part outlineScale but has worldThickness/boundingRadius.
        // - Pass outlineScale={1.5} on the group.
        // - Assert:
        //   - Part A gets 1.2.
        //   - Parts B and C both get 1.5 (group-level).
        const parts = [
            {
                id: 'explicit',
                geometry: <TestGeometry />,
                outlineScale: 1.2,
                boundingRadius: 1,
            },
            {
                id: 'group-1',
                geometry: <TestGeometry />,
                boundingRadius: 1,
            },
            {
                id: 'group-2',
                geometry: <TestGeometry />,
                worldThickness: 0.2,
                boundingRadius: 2,
            },
        ];

        render(
            <ModelGroup
                parts={parts as any}
                outlineScale={1.5}
                // outlineThickness / outlineWorldThickness are irrelevant here
                // because outlineScale (group-level) already wins.
            />,
        );

        expect(outlinedMock).toHaveBeenCalledTimes(3);

        const a = outlinedMock.mock.calls[0][0];
        const b = outlinedMock.mock.calls[1][0];
        const c = outlinedMock.mock.calls[2][0];

        // Part A: explicit outlineScale wins
        expect(a.outlineScale).toBeCloseTo(1.2);

        // Parts B and C: group outlineScale, since they have no own outlineScale
        expect(b.outlineScale).toBeCloseTo(1.5);
        expect(c.outlineScale).toBeCloseTo(1.5);
    });

    test('clicking the auto-interaction group emits an OutlinedGroupInspect payload', () => {
        // Goal:
        // Check that when there is no manual hitbox:
        // - ModelGroup wires pointer handlers on the parts group.
        // - Clicking this group calls onInspect once with an
        //   OutlinedGroupInspect payload containing part metadata.
        //
        // Why:
        // This is the main interaction path for most models: auto-computed
        // hitbox + a single inspect payload representing the whole group.
        //
        // Type:
        // Component-level integration test (ModelGroup + mocked Outlined).
        //
        // Dependencies:
        // - React Testing Library render/fireEvent.
        // - Same mocks as previous tests.
        //
        // How:
        // - Render a ModelGroup with a single part, some group-level inspect
        //   props and a group onInspect handler.
        // - Find the inner <group> that owns the parts (second <group> in DOM).
        // - Click it and assert that onInspect is called once with:
        //   - kind='outlinedGroup'.
        //   - Group-level inspect props (initialRotation, pixelSize, etc.).
        //   - A parts[0] entry matching the effective color/outline/texture.
        const onInspect = jest.fn();

        const parts = [
            {
                id: 'only',
                geometry: <TestGeometry />,
                color: '#123456',
                outlineColor: '#abcdef',
                textureUrl: '/textures/only.jpg',
                texturePixelated: true,
                position: [1, 2, 3],
            },
        ];

        const { container } = render(
            <ModelGroup
                parts={parts as any}
                color="#000000"
                outlineColor="#ffffff"
                onInspect={onInspect}
                initialRotation={[0, 0.5, 0]}
                inspectPixelSize={2}
                inspectDistance={3}
                inspectDisableOutline={true}
            />,
        );

        const groups = container.querySelectorAll('group');
        expect(groups.length).toBeGreaterThan(1);

        // The first group is the outer wrapper; the second holds the parts
        const partsGroup = groups[1];
        fireEvent.click(partsGroup);

        expect(onInspect).toHaveBeenCalledTimes(1);
        const payload = onInspect.mock.calls[0][0];

        expect(payload).toMatchObject({
            kind: 'outlinedGroup',
            initialRotation: [0, 0.5, 0],
            pixelSize: 2,
            inspectDistance: 3,
            inspectDisableOutline: true,
        });

        expect(Array.isArray(payload.parts)).toBe(true);
        expect(payload.parts).toHaveLength(1);

        const part0 = payload.parts[0];
        expect(part0.geometry).toEqual(parts[0].geometry);
        expect(part0.color).toBe('#123456');
        expect(part0.outlineColor).toBe('#abcdef');
        expect(part0.textureUrl).toBe('/textures/only.jpg');
        expect(part0.texturePixelated).toBe(true);
        expect(part0.position).toEqual([1, 2, 3]);
    });

    test('uses manual hitbox when provided and emits inspect payload on click', () => {
        // Goal:
        // Ensure that when a manual hitbox is provided:
        // - ModelGroup renders a __manual_hitbox_interaction mesh.
        // - No auto-hitbox interaction mesh is created.
        // - Clicking the manual hitbox calls onInspect with the same
        //   OutlinedGroupInspect payload as the auto-handlers would.
        //
        // Why:
        // Some models need bespoke interaction volumes that do not match
        // their visual bounds; authors rely on manual hitboxes for that.
        //
        // Type:
        // Component-level integration test (ModelGroup + mocked Outlined).
        //
        // Dependencies:
        // - React Testing Library render/fireEvent.
        // - Same mocks as previous tests.
        //
        // How:
        // - Render ModelGroup with a hitbox prop and onInspect handler.
        // - Assert that:
        //   - A mesh with name="__manual_hitbox_interaction" exists.
        //   - No "__auto_hitbox_interaction" mesh exists.
        // - Click the manual hitbox mesh and verify onInspect is called once.
        const onInspect = jest.fn();

        const { container } = render(
            <ModelGroup
                parts={[
                    {
                        geometry: <TestGeometry />,
                        color: '#333333',
                    },
                ] as any}
                hitbox={{ size: [1, 2, 3], center: [0, 0, 0] } as any}
                onInspect={onInspect}
            />,
        );

        const manual = container.querySelector(
            'mesh[name="__manual_hitbox_interaction"]',
        );
        expect(manual).not.toBeNull();

        const auto = container.querySelector(
            'mesh[name="__auto_hitbox_interaction"]',
        );
        expect(auto).toBeNull();

        if (!manual) return;

        fireEvent.click(manual);

        expect(onInspect).toHaveBeenCalledTimes(1);
        const payload = onInspect.mock.calls[0][0];
        expect(payload.kind).toBe('outlinedGroup');
        expect(payload.parts).toHaveLength(1);
    });

    test('disables pointer interaction when disablePointer is true', () => {
        // Goal:
        // Confirm that when disablePointer is true:
        // - No pointer-driven inspect path is active.
        // - Clicking the parts group does not call onInspect.
        //
        // Why:
        // Some groups may be purely decorative or controlled by a
        // higher-level interaction system; they must not intercept
        // pointer events accidentally.
        //
        // Type:
        // Component-level negative test.
        //
        // Dependencies:
        // - React Testing Library render/fireEvent.
        // - Same mocks as previous tests.
        //
        // How:
        // - Render ModelGroup with disablePointer=true and an onInspect handler.
        // - Click the inner parts group and assert that onInspect is never called.
        const onInspect = jest.fn();

        const { container } = render(
            <ModelGroup
                parts={[
                    {
                        geometry: <TestGeometry />,
                    },
                ] as any}
                disablePointer={true}
                onInspect={onInspect}
            />,
        );

        const groups = container.querySelectorAll('group');
        expect(groups.length).toBeGreaterThan(1);

        const partsGroup = groups[1];
        fireEvent.click(partsGroup);

        expect(onInspect).not.toHaveBeenCalled();
    });
});
