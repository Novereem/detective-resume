# PlayerControls

High-level camera and input controls for the detective room.

## InputControls.tsx

### MouseZoom

- Mouse wheel zoom on the R3F canvas.
- `mode="fov"`: adjusts `PerspectiveCamera.fov` within configured limits.
- `mode="dolly"`: moves the camera along its forward direction.
- Does nothing when `enabled` is false.

### useRightClickFocus

- Factory for a right-click focus handler.
- Focuses on the clicked point or object center.
- Applies distance limits, optional fit-to-object, bounds and keep-height.
- Emits `{ camera, lookAt }` to a `requestMove` handler; the caller animates the camera.

Tests: `__tests__/InputControls.test.tsx`

---

## CameraControls.tsx

### FreeLookControls

- Mouse drag look (yaw/pitch) for the main camera.
- Left-drag updates a goal quaternion (`qGoalRef`).
- Each frame, the camera interpolates toward `qGoalRef` for smooth motion.
- Respects `enabled` to turn interaction and cursor hints on/off.

### PlayerMover

- Moves the camera towards a requested pose.
- Uses `move.camera` / `move.lookAt` as the target and `qGoalRef` for orientation.
- Damps camera position each frame and calls `onArrive` when close in position + orientation.

### CameraPoseBridge

- Writes the current camera position and a derived look-at point into plain `Vec3` refs.
- Used to expose camera pose to non-Three code.

Tests: `__tests__/CameraControls.test.tsx`

---

## DevControls.tsx

> To enable both dev fly mode and the object move gizmo in the detective room,
> use the query string:
>
> `{url}/detective-room?fly&move-objects`
>
> This is used both as a "sandbox" mode for players who finished the game and
> as a developer mode for building and adjusting rooms in the engine.
> 
### DevFlyMove

- Developer free-fly camera movement.
- WASD for horizontal movement relative to the current view.
- Space / Shift for vertical movement.
- Optional smoothing parameter to damp velocity.
- Only used when `enabled` is true (editor/debug mode).

### DevObjectMove

- Developer gizmo for moving and rotating anchor-based objects in the scene.
- Targets objects with `userData.movable` and `userData.anchorKey`.
- Click to select an object, then drag axis handles (translate mode) or rings (rotate mode).
- Shows a selection box and gizmo around the active object.
- On release, logs and copies updated anchor coordinates for easy paste into `ANCHOR`.

Tests: `__tests__/DevControls.test.tsx`

## GameplayControls / MagnifierPickupControls

### MagnifierPickupControls

- Handles picking up and dropping the magnifier via left-click.
- Click on the magnifier object (`userData.pickupId === "magnifier"`) to pick it up.
- While held, the magnifier is positioned in front of the camera and the lens mask
  (`lensMaskRef`) is updated every frame (origin, direction, radius).
- Click again on empty space to drop it back to its original parent/transform.

Tunable parameters for developers:

- **MAG_DIST**: how far in front of the camera the magnifier floats.
- **MAG_OFFSET_RIGHT**: horizontal offset relative to camera right.
- **MAG_OFFSET_UP**: vertical offset relative to camera up.
- **MAG_LENS_LOCAL**: local-space offset of the lens center, used to compute the
  mask origin/direction.
- **mask.radius** (in `MagnifierState`): radius of the visible lens area.
- **Click threshold**: squared pixel distance `> 4` between mousedown and mouseup
  turns a press into a drag and prevents dropping, so you can adjust this to make
  drops more or less sensitive.

*Do note, the magnifier positioning inside the scene affects the magnifier offset variables. Due to time constraints this issue has not been fixed yet.*

Tests: `__tests__/MagnifierControls.test.tsx`