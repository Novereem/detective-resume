import React from 'react'
import { render } from '@testing-library/react'
import { MagnifierRevealMaterial } from '../Magnifier/MagnifierRevealMaterial'

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

// Mock R3F hooks so the material can mount without a real canvas
const useFrameMock = jest.fn()
const useThreeMock = jest.fn(() => ({ camera: { aspect: 1.5 } }))

jest.mock('@react-three/fiber', () => ({
    __esModule: true,
    useFrame: (cb: any) => useFrameMock(cb),
    useThree: () => useThreeMock(),
}))

jest.mock('../Magnifier/MagnifierStateContext', () => ({
    useMagnifierState: () => ({
        lensMaskRef: {
            current: {
                active: true,
                origin: [0, 0, 0],
                dir: [0, 0, -1],
                radius: 0.25,
            },
        },
    }),
}))

describe('MagnifierRevealMaterial', () => {
    test('renders without crashing and produces a meshstandardmaterial host element', () => {
        // Goal:
        // Ensure that MagnifierRevealMaterial mounts safely with mocked
        // R3F + magnifier context and renders a host element.
        //
        // Why:
        // This gives us a sanity check that hook wiring + JSX shape are valid
        // without pulling in react-test-renderer or poking at React internals.
        //
        // Type:
        // Lightweight component-level unit test.
        //
        // Dependencies:
        // - MagnifierRevealMaterial (subject under test).
        // - @react-three/fiber + MagnifierStateContext mocks.
        //
        // How:
        // - Render the material with RTL.
        // - Assert that a <meshstandardmaterial> tag exists in the DOM.

        const { container } = render(<MagnifierRevealMaterial maxDistance={5} debug /> as any)
        const matEl = container.querySelector('meshstandardmaterial')
        expect(matEl).not.toBeNull()
    })
})
