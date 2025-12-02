# Model Building (Outlined, FramedPlane, ModelGroup)

The model-building layer lets you construct complex 3D objects for the detective room **without** using a 3D DCC tool. Instead, you compose models from small parts and reusable primitives.

Core pieces:

- `Outlined` – single outlined mesh with hover/click and optional texture/magnifier behavior.
- `FramedPlane` – framed poster/screen primitive driven by textures.
- `ModelGroup` – glue layer that turns `PartSpec` arrays into a full model, including hitboxes and inspect payloads.

This doc is for developers who want to **add new models** or **understand how existing ones are built**.

---

## Outlined

**File:** `src/components/Models/Generic/Outlined/Outlined.tsx`  
**Type:** low-level primitive, used directly and by `ModelGroup`.

### What it does

`Outlined` renders a single mesh with:

- Base geometry: any React element supported by React Three Fiber (e.g. `<boxGeometry />`).
- Outline mesh: slightly scaled-up copy for edge highlight.
- Interaction:
    - Hover → cursor change + hover color.
    - Click → optional `onInspect` + `onClick`.
- Texture integration:
    - Optional `textureUrl` loaded via `useManagedTexture`.
    - Pixel-art friendly sampling with `texturePixelated`.
- Magnifier integration:
    - Can render using `MagnifierRevealMaterial` when `magnifierRevealMaterial` is true.
    - Uses the magnifier mask to decide when the mesh should cast shadows / be visible.

### Key props (selection)

- `geometry: React.ReactElement` – geometry node (e.g. `<boxGeometry />`).
- `color?: string` – base material color.
- `outlineColor?: string` – outline material color.
- `hoverColor?: string` – color to use while hovered.
- `outlineScale?: number` – scale factor of the outline group vs base mesh.
- `canInteract?: boolean` – whether hover/click handlers should be active.
- `disablePointer?: boolean` – hard-disable pointer bindings even if `canInteract`.
- `onClick?: (e: any) => void` – raw pointer event callback.
- `onInspect?: (payload: InspectState) => void` – emits `OutlinedInspect` payload.
- `inspectOverrides?: Partial<OutlinedInspect>` – override fields in the inspect payload.
- `textureUrl?: string` – optional texture URL for the material.
- `texturePixelated?: boolean` – toggles nearest vs linear filters + mipmaps.
- `metalness?: number`, `roughness?: number` – basic PBR sliders.
- `magnifierRevealMaterial?: boolean` – switch to the magnifier reveal shader.

### When to use

Use `Outlined` directly when:

- You only need **one** mesh (box, cylinder, etc.) with hover/inspect.
- You don’t need `PartSpec` composition or `ModelGroup` features.
- You’re building small, self-contained interactive pieces.

In all other cases, prefer `ModelGroup` and let it create `Outlined` instances for you.

---

## FramedPlane

**File:** `src/components/Models/Generic/FramedPlane/FramedPlane.tsx`  
**Type:** mid-level primitive for framed flat assets (posters, paintings, screens).

### What it does

`FramedPlane` renders:

- A flat art plane that holds the texture.
- An optional frame (border) around the art.
- A hidden hitbox plane used for interaction and dev picking.
- Optional magnifier-only behavior for the texture.

It uses `useManagedTexture` under the hood, so it participates in the same caching and ref-counting as the rest of the texture system.

### Key props (selection)

- Layout:
    - `width`, `height` – size of the framed art.
    - `border` – frame thickness; `0` means no frame.
    - `doubleSide` – whether to render both sides.
- Appearance:
    - `color` – art plane color tint.
    - `borderColor` – frame color.
    - `metalness`, `roughness` – art material.
    - `frameMetalness`, `frameRoughness` – frame material.
    - `shading: 'standard' | 'basic'` – shading model.
    - `envMapIntensity` – environment reflection strength.
- Texture:
    - `textureUrl` – main art texture.
    - `textureFit: 'contain' | 'cover' | 'stretch'` – how to fit the texture into the plane.
    - `texturePixelated` – pixel-art friendly filters.
    - `textureRepeat`, `textureOffset`, `textureRotation`, `textureCenter` – UV controls.
    - `textureMagnifierOnly` – restrict interaction/visibility to the magnifier lens.
- Interaction:
    - `canInteract` – whether the hitbox should be interactive.
    - `onInspect` – emits `FramedInspect` payload.
    - `inspectOverrides`, `inspectDistance` – tweak inspect behavior.
    - `devPickable` – keep hitbox active even when not interactable (for dev tools).
    - `castShadow`, `receiveShadow` – standard shadow flags.

### When to use

Use `FramedPlane` for:

- Posters, paintings, picture frames.
- Computer monitors and screens.
- Any “flat textured thing with a frame”.

