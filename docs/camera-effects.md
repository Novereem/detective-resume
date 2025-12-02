# Camera effects: Magnifier & Pixelation

This doc explains the two main “global” visual effects in the detective room:

- **MagnifierRevealMaterial** – reveals hidden meshes through a magnifying lens.
- **PixelateNearestFX** – full-screen nearest-neighbor pixelation.

The goal is to make it easier for other developers to wire in new secrets or
tune the pixelation without having to read the shader code from scratch.

---

## MagnifierRevealMaterial

**File:** `src/components/CameraEffects/Magnifier/MagnifierRevealMaterial.tsx`

### What it does

`MagnifierRevealMaterial` wraps `meshStandardMaterial` and injects custom
uniforms + shader code so that:

- Only fragments inside a circular **screen-space mask** are drawn.
- The mask position/size is driven by the **magnifier lens**.
- An optional `debug` flag shows a green/yellow/red ring instead of the base
  material (useful when aligning the lens during development).

It uses the following uniforms:

- `uMaskActive` – `0` or `1`, controlling whether the mask is active.
- `uMaskOrigin` – lens center in NDC (x, y, z).
- `uMaskDir` – direction vector (currently not used by the shader).
- `uMaskRadius` – radius of the lens in NDC units.
- `uMaskMaxDist` – currently unused but reserved for distance-based fades.
- `uMaskDebug` – toggles the debug ring visualization.
- `uAspect` – viewport aspect ratio (width / height), used to keep the mask
  circular in pixel space.

### Data flow

1. **Lens state**  
   `MagnifierStateProvider` keeps a `lensMaskRef` ref updated with:
    - `active`, `origin`, `dir`, `radius`.

2. **Shader setup (onBeforeCompile)**  
   On first compile, `MagnifierRevealMaterial`:
    - adds the uniform declarations to the fragment shader,
    - injects a varying `vClipPosition` in the vertex shader,
    - patches `main()` in the fragment shader to:
        - compute fragment NDC from `vClipPosition`,
        - compute radial distance from the lens origin,
        - discard fragments outside the radius,
        - optionally render a debug ring.

3. **Per-frame updates (useFrame)**  
   On each frame, the component:
    - reads `lensMaskRef.current`,
    - updates all lens-related uniforms,
    - updates `uAspect` from the active camera.

### When to use it

Use `MagnifierRevealMaterial` on any mesh that should be:

- invisible by default,
- **only** visible inside the magnifier circle,
- rendered with the same PBR lighting as the rest of the scene.

---

## Magnifier state

**File:** `src/components/CameraEffects/Magnifier/MagnifierStateContext.tsx`

`MagnifierStateProvider` exposes:

- `held` / `setHeld` – whether the magnifier is equipped.
- `lensMaskRef` – mutable ref with the current lens mask.

The lens mask is updated by camera / raycast code whenever:

- the magnifier is moved,
- the camera changes orientation.

Consumers like `MagnifierRevealMaterial` only read `lensMaskRef.current` to
update uniforms on each frame.

---

## PixelateNearestFX

**File:** `src/components/CameraEffects/PixelateNearestFX.tsx`

### What it does

`PixelateNearestFX` is a small postprocessing effect that:

- Applies **nearest-neighbor** pixelation in screen space.
- Uses a configurable block size (`size` prop) in screen pixels.
- Computes resolution using the renderer’s drawing buffer size so it respects
  `devicePixelRatio`.

Internally it consists of:

- `NearestPixelate` – wraps a `postprocessing.Effect` with:
    - uniforms: `size` and `resolution`,
    - a GLSL `mainImage` function that:
        - converts UV → pixel coords,
        - snaps to a block grid of `size` pixels,
        - samples one representative pixel per block.
- `PixelateNearestFX` – wraps the effect in an `EffectComposer` when `size > 1`.

### Usage

```tsx
import { PixelateNearestFX } from '@/components/CameraEffects/PixelateNearestFX'

function Scene() {
  return (
    <>
      {/* your scene here */}
      <PixelateNearestFX size={6} />
    </>
  )
}
```

Notes:
- For `size <= 1`, `PixelateNearestFX` renders nothing (no postprocessing). 
- Larger `size` means coarser pixelation. 
- This is compatible with your other postprocessing passes as long as they all
share the same `EffectComposer`. 

You can tweak the explaining tone / naming but that’s the structure.