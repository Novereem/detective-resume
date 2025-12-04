# Detective Room Engine

This repo contains the 3D detective office that powers the “detective resume” experience: a fully in-browser scene built with **React Three Fiber**, **three.js**, and a small custom “room engine” (anchors, model-building, puzzles, magnifier, etc.).

This README is aimed at other developers joining the project: how to run it, how the scene is structured, and how to add your own objects and puzzles.

---

## Tech stack

- **Framework:** Next.js + React (TypeScript)
- **3D:** three.js, @react-three/fiber, @react-three/drei
- **Post-processing:** `postprocessing` (pixelation)
- **State & gameplay:**
    - Custom game store (`GameState`) for files, puzzles, poofs, drawers, boxes
    - Settings system with `localStorage` persistence for controls, visuals, shadows, model quality
- **Rendering helpers:**
    - Model building layer (`Outlined`, `FramedPlane`, `ModelGroup`)
    - Texture manager with caching & preloading
- **Camera & input:**
    - Custom camera controls (free look, zoom, right-click focus)
    - Magnifier pickup & lens logic
    - Dev fly mode & dev object-move gizmo

---

## Getting started

### 1. Prerequisites

- Node.js 18+ (20 recommended)
- npm (or `yarn` / `pnpm`)

### 2. Install dependencies

From the project root:

```bash
npm install
# or
yarn
# or
pnpm install
```

### 3. Run the dev server

```bash
npm run dev
```

Then open the detective room route in your browser, for example:

```text
http://localhost:3000/detective-room
```

(If your route file lives somewhere else, adjust the path accordingly.)

### 4. Build & run production

```bash
npm run build
npm start
```

### 5. Run tests

There are Jest tests for camera/input controls, dev controls and magnifier logic.

Check `package.json` for the exact script, but typically:

```bash
npm test
```

---

## High-level architecture

The main detective room lives in `DetectiveRoom.tsx` and is responsible for:

- Rendering the `<Canvas>` and wiring:
    - Settings & quality provider
    - Camera controls
    - Postprocessing (pixelation)
    - Puzzle inspect overlay
- Instantiating cluster components that actually contain the models:
    - `WallsCluster`
    - `BigFurnitureCluster`
    - `BindersAndBooksCluster`
    - `LightsCluster`
    - `AnimatedDecorationCluster`
    - `FlatDecorationCluster`
    - `DecorationCluster`
    - `MovingObjects`, `PuzzleObjects`, `UsableItemObjects`
- Hooking into the **game state** for files, drawers, poofs and puzzles.

A very simplified mental model:

```tsx
<Canvas>
  <QualityProvider>
    <Scene /* clusters + objects */ />
    <PerfTestBridge />
  </QualityProvider>

  {/* Camera & input */}
  <PlayerMover />
  <MouseZoom />
  <FreeLookControls />
  <MagnifierPickupControls />
  <DevFlyMove />
  <DevObjectMove />

  {/* FX & utilities */}
  <PixelateNearestFX />
  <CameraPoseBridge />
  <Preload all />
  <MagnifierDebug />
</Canvas>

<ObjectInspectOverlay ... />
```

---

## Player & dev controls

### Basic camera / interaction

From the `PlayerControls` area:

- **Mouse wheel – `MouseZoom`**  
  Scroll to zoom in/out (changes camera FOV).
- **Left drag – `FreeLookControls`**  
  Rotate camera (yaw/pitch). Movement smoothly interpolates to the goal orientation.
- **Right click – “right-click focus”**  
  Focus the camera on a specific anchor / object. Used heavily when right-clicking on desk, windows, etc. Clusters typically hook this up via an `rcFocus` prop.
- **Left click on objects**  
  Open inspect overlay / trigger puzzle / pick up magnifier (depending on the object and `userData` flags).

### Magnifier

- Click on the magnifier object to pick it up (matched via `userData.pickupId === "magnifier"`).
- When held:
    - It floats in front of the camera.
    - A **lens mask** in NDC coordinates is updated every frame.
    - `MagnifierRevealMaterial` uses that mask so certain meshes only appear inside the circular lens.

