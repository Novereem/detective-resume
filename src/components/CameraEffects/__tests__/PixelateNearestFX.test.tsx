import React from 'react'
import { render, screen } from '@testing-library/react'
import { PixelateNearestFX } from '../PixelateNearestFX'

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

let lastEffectInstance: any = null

jest.mock('postprocessing', () => {
    const actualThree = jest.requireActual('three')
    const { Uniform, Vector2 } = actualThree

    class EffectMock {
        name: string
        fragmentShader: string
        uniforms: Map<string, any>

        constructor(name: string, fragment: string, opts: { uniforms: Map<string, any> }) {
            this.name = name
            this.fragmentShader = fragment
            this.uniforms = opts.uniforms
            lastEffectInstance = this
        }
    }

    return {
        __esModule: true,
        Effect: EffectMock,
    }
})

jest.mock('@react-three/postprocessing', () => ({
    __esModule: true,
    EffectComposer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="composer">{children}</div>
    ),
}))

let frameCallback: ((state: any, delta: number) => void) | null = null
const useFrameMock = jest.fn((cb: any) => {
    frameCallback = cb
})
const useThreeMock = jest.fn()

jest.mock('@react-three/fiber', () => ({
    __esModule: true,
    useFrame: (cb: any) => useFrameMock(cb),
    useThree: () => useThreeMock(),
}))

describe('PixelateNearestFX / NearestPixelate', () => {
    beforeEach(() => {
        lastEffectInstance = null
        frameCallback = null
        useFrameMock.mockClear()
        useThreeMock.mockReset()
    })

    test('PixelateNearestFX returns null when size <= 1', () => {
        // Goal:
        // Ensure that for small sizes (<= 1) no postprocessing composer is
        // rendered at all.
        //
        // Why:
        // This is the early-out path that avoids attaching unused effects and
        // keeps the render pipeline clean when pixelation is disabled.
        //
        // Type:
        // Simple component-level unit test.
        //
        // Dependencies:
        // - PixelateNearestFX (subject under test).
        // - React Testing Library for DOM inspection.
        //
        // How:
        // - Render PixelateNearestFX with size={1}.
        // - Assert that no composer element is present.

        const { container } = render(<PixelateNearestFX size={1} />)
        expect(container.firstChild).toBeNull()
    })

    test('updates resolution and size uniforms each frame for NearestPixelate', () => {
        // Goal:
        // Verify that the internal NearestPixelate effect:
        // - registers a frame callback with R3F,
        // - updates the `resolution` uniform based on viewport * dpr,
        // - clamps and writes the `size` uniform.
        //
        // Why:
        // This behavior keeps the pixelation crisp and resolution-aware even
        // when the canvas size or devicePixelRatio changes.
        //
        // Type:
        // Integration-style unit test with mocked postprocessing + R3F hooks.
        //
        // Dependencies:
        // - PixelateNearestFX (which wraps NearestPixelate).
        // - mocked postprocessing.Effect to capture the uniforms Map.
        // - mocked useThree/useFrame to control viewport + dpr and to capture
        //   the frame callback.
        //
        // How:
        // - Mock useThree to return:
        //   - gl.getPixelRatio() = 1.5
        //   - viewport width=800, height=600.
        // - Render PixelateNearestFX with size={5}.
        // - Grab the lastEffectInstance from the Effect mock.
        // - Call the captured frameCallback.
        // - Assert:
        //   - resolution.x === 800 * 1.5,
        //   - resolution.y === 600 * 1.5,
        //   - size uniform === 5 (clamped via Math.max(2, size)).

        useThreeMock.mockReturnValue({
            gl: {
                getPixelRatio: () => 1.5,
            },
            size: {
                width: 800,
                height: 600,
            },
        })

        render(<PixelateNearestFX size={5} />)

        expect(screen.getByTestId('composer')).toBeInTheDocument()
        expect(useFrameMock).toHaveBeenCalledTimes(1)
        expect(lastEffectInstance).not.toBeNull()
        expect(frameCallback).not.toBeNull()

        // Simulate one frame
        frameCallback!({} as any, 0)

        const uniforms = lastEffectInstance.uniforms as Map<string, any>
        const resUniform = uniforms.get('resolution')
        const sizeUniform = uniforms.get('size')

        expect(resUniform).toBeDefined()
        expect(sizeUniform).toBeDefined()

        const res = resUniform.value
        expect(res.x).toBeCloseTo(800 * 1.5)
        expect(res.y).toBeCloseTo(600 * 1.5)

        expect(sizeUniform.value).toBe(5)
    })
})