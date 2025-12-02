import React from 'react'
import { render } from '@testing-library/react'
import { QualityProvider, useQuality } from '../QualityContext'
import { useSettings } from '../SettingsProvider'

jest.mock('../SettingsProvider', () => ({
    useSettings: jest.fn(),
}))

const mockedUseSettings = useSettings as jest.MockedFunction<typeof useSettings>

function ShowQuality() {
    const q = useQuality()
    return <span data-testid="quality">{q}</span>
}

describe('QualityContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('useQuality returns default "high" when used without a provider', () => {
        // Goal:
        // Verify that the QualityContext default value is 'high' when no
        // QualityProvider is present in the tree.
        //
        // Why:
        // This provides a safe fallback for components that accidentally
        // use `useQuality()` without wrapping in a provider.
        //
        // Type:
        // Hook + context unit test via a minimal render.
        //
        // Dependencies:
        // - useQuality (subject under test).
        // - React Testing Library for rendering and querying.
        //
        // How:
        // - Render ShowQuality without a QualityProvider.
        // - Assert that the text content equals 'high'.

        const { getByTestId } = render(<ShowQuality />)
        expect(getByTestId('quality').textContent).toBe('high')
    })

    test('QualityProvider uses explicit level prop over settings modelQuality', () => {
        // Goal:
        // Ensure that when a `level` prop is provided to QualityProvider it
        // takes precedence over the global `modelQuality` from settings.
        //
        // Why:
        // This allows forcing local low/medium/high quality for specific
        // subtrees (e.g. heavy models) regardless of global settings.
        //
        // Type:
        // Context unit test with a mocked SettingsProvider.
        //
        // Dependencies:
        // - QualityProvider.
        // - useSettings (mocked to provide a different modelQuality).
        //
        // How:
        // - Mock useSettings to return `modelQuality: 'low'`.
        // - Render QualityProvider with `level="medium"` around ShowQuality.
        // - Assert that quality equals 'medium'.

        mockedUseSettings.mockReturnValue({ modelQuality: 'low' } as any)

        const { getByTestId } = render(
            <QualityProvider level="medium">
                <ShowQuality />
            </QualityProvider>,
        )

        expect(getByTestId('quality').textContent).toBe('medium')
    })

    test('QualityProvider falls back to modelQuality from settings when level is not provided', () => {
        // Goal:
        // Check that, without an explicit `level` prop, QualityProvider uses
        // the `modelQuality` value from SettingsProvider.
        //
        // Why:
        // This is the main integration between global settings and
        // quality-sensitive components.
        //
        // Type:
        // Context unit test with a mocked SettingsProvider.
        //
        // Dependencies:
        // - QualityProvider.
        // - useSettings (mocked to provide a specific modelQuality).
        //
        // How:
        // - Mock useSettings to return `modelQuality: 'low'`.
        // - Render QualityProvider without a level prop.
        // - Assert that quality equals 'low'.

        mockedUseSettings.mockReturnValue({ modelQuality: 'low' } as any)

        const { getByTestId } = render(
            <QualityProvider>
                <ShowQuality />
            </QualityProvider>,
        )

        expect(getByTestId('quality').textContent).toBe('low')
    })
})