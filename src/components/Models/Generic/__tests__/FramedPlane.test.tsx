import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import * as THREE from 'three';
import MagnifierRevealMaterial from '../../../../components/CameraEffects/Magnifier/MagnifierRevealMaterial';

import { FramedPlane } from "../Outlined/FramedPlane";

// Silence noisy React / R3F console warnings for this file.
//
// JSDOM does not know about <mesh>, <group>, <planeGeometry>, etc.,
// so React logs a lot of irrelevant warnings. We mute console.error
// here to keep the test output focused on actual failures.

let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty: swallow all console.error output in this file.
    });
});

afterAll(() => {
    consoleErrorSpy.mockRestore();
});

// --- Mocks --------------------------------------------------------------

// Track useCursor calls so we can assert hover behavior indirectly
const useCursorMock = jest.fn();
jest.mock('@react-three/drei', () => ({
    useCursor: (...args: any[]) => useCursorMock(...args),
}));

// Provide a minimal camera for useThree so projection / magnifier code
// can run without touching a real Canvas.
jest.mock('@react-three/fiber', () => {
    const actual = jest.requireActual('@react-three/fiber');
    return {
        ...actual,
        useThree: () => ({
            camera: new THREE.PerspectiveCamera(),
        }),
    };
});

jest.mock(
    '../../../../components/CameraEffects/Magnifier/MagnifierStateContext',
    () => ({
        useMagnifierState: () => ({
            lensMaskRef: {
                current: {
                    active: false,
                    origin: [0, 0],
                    radius: 0.25,
                    aspect: 1,
                },
            },
            held: false,
            setHeld: jest.fn(),
        }),
    }),
);

// Capture texture loading configuration for assertions
const useManagedTextureMock = jest.fn();
jest.mock(
    '../../../../components/Textures/useManagedTexture',
    () => ({
        useManagedTexture: (...args: any[]) => useManagedTextureMock(...args),
    }),
);

// Capture MagnifierRevealMaterial usage to verify magnifier-only path
jest.mock(
    '../../../../components/CameraEffects/Magnifier/MagnifierRevealMaterial',
    () => {
        const mock = jest.fn(() => null);

        return {
            __esModule: true,
            default: mock,
        };
    },
);