### Dev modes

From the dev controls:

- **Fly mode:** add `?fly` to the URL:

  ```text
  http://localhost:3000/detective-room?fly
  ```

    - `WASD`: move horizontally
    - `Space` / `Shift`: move up / down

- **Move objects (anchors):** add `?move-objects`:

  ```text
  http://localhost:3000/detective-room?move-objects
  ```

    - Click a movable object (has `userData.movable` and `userData.anchorKey`).
    - Use the gizmo to move/rotate.
    - On release, the updated anchor coordinates are logged for copy-paste into `Game/anchors`.

You can combine both query params:

```text
http://localhost:3000/detective-room?fly&move-objects
```

---

## Settings & quality

`SettingsProvider` keeps all user-facing preferences and persists them in `localStorage`.

It handles:

- Controls hints (visibility & position)
- Pixelation base & size
- Mouse sensitivity & camera smoothing
- Shadows (on/off + quality: low / medium / high)
- Model quality (`low` / `medium` / `high`)
- Dev extras (fly mode etc.)

Example of reading settings:

```tsx
import { useSettings } from '@/components/Settings/SettingsProvider'

const {
  mouseSensitivity,
  cameraSmoothing,
  shadowsEnabled,
  shadowPreset,
  modelQuality,
} = useSettings()
```

`QualityContext` is a thin layer that exposes just the current model quality to models, so they can switch LOD or geometry detail per quality level.

---

## Textures & materials

Textures are centrally managed and cached by a `TextureManager` and the `useManagedTexture` hook.

Key ideas:

- `DETECTIVE_ROOM_TEXTURES` – one list of all textures the scene can use, for preloading.
- `loadManagedTexture` / `useManagedTexture` – shared cache + reference counting:
    - Concurrency is limited (for example, 2 in-flight loads).
    - When a component unmounts, the hook automatically releases its texture reference.
- Materials for all big objects live in a central file (for example, `detectiveRoomMats.ts`) and are wired into models via `materialsById`.

Typical usage in a primitive:

```tsx
const tex = useManagedTexture('/textures/wallpaper_red.jpg')
return tex ? <meshStandardMaterial map={tex} /> : null
```

---

## Game state & puzzles

`GameState` encapsulates everything that changes during a play session.

### Core snapshot structure

Defined in something like `state.data.ts`:

- `files` – world-space secret files in the room.
- `drawer_files` – secret files that spawn inside drawers.
- `poofs` – transient VFX markers (spawned when new puzzles appear or files vanish).
- `drawers` – open/closed + file-alive status.
- `puzzlesConfig` – static puzzle definitions (prompts, answers, connect-to, anchors).
- `puzzleStatus` – runtime status (available, solved, pinned, etc.).
- `cardboardBoxes` – state for cardboard box interactions (closed / opening / opened).

`initialSnapshot` wires this up with anchor data so puzzles, files and poofs appear at the correct desk / wall positions.

### Game actions

Game logic exposes actions such as:

- `spawnPoof(pos)` / `removePoof(id)`
- `setDrawer(key, patch)`
- `setPuzzleAvailable(id, on)`
- `pinPuzzle(id, pinned, solvedAnswer?)`
- `handleSecretOpen({ id, worldPos })`
- `requestOpenCardboardBox(id)` / `finishOpenCardboardBox(id)`

React hooks:

```tsx
const snapshot = useGameState()
const actions = useGameActions()
```

The **inspect overlay** (for example, `ObjectInspectOverlay`) uses `puzzleConfig` + `usePuzzleInspect` to display puzzles and report solved events back into game state.

---

## Model building 101

Models are composed from primitives to avoid hand-authored meshes in a DCC tool. The stack looks like this:

1. **`Outlined`**  
   Single mesh + outline + hover/click/inspect, optional texture and magnifier behavior.

2. **`FramedPlane`**  
   Framed poster/screen primitive with texture and optional magnifier-only visibility.

3. **`ModelGroup`**  
   Takes an array of `PartSpec` and builds a full object with:
    - Multiple `Outlined` parts
    - Shared materials via `materialsById`
    - Auto/manual hitboxes
    - Group-level hover/click/inspect behavior
    - Magnifier-only gating

Example: a configurable `Bookshelf` is implemented entirely as a `ModelGroup` of parts: sides, top, bottom, back, shelves.

---

## Tutorial: adding a new object to the room

This is the typical workflow to add a new model and place it in the detective room.

### Step 1 – Decide where it lives

- **Geometry & behavior** → new model file under `src/components/Models/...`.
- **Placement** → anchor in `Game/anchors.ts` (position, rotation, optional “eye” for camera focus).
- **Cluster** → which cluster will render it (for example, `BigFurnitureCluster`, `DecorationCluster`, or a new cluster).

### Step 2 – Create a `ModelGroup`-based model

Example for a simple pedestal:

```tsx
// src/components/Models/Decoration/Pedestal.tsx
'use client'
import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type PedestalProps = Inherited & {
  size?: [number, number, number] // [width, height, depth]
  materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Pedestal = memo(function Pedestal({
  size = [0.4, 0.6, 0.4],
  color = '#f5f5f5',
  outlineColor = '#ffffff',
  hoverColor = '#ff3b30',
  outlineScale = 1.04,
  initialRotation = [0, 0, 0] as Vec3,
  materialsById,
  ...rest
}: PedestalProps) {
  const [W, H, D] = size
  const boundR = Math.max(W, H, D) * 0.6

  const parts = useMemo<PartSpec[]>(() => {
    return [
      {
        id: 'base',
        geometry: <boxGeometry args={[W, H, D]} />,
        position: [0, H / 2, 0],
        color,
        outlineColor,
        boundingRadius: boundR,
        roughness: 0.9,
        metalness: 0.05,
        castShadow: true,
        receiveShadow: true,
      },
    ]
  }, [W, H, D, color, outlineColor, boundR])

  const hitboxSize: Vec3 = [W, H, D]
  const hitboxCenter: Vec3 = [0, H / 2, 0]

  return (
    <ModelGroup
      {...rest}
      parts={parts}
      materialsById={materialsById}
      hitbox={{ size: hitboxSize, center: hitboxCenter }}
      color={color}
      outlineColor={outlineColor}
      hoverColor={hoverColor}
      initialRotation={initialRotation}
      outlineScale={outlineScale}
    />
  )
})
```

This follows the same pattern as the bookshelf: compute parts, then pass them into `ModelGroup` along with a hitbox.

### Step 3 – Add materials and textures

1. Put your textures under `/public/textures/...`.
2. Register them in `DETECTIVE_ROOM_TEXTURES` so they can be preloaded.
3. Add material definitions for your model in `detectiveRoomMats.ts`, for example:

   ```ts
   export const pedestalMaterials = {
     base: {
       textureUrl: '/textures/pedestal_marble.jpg',
       texturePixelated: false,
       roughness: 0.4,
       metalness: 0.1,
     },
   }
   ```

4. Pass `materialsById={pedestalMaterials}` when you render the model (see next step).

### Step 4 – Place it in a cluster

Pick an anchor key or create a new one in `Game/anchors.ts`:

```ts
export const ANCHOR = {
  // ...
  pedestal1: {
    position: [1.2, 0, 2.5],
    rotation: [0, Math.PI / 4, 0],
    eye: [1.2, 1.2, 1.2], // optional, used by right-click focus
  },
}
```

Now add it to a cluster, for example `DecorationCluster` or `BigFurnitureCluster`:

```tsx
// in DecorationCluster.tsx
import { ANCHOR } from '@/components/Game/anchors'
import { Pedestal } from '@/components/Models/Decoration/Pedestal'
import { pedestalMaterials } from '@/components/Materials/detectiveRoomMats'

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void

export function DecorationCluster({ rcFocus }: { rcFocus: RcFocus }) {
  return (
    <>
      {/* existing decoration */}
      <group
        onContextMenu={rcFocus(ANCHOR.pedestal1)}
        userData={{ movable: true, anchorKey: 'pedestal1' }}
      >
        <Pedestal
          position={ANCHOR.pedestal1.position}
          rotation={ANCHOR.pedestal1.rotation}
          materialsById={pedestalMaterials}
          disablePointer={true} // or false if you want clicks/inspect
        />
      </group>
    </>
  )
}
```

- `onContextMenu={rcFocus(...)}` makes right-click focus the camera on the anchor.
- `userData.movable` + `userData.anchorKey` allow dev gizmo movement when `?move-objects` is active.

### Step 5 – Make it interactive (optional)

If you just need selection / inspect, rely on `ModelGroup`’s built-in click handling:

- Provide `onInspect` at the group level.
- Or use `userData` on parts and interpret it in your inspect overlay.

Example to open a generic inspect view:

```tsx
<Pedestal
  // ...
  canInteract
  onInspect={(inspectState) => openInspect(inspectState)}
/>
```

`openInspect` is the callback passed into `Scene` by `DetectiveRoom` and wired into `ObjectInspectOverlay`.

---

## Tutorial: creating a magnifier-only secret

You can hide things that are visible **only** through the magnifier.

### Option 1 – Hidden mesh with `MagnifierRevealMaterial`

Use `Outlined` or a custom mesh and enable the custom material:

```tsx
<Outlined
  geometry={<boxGeometry args={[0.1, 0.02, 0.3]} />}
  color="#ffffff"
  outlineColor="#ffffff"
  magnifierRevealMaterial
  canInteract={false}
/>
```

- The mesh is invisible until the magnifier’s lens mask covers it.
- `MagnifierRevealMaterial` reads the lens uniform from `MagnifierState` and discards fragments outside the circular mask.

### Option 2 – Framed secret only through magnifier

`FramedPlane` has a `textureMagnifierOnly` flag:

```tsx
<FramedPlane
  width={0.3}
  height={0.2}
  border={0.01}
  textureUrl="/textures/secret_message.png"
  textureMagnifierOnly
  canInteract={false}
/>
```

This works well for:

- Hidden messages on posters
- Notes taped under shelves
- “Watermarks” that only show up when players inspect closely

---

## Tutorial: wiring a puzzle to an object

To hook a physical object into the puzzle system:

1. **Create a puzzle config** in `puzzlesConfig` in `state.data.ts`:
    - `id`, prompt, answers, etc.
2. Set `wallAnchorKey` and/or `deskAnchorKey` so the game knows where to spawn poofs and where to zoom the camera after solving.
3. Attach a **secret file** or interaction that triggers `handleSecretOpen({ id, worldPos })` via the inspect overlay’s actions. Typically you add metadata like `unlocksPuzzleId` to the file config.
4. Optionally adjust per-puzzle settings (inspect distance / pixel size, etc.) via `puzzlesConfig`, so each puzzle can control how the camera and overlay behave.

In most cases you only need to extend `initialSnapshot` and the inspect metadata, not the core game logic.

---

## Debugging & performance tools

- **Triangle logger** – prints triangle counts per frame to help keep geometry in check.
- **Perf test bridge / hooks** – used by tests to measure FPS, frame times, etc.
- **Magnifier debug** – visualizes the magnifier lens and mask state.

---

## Conventions & tips

- **Anchors (`Game/anchors.ts`)** are the single source of truth for object and camera positions in the room.
- **Clusters** group related objects: big furniture, lights, decorations, functional items, etc. Add new objects to the appropriate cluster instead of directly in `Scene`.
- Use `materialsById` to keep **visual consistency** (wood, metal, fabric) and avoid duplicating material configuration.
- Use **model quality** (`useQuality()`) to vary detail for heavy models (for example, shelves, blinds slats, rings).
- Keep `DETECTIVE_ROOM_TEXTURES` up to date when you add textures so preloading and caching stay predictable.

---

If you keep to these patterns (anchors + clusters + `ModelGroup` + game state), extending the detective room with new props, secrets and puzzles stays manageable and testable.
