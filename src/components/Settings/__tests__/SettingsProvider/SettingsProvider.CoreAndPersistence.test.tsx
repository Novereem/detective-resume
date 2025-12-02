import React from 'react'
import { render, act } from '@testing-library/react'
import { SettingsProvider, useSettings } from '../../SettingsProvider'

function CaptureSettings({ onCapture }: { onCapture: (s: any) => void }) {
    const settings = useSettings()
    onCapture(settings)
    return null
}

describe('SettingsProvider – core + persistence', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.style.overflow = ''
        jest.clearAllMocks()
    })

    test('useSettings throws when used outside of SettingsProvider', () => {
        // Goal:
        // Ensure that calling useSettings without a surrounding SettingsProvider
        // results in a clear runtime error.
        //
        // Why:
        // This prevents silent failures when a component forgets to add the
        // provider higher up in the tree.
        //
        // Type:
        // Hook-level unit test expecting an error.
        //
        // Dependencies:
        // - useSettings.
        // - React Testing Library render function.
        //
        // How:
        // - Define a component that calls useSettings directly.
        // - Attempt to render it without a SettingsProvider.
        // - Expect an error containing the hook’s guard message.

        function BrokenConsumer() {
            useSettings()
            return null
        }

        expect(() => render(<BrokenConsumer />)).toThrow(
            'useSettings must be used within SettingsProvider',
        )
    })

    test('loads overrides from localStorage for mouse sensitivity and pixelation', () => {
        // Goal:
        // Verify that SettingsProvider reads existing localStorage values on
        // mount and uses them instead of built-in defaults.
        //
        // Why:
        // This is the core persistence behavior: players should see their
        // previous preferences when re-opening the app.
        //
        // Type:
        // Integration-style unit test across initial useEffect + state.
        //
        // Dependencies:
        // - SettingsProvider.
        // - localStorage entries for pixelation and mouse sensitivity.
        //
        // How:
        // - Set localStorage keys before rendering:
        //   - 'pixel.base.v2', 'pixel.size.v2',
        //   - 'mouse.sens.base.v1', 'mouse.sens.v1'.
        // - Render SettingsProvider + CaptureSettings.
        // - Assert that the captured settings use the stored values.

        localStorage.setItem('pixel.base.v2', '5.5')
        localStorage.setItem('pixel.size.v2', '6.5')
        localStorage.setItem('mouse.sens.base.v1', '0.01')
        localStorage.setItem('mouse.sens.v1', '0.02')

        let captured: any
        render(
            <SettingsProvider>
                <CaptureSettings onCapture={s => { captured = s }} />
            </SettingsProvider>,
        )

        expect(captured.pixelateBase).toBe(5.5)
        expect(captured.pixelateSize).toBe(6.5)
        expect(captured.mouseSensBase).toBe(0.01)
        expect(captured.mouseSensitivity).toBe(0.02)
    })

    test('initializePixelBase adopts runtime default only when no stored values exist', () => {
        // Goal:
        // Confirm that `initializePixelBase`:
        // - sets pixelateBase/Size to the runtime default when nothing is stored,
        // - does not override user values when they already exist.
        //
        // Why:
        // This ensures a good first-run experience (auto-tuned default) while
        // still respecting explicit user choices on subsequent runs.
        //
        // Type:
        // Integration-style unit test touching both state and localStorage.
        //
        // Dependencies:
        // - SettingsProvider.
        // - settings.initializePixelBase.
        // - localStorage for pixelation keys.
        //
        // How:
        // - First scenario (no stored values):
        //   - Render provider with empty localStorage.
        //   - Call initializePixelBase(4.2) via captured settings.
        //   - Expect pixelateBase/Size to be 4.2.
        // - Second scenario (stored base):
        //   - Pre-set 'pixel.base.v2' to '3.3'.
        //   - Render again, capture settings, call initializePixelBase(9.9).
        //   - Expect pixelateBase to remain 3.3.

        // Scenario 1: no stored values
        let captured: any
        const Wrapper = () => (
            <SettingsProvider>
                <CaptureSettings onCapture={s => { captured = s }} />
            </SettingsProvider>
        )

        render(<Wrapper />)

        act(() => {
            captured.initializePixelBase(4.2)
        })

        expect(captured.pixelateBase).toBe(4.2)
        expect(captured.pixelateSize).toBe(4.2)

        // Scenario 2: stored base value
        localStorage.setItem('pixel.base.v2', '3.3')
        localStorage.setItem('pixel.size.v2', '3.3')
        captured = undefined

        render(<Wrapper />)

        expect(captured.pixelateBase).toBe(3.3)
        expect(captured.pixelateSize).toBe(3.3)

        act(() => {
            captured.initializePixelBase(9.9)
        })

        // Should not override previously stored values
        expect(captured.pixelateBase).toBe(3.3)
        expect(captured.pixelateSize).toBe(3.3)
    })

    test('resetControlsToDefaults restores hint visibility/position and resets sensitivity/damping to base', () => {
        // Goal:
        // Ensure that `resetControlsToDefaults`:
        // - turns the controls hint back on,
        // - resets its position to 'bottom-left',
        // - sets mouseSensitivity to mouseSensBase,
        // - sets orientDamping to orientDampingBase.
        //
        // Why:
        // This gives players a one-click way to recover from a bad controls
        // configuration without affecting other settings.
        //
        // Type:
        // Integration-style unit test manipulating the settings object.
        //
        // Dependencies:
        // - SettingsProvider.
        // - settings.resetControlsToDefaults.
        //
        // How:
        // - Render provider + capture settings.
        // - Mutate:
        //   - controlsHintVisible = false,
        //   - controlsHintPosition = 'top-right',
        //   - mouseSensitivity to a custom value,
        //   - orientDamping to a custom value.
        // - Call resetControlsToDefaults().
        // - Assert the expected reset behavior.

        let captured: any
        render(
            <SettingsProvider>
                <CaptureSettings onCapture={s => { captured = s }} />
            </SettingsProvider>,
        )

        act(() => {
            captured.setControlsHintVisible(false)
            captured.setControlsHintPosition('top-right')
            captured.setMouseSensitivity(0.123)
            captured.setOrientDamping(999)
        })

        expect(captured.controlsHintVisible).toBe(false)
        expect(captured.controlsHintPosition).toBe('top-right')
        expect(captured.mouseSensitivity).toBe(0.123)
        expect(captured.orientDamping).toBe(999)

        const baseSens = captured.mouseSensBase
        const baseDamp = captured.orientDampingBase

        act(() => {
            captured.resetControlsToDefaults()
        })

        expect(captured.controlsHintVisible).toBe(true)
        expect(captured.controlsHintPosition).toBe('bottom-left')
        expect(captured.mouseSensitivity).toBe(baseSens)
        expect(captured.orientDamping).toBe(baseDamp)
    })

    test('resetVideoToDefaults resets pixelation, shadows and model quality', () => {
        // Goal:
        // Verify that `resetVideoToDefaults` delegates to resetVisuals and
        // applies the expected defaults for shadows and model quality.
        //
        // Why:
        // This is the main "panic button" for video settings; it must restore
        // a known good configuration.
        //
        // Type:
        // Integration-style unit test across multiple settings fields.
        //
        // Dependencies:
        // - SettingsProvider.
        // - settings.resetVideoToDefaults.
        //
        // How:
        // - Render provider + capture settings.
        // - Mutate:
        //   - pixelateBase/Size,
        //   - shadowsEnabled, shadowQuality,
        //   - modelQuality.
        // - Call resetVideoToDefaults().
        // - Assert:
        //   - pixelateBase/Size back to 2.7,
        //   - shadowsEnabled === true, shadowQuality === 'medium',
        //   - modelQuality === 'high'.

        let captured: any
        render(
            <SettingsProvider>
                <CaptureSettings onCapture={s => { captured = s }} />
            </SettingsProvider>,
        )

        act(() => {
            captured.setPixelateBase(5.5)
            captured.setPixelateSize(6.6)
            captured.setShadowsEnabled(false)
            captured.setShadowQuality('high')
            captured.setModelQuality('low')
        })

        expect(captured.pixelateBase).toBe(5.5)
        expect(captured.pixelateSize).toBe(6.6)
        expect(captured.shadowsEnabled).toBe(false)
        expect(captured.shadowQuality).toBe('high')
        expect(captured.modelQuality).toBe('low')

        act(() => {
            captured.resetVideoToDefaults()
        })

        expect(captured.pixelateBase).toBe(2.7)
        expect(captured.pixelateSize).toBe(2.7)
        expect(captured.shadowsEnabled).toBe(true)
        expect(captured.shadowQuality).toBe('medium')
        expect(captured.modelQuality).toBe('high')
    })
})