describe('FramedPlane', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('requests texture via useManagedTexture with pixel-art friendly sampling options', () => {
        // Goal:
        // Verify that FramedPlane calls useManagedTexture with:
        // - The provided textureUrl.
        // - Correct min/mag filters and mipmap settings depending on
        //   texturePixelated.
        //
        // Why:
        // This ensures framed planes share the same pixel-art-friendly
        // texture pipeline as Outlined, which is important for visual
        // consistency across the detective room.
        //
        // Type:
        // Component-level unit test.
        //
        // Dependencies:
        // - useManagedTexture mocked via useManagedTextureMock.
        //
        // How:
        // - Render once with texturePixelated=false.
        // - Render again with texturePixelated=true.
        // - Assert both calls have matching filter/mipmap settings.
        useManagedTextureMock.mockReturnValue(null);

        render(
            <FramedPlane
                textureUrl="/textures/poster-a.jpg"
                texturePixelated={false}
            />,
        );

        render(
            <FramedPlane
                textureUrl="/textures/poster-b.png"
                texturePixelated={true}
            />,
        );

        expect(useManagedTextureMock).toHaveBeenCalledTimes(2);

        const firstCall = useManagedTextureMock.mock.calls[0];
        const secondCall = useManagedTextureMock.mock.calls[1];

        expect(firstCall[0]).toBe('/textures/poster-a.jpg');
        expect(firstCall[1]).toEqual({
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            generateMipmaps: true,
        });

        expect(secondCall[0]).toBe('/textures/poster-b.png');
        expect(secondCall[1]).toEqual({
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            generateMipmaps: false,
        });
    });

    test('emits a FramedInspect payload on click, with inspectOverrides applied last', () => {
        // Goal:
        // Ensure that:
        // - Clicking the interaction hitbox calls onInspect once.
        // - The payload is of kind="framed" and carries core props.
        // - inspectOverrides are merged in last and win over base fields.
        //
        // Why:
        // The inspector relies on FramedPlane to provide a single, stable
        // FramedInspect payload describing the object and how it should
        // be presented in the detail view.
        //
        // Type:
        // Component-level integration test focused on inspect behavior.
        //
        // Dependencies:
        // - React Testing Library render/fireEvent.
        //
        // How:
        // - Render a FramedPlane with:
        //   - color, borderColor, border, doubleSide=false, textureUrl, etc.
        //   - inspectOverrides overriding color and inspectDistance.
        // - Click the last <mesh> (interaction hitbox).
        // - Assert that onInspect is called with the merged payload.
        const onInspect = jest.fn();

        // Provide a fake texture so the "tex && ..." branch is taken.
        const fakeTex: any = {
            image: { width: 100, height: 50 },
            wrapS: null,
            wrapT: null,
            repeat: { set: jest.fn() },
            offset: { set: jest.fn() },
            center: { set: jest.fn() },
        };
        useManagedTextureMock.mockReturnValue(fakeTex);

        const { container } = render(
            <FramedPlane
                width={2}
                height={1}
                color="#222222"
                borderColor="#dddddd"
                border={0.1}
                doubleSide={false}
                textureUrl="/textures/poster.jpg"
                textureFit="contain"
                texturePixelated={false}
                textureZ={0.01}
                canInteract={true}
                inspectDistance={3}
                inspectOverrides={{
                    color: '#ff00ff',
                    inspectDistance: 5,
                    height: 200,
                }}
                onInspect={onInspect}
            />,
        );

        const meshes = container.querySelectorAll('mesh');
        expect(meshes.length).toBeGreaterThan(0);

        // The last mesh is the invisible interaction hitbox
        const hitbox = meshes[meshes.length - 1];
        fireEvent.click(hitbox);

        expect(onInspect).toHaveBeenCalledTimes(1);
        const payload = onInspect.mock.calls[0][0];

        expect(payload.kind).toBe('framed');
        expect(payload.width).toBe(2);
        expect(payload.border).toBe(0.1);
        expect(payload.doubleSide).toBe(false);
        expect(payload.textureUrl).toBe('/textures/poster.jpg');
        expect(payload.textureFit).toBe('contain');
        expect(payload.texturePixelated).toBe(false);
        expect(payload.textureZ).toBe(0.01);

        // Overrides win
        expect(payload.color).toBe('#ff00ff');
        expect(payload.inspectDistance).toBe(5);
        expect(payload.height).toBe(200);
    });

    test('drives cursor state from canInteract + hovered flag on the interaction hitbox', () => {
        // Goal:
        // Verify that FramedPlane:
        // - Uses internal hovered state to drive useCursor(canInteract && hovered).
        // - Hooks pointer handlers on the invisible interaction hitbox mesh.
        //
        // Why:
        // Posters and screens should show a hand cursor only when they are
        // actually interactable and hovered, which is important feedback in
        // a dense 3D room.
        //
        // Type:
        // Component-level unit test focused on hover/cursor behavior.
        //
        // Dependencies:
        // - useCursor mocked as useCursorMock.
        //
        // How:
        // - Render with canInteract=true.
        // - Pointer-over the hitbox -> expect useCursor(true).
        // - Pointer-out the hitbox -> expect useCursor(false).
        useManagedTextureMock.mockReturnValue(null);

        const { container } = render(
            <FramedPlane
                canInteract={true}
                devPickable={true}
            />,
        );

        const meshes = container.querySelectorAll('mesh');
        const hitbox = meshes[meshes.length - 1];

        fireEvent.pointerOver(hitbox);
        expect(useCursorMock).toHaveBeenLastCalledWith(true);

        fireEvent.pointerOut(hitbox);
        expect(useCursorMock).toHaveBeenLastCalledWith(false);
    });

    test('does not render an interaction hitbox when both canInteract and devPickable are false', () => {
        // Goal:
        // Ensure that when canInteract=false and devPickable=false:
        // - No extra invisible hitbox mesh is created.
        //
        // Why:
        // Some framed planes are purely decorative and should not add any
        // extra pickable surfaces or pointer overhead.
        //
        // Type:
        // Structure / negative test.
        //
        // Dependencies:
        // - React Testing Library render.
        //
        // How:
        // - Render with canInteract=false, devPickable=false, border=0 and
        //   no textureUrl so we have a single base mesh.
        // - Assert that exactly one <mesh> is present in the output.
        useManagedTextureMock.mockReturnValue(null);

        const { container } = render(
            <FramedPlane
                canInteract={false}
                devPickable={false}
                border={0}
                textureUrl={undefined}
            />,
        );

        const meshes = container.querySelectorAll('mesh');
        expect(meshes.length).toBe(1);
    });

    test('uses MagnifierRevealMaterial when textureMagnifierOnly is enabled', () => {
        // Goal:
        // Confirm that when textureMagnifierOnly=true:
        // - FramedPlane uses MagnifierRevealMaterial for the art mesh instead
        //   of the normal meshBasic/Lambert/Standard materials path.
        //
        // Why:
        // This is the core hook for "magnifier-only" secrets on framed planes
        // and must be stable for puzzles that rely on it.
        //
        // Type:
        // Component-level unit test focused on material branching.
        //
        // Dependencies:
        // - useManagedTexture mocked to return a fake texture.
        // - MagnifierRevealMaterial mocked via MagnifierRevealMaterialMock.
        //
        // How:
        // - Render with textureUrl set and textureMagnifierOnly=true.
        // - Assert:
        //   - MagnifierRevealMaterialMock is called once.
        //   - It receives the texture map and a side value coming from the
        //     doubleSide flag (DoubleSide by default).
        const fakeTex: any = {
            image: { width: 64, height: 64 },
            wrapS: null,
            wrapT: null,
            repeat: { set: jest.fn() },
            offset: { set: jest.fn() },
            center: { set: jest.fn() },
        };
        useManagedTextureMock.mockReturnValue(fakeTex);

        render(
            <FramedPlane
                textureUrl="/textures/secret.png"
                textureMagnifierOnly={true}
            />,
        );

        // Cast the imported default to a Jest mock
        const magnifierMock = MagnifierRevealMaterial as unknown as jest.Mock<any, any[]>;

        expect(magnifierMock).toHaveBeenCalledTimes(1);

        const firstCall = magnifierMock.mock.calls[0];
        expect(firstCall).toBeDefined();

        const props = firstCall[0] as any;
        expect(props).toBeDefined();

        expect(props.map).toBe(fakeTex);
        // Default is double-sided
        expect(props.side).toBe(THREE.DoubleSide);
    });
});