If you need multiple parts (frames, glass, stand, etc.), wrap `FramedPlane` in a `ModelGroup`.

---

## ModelGroup & PartSpec

**File:** `src/components/Models/Generic/ModelGroup/ModelGroup.tsx`  
**Type:** composition layer for assembling complex models from `PartSpec` parts.

### What it does

`ModelGroup` takes an array of `PartSpec` and:

- Creates one `Outlined` mesh per part.
- Merges per-part and group-level overrides for:
    - `color`, `outlineColor`, `hoverColor`
    - `outlineScale`, `outlineThickness`, `worldThickness`
    - `textureUrl`, `texturePixelated`, `metalness`, `roughness`
    - shadow flags and dev-only helpers.
- Computes a **combined hitbox** for interaction:
    - Use a manual hitbox if `hitbox` is provided.
    - Otherwise, auto-compute a tight box from visible meshes.
- Wires up pointer handlers:
    - Hover state for the group.
    - Click → `OutlinedGroupInspect` payload with part-level metadata.
- Integrates with the magnifier:
    - Supports `magnifierOnly` on group and individual parts.
    - Uses the magnifier mask to decide when the group is “targetable”.

**Outline scale precedence**

- If a part defines `outlineScale`, that value is used for that part.
- Otherwise the group-level `outlineScale` is applied to all parts without their own `outlineScale`.
- Only when neither the part nor the group defines `outlineScale` do we compute it from thickness and `boundingRadius`:
  `outlineScale = 1 + t / r`, where `t` is `outlineThickness ?? worldThickness ?? outlineWorldThickness`.

Setting a group-level `outlineScale` effectively disables the automatic thickness-based scaling for that group.

### PartSpec

Each part describes a single `Outlined` entity:

```ts
export type PartSpec = {
    id?: string;
    geometry: React.ReactElement;
    color?: string;
    outlineColor?: string;
    hoverColor?: string;
    outlineScale?: number;
    outlineThickness?: number;
    worldThickness?: number;
    boundingRadius?: number;
    canInteract?: boolean;
    disablePointer?: boolean;
    textureUrl?: string;
    texturePixelated?: boolean;
    metalness?: number;
    roughness?: number;
    castShadow?: boolean;
    receiveShadow?: boolean;
    magnifierOnly?: boolean;
    userData?: Record<string, unknown>;
};
```
ModelGroup props allow you to override many of these per part via `materialsById`, plus group-wide defaults (`color`, `outlineColor`, `hoverColor`, etc.).

---

### Hitbox behavior

Hitboxes determine **where you can click / inspect** the model.

**Manual hitbox**

- Provide a `hitbox` prop (`BoxSpec`).
- `ModelGroup` creates a `__manual_hitbox_interaction` mesh.
- Automatic hitbox generation is disabled.

**Auto hitbox**

- Omit `hitbox` and let `ModelGroup` compute one via `computeTightLocalBox`.
- When a valid box exists, a `__auto_hitbox_interaction` mesh is created.

**Visualizations**

- Optional debug meshes for manual/auto hitboxes help verify the extents while designing.

---

### Magnifier integration

`ModelGroup` uses `useMagnifierState` to:

- Track whether the magnifier is held and where the lens is in NDC.
- Compute a group center in world space and convert it to NDC.
- Gate interaction when `magnifierOnly` is `true`:

    - If the group center is outside the lens radius, pointer handlers early-return.
    - When the center enters the lens, click events are allowed again.

This is what allows certain models to be discoverable **only** through the magnifier.

---

### Developer knobs & usage tips

#### When to use Outlined vs ModelGroup

Use **Outlined** directly when:

- You need a single mesh with simple hover/click.
- There is no concept of “parts” or shared overrides.

Use **ModelGroup** when:

- You’re composing multiple pieces (drawers, handles, knobs, etc.).
- You want shared materials (for example all wood parts share the same texture).
- You need automatic hitboxes and a single inspect payload.

#### Useful knobs

**For Outlined**

- `outlineScale` – increase slightly for thicker outlines; avoid very large values.
- `hoverColor` – match your interaction style; usually a bright accent.
- `texturePixelated` – enable for pixel-art assets to keep them sharp.

**For FramedPlane**

- `textureFit`:
    - `contain` – preserve aspect, fully visible texture.
    - `cover` – fill area, cropping if needed.
    - `stretch` – distort to fill the frame; use sparingly.
- `border` – set to `0` for frameless posters.
- `textureMagnifierOnly` – great for hidden messages visible only through the magnifier.

**For ModelGroup**

- `materialsById` – override materials on specific parts without touching the base definition.
- `visualizeHitbox` – enable while designing to check that hitboxes match the model volume.
- `magnifierOnly` – good for entire hidden objects that should only “exist” under the lens.