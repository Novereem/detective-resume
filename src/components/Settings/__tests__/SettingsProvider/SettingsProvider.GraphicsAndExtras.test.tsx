import React from 'react'
import {render, act, waitFor} from '@testing-library/react'
import { SettingsProvider, useSettings } from '../../SettingsProvider'

function CaptureSettings({ onCapture }: { onCapture: (s: any) => void }) {
    const settings = useSettings()
    onCapture(settings)
    return null
}

describe('SettingsProvider – graphics + extras + menu', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.style.overflow = ''
        jest.clearAllMocks()
    })

    test('menuOpen toggles document overflow to lock/unlock scrolling', () => {
        // Goal:
        // Ensure that opening the menu sets document overflow to "hidden"
        // and closing it restores the default overflow.
        //
        // Why:
        // This is the main UX side-effect of the settings menu; if it breaks,
        // the entire page can get stuck in a non-scrollable state.
        //
        // Type:
        // Integration-style unit test combining state with a DOM side-effect.
        //
        // Dependencies:
        // - SettingsProvider.
        // - settings.menuOpen / setMenuOpen.
        // - document.documentElement.style.overflow.
        //
        // How:
        // - Render provider + CaptureSettings.
        // - Assert initial overflow is "".
        // - Call setMenuOpen(true) and expect overflow === "hidden".
        // - Call setMenuOpen(false) and expect overflow === "" again.

        let captured: any
        render(
            <SettingsProvider>
                <CaptureSettings onCapture={s => { captured = s }} />
            </SettingsProvider>,
        )

        expect(document.documentElement.style.overflow).toBe('')

        act(() => {
            captured.setMenuOpen(true)
        })
        expect(document.documentElement.style.overflow).toBe('hidden')

        act(() => {
            captured.setMenuOpen(false)
        })
        expect(document.documentElement.style.overflow).toBe('')
    })

    test('loads shadow and model quality settings from localStorage and exposes matching shadowPreset', async () => {
        // Goal:
        // Verify that:
        // - shadowsEnabled, shadowQuality and modelQuality are initialized
        //   from localStorage,
        // - shadowPreset matches the chosen shadowQuality.
        //
        // Why:
        // These values directly affect lighting cost and visual quality, and
        // the preset mapping encodes important GPU trade-offs.
        //
        // Type:
        // Integration-style unit test for initial load + mapping.
        //
        // Dependencies:
        // - SettingsProvider.
        // - localStorage keys:
        //   - 'gfx.shadows.enabled.v1'
        //   - 'gfx.shadows.quality.v1'
        //   - 'gfx.models.quality.v1'
        //
        // How:
        // - Pre-populate localStorage:
        //   - shadowsEnabled = '0',
        //   - shadowQuality = 'high',
        //   - modelQuality = 'low'.
        // - Render provider + CaptureSettings.
        // - Wait for effects to run.
        // - Assert:
        //   - shadowsEnabled === false,
        //   - shadowQuality === 'high',
        //   - modelQuality === 'low',
        //   - shadowPreset.type === 'pcfsoft' (the "high" preset type).

        localStorage.setItem('gfx.shadows.enabled.v1', '0')
        localStorage.setItem('gfx.shadows.quality.v1', 'high')
        localStorage.setItem('gfx.models.quality.v1', 'low')

        let captured: any
        render(
            <SettingsProvider>
                <CaptureSettings onCapture={s => { captured = s }} />
            </SettingsProvider>,
        )

        await waitFor(() => {
            expect(captured.shadowsEnabled).toBe(false)
            expect(captured.shadowQuality).toBe('high')
            expect(captured.modelQuality).toBe('low')

            // "high" quality maps to the PCFSoft preset
            expect(captured.shadowPreset.type).toBe('pcfsoft')
            expect(captured.shadowPreset.mapSize).toBe(2048)
        })
    })
})