# Settings & Quality (controls, visuals, extras)

Core files:

- `src/components/Settings/SettingsProvider.tsx` – central settings state with
  persistence in `localStorage`.
- `src/components/Settings/QualityContext.tsx` – lightweight context for model
  quality (`low` / `medium` / `high`) derived from settings.

This doc is for developers who want to:
- add new toggles or sliders to the settings UI,
- read settings from gameplay / 3D components,
- understand how settings are loaded, saved and reset.

---

## SettingsProvider

**File:** `SettingsProvider.tsx`

### Responsibilities

- Store player preferences for:
    - controls UI (hint visibility + corner),
    - "Back to desk" helper button,
    - pixelation strength (base, size),
    - mouse sensitivity,
    - camera smoothing / orientation damping,
    - shadows (enabled, quality),
    - 3D model quality,
    - extra tools (fly mode),
    - “inspecting” state (used by overlay).
- Load those preferences from `localStorage` on startup.
- Persist changes back to `localStorage` after the initial load completes.
- Provide helper methods to adopt runtime defaults and reset to safe values.

### LocalStorage keys

All keys are versioned strings, for example:

- `controls.visible` / `controls.position`
- `pixel.base.v2` / `pixel.size.v2`
- `mouse.sens.base.v1` / `mouse.sens.v1`
- `cam.smooth.base.v1` / `cam.smooth.v1`
- `gfx.shadows.enabled.v1` / `gfx.shadows.quality.v1`
- `gfx.models.quality.v1`
- `ui.backToDesk.enabled.v1`
- `extra.fly.enabled.v1`

On mount, `SettingsProvider`:

- reads each key from `localStorage`,
- parses numbers for pixelation/sensitivity/damping,
- sets `*_Ref.current` flags when a stored value is accepted,
- finally flips `loadedRef.current = true`.

All write-effects (`localStorage.setItem`) are guarded by `loadedRef.current`
so the initial read does not get overwritten by default values.

### Helper methods

Exposed via `useSettings()`:

- `initializePixelBase(runtimeDefault)`
    - Called by rendering code when it knows a good pixel base for the current
      screen / device.
    - Only applies if:
        - the initial settings have finished loading, and
        - the user has not already stored a base/size.
- `resetVisuals()`
    - Clears pixelation keys from storage, resets base/size to default `2.7`.
- `initializeMouseSensitivity(runtimeDefault)`
    - Mirrors `initializePixelBase` for mouse sensitivity.
- `initializeOrientDamping(runtimeDefault)`
    - Same pattern for camera smoothing.
- `resetControlsToDefaults()`
    - Restores:
        - controls hint visibility/position,
        - mouse sensitivity to `mouseSensBase`,
        - orient damping to `orientDampingBase`.
- `resetVideoToDefaults()`
    - Restores:
        - pixelation via `resetVisuals()`,
        - shadows enabled with `shadowQuality = 'medium'`,
        - `modelQuality = 'high'`.

### Shadow presets

`shadowQuality` is one of `'low' | 'medium' | 'high'` and is mapped to a
`ShadowPreset` object:

- `low`: basic shadows, small map size.
- `medium`: PCF filtering, medium map size.
- `high`: PCFSoft filtering, large map, larger radius.

Components that need shadow parameters use `shadowPreset` instead of duplicating
these numbers.

### Reading and writing settings

**To read settings in a component:**

```tsx
import { useSettings } from '@/components/Settings/SettingsProvider'

function Example() {
  const { mouseSensitivity, shadowPreset, modelQuality } = useSettings()
  // ...
}
```

**To update settings:**
```tsx
const { setShadowsEnabled, setShadowQuality, resetVideoToDefaults } = useSettings()

setShadowsEnabled(false)
setShadowQuality('low')
resetVideoToDefaults()
```

**File:** `QualityContext.tsx`

`QualityContext` is a thin layer on top of the `SettingsProvider:`

- `QualityProvider`:
  - reads `modelQuality` from `useSettings()`,
  - optionally overrides it via a local `level` prop,
  - writes the effective value to a simple React context.
- `useQuality()`:
  - returns the current level (`'low' | 'medium' | 'high'`),
  - falls back to `high` when used without a provider.

**Typical Usage:**
```tsx
import { QualityProvider, useQuality } from '@/components/Settings/QualityContext'

function Model() {
  const quality = useQuality()
  // choose LOD / detail meshes based on quality
}

function Scene() {
  return (
    <SettingsProvider>
      <QualityProvider>
        <Model />
      </QualityProvider>
    </SettingsProvider>
  )
}
```

you can also override the level for a subtree:
```tsx
<QualityProvider level="low">
    {/* everything here will see `quality === 'low'` */}
</QualityProvider>
```
This is useful for forcing low-detail meshes on heavy clusters while keeping
`modelQuality = 'high'` for the rest of the room.