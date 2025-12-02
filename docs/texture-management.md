# Texture Management

Centralised texture loading and caching for the detective room.

This system:

- Keeps a shared cache per texture URL.
- Limits concurrent `THREE.TextureLoader` work.
- Exposes global loading state for UI.
- Provides React hooks for components.

---

## TexturesIndex.ts – DETECTIVE_ROOM_TEXTURES

### DETECTIVE_ROOM_TEXTURES

- Single list of all textures used in the detective room.
- Contains:
    - All materials from `detectiveRoomMats.ts`.
    - Extra cluster textures (flat decoration, walls, red strings).
    - “Future-safe” extra files that exist in `/textures` and are preloaded now.

Use this when:

- You need to **preload everything** before entering the room.
- You want to check if a texture file is already registered.

Adding a new texture:

1. Place the file under `/public/textures/…`.
2. Add its path to `DETECTIVE_ROOM_TEXTURES`.
3. Use `useManagedTexture` or `preloadTextures` with that URL.

---

## TextureManager.ts – core manager

This module owns the cache, queue and global loading counters.

### Concurrency & caching

- `cache: Map<string, { tex?: THREE.Texture; promise?: Promise; refs: number }>`
- `MAX = 2` concurrent loads.
- Queue `q` for deferred loads.
- Counters:
    - `pending`: number of requested textures not yet finished.
    - `inFlight`: number of textures currently being loaded.
    - `queued`: start functions waiting in `q`.

### subscribeTextureLoading(cb)

- Subscribe to `{ pending, inFlight, queued }` state.
- Immediately calls `cb` with the current state.
- Calls `cb` again whenever the counters change.
- Returns an unsubscribe function.

Use this to:

- Drive a global “textures loading…” indicator.
- Show debug info in a dev overlay.

### loadManagedTexture(url, opts?)

- Loads a texture with merged defaults and optional overrides:
    - `colorSpace` (default: `THREE.SRGBColorSpace`)
    - `minFilter` / `magFilter` (`LinearFilter`)
    - `wrapS` / `wrapT` (`ClampToEdgeWrapping`)
    - `generateMipmaps` (default: `false`)
- Caches by URL:
    - First call: creates a Promise and schedules a load.
    - Next calls:
        - If load in progress: reuse the same Promise and bump `refs`.
        - If already loaded: returns the cached `tex` and bumps `refs`.
- Respects `MAX` concurrent loads via the internal queue.

Developer-tunable:

- **MAX** concurrency (currently `2`).
- Default texture parameters via the `DEFAULT` object.
- Custom `LoadOpts` per call (e.g. different filters for normal maps).

### releaseManagedTexture(url)

- Decrements the ref count for a URL.
- When `refs` hits `0`:
    - Calls `tex.dispose()`.
    - Removes the entry from `cache`.

Use this whenever a component no longer needs a texture (handled automatically by `useManagedTexture`).

### preloadTextures(urls, opts?)

- Takes a list of `(string | undefined)[]`.
- Deduplicates URLs before loading.
- Returns a Promise that resolves when **all unique textures** are loaded.

Recommended usage:

- Preload `DETECTIVE_ROOM_TEXTURES` just before entering the detective room.
- Use `opts` to override filters/wrapping for specific batches if needed.

### disposeAllManagedTextures()

- Disposes **all** textures in the manager and clears the cache.
- Safe to call when leaving the detective room or doing a “hard reset”.

---

## useManagedTexture.ts – hook wrapper

`useManagedTexture(url?: string, opts?)`

- React hook around `loadManagedTexture` / `releaseManagedTexture`.
- Behavior:
    - When `url` is truthy:
        - Calls `loadManagedTexture(url, opts)` and stores the resolved `THREE.Texture`.
        - Sets `null` if the load fails.
    - On cleanup or when `url` changes:
        - Calls `releaseManagedTexture(prevUrl)`.
- Returns the current texture or `null`.

Typical use:

```tsx
const tex = useManagedTexture('/textures/wallpaper_red.jpg');

return tex ? <meshStandardMaterial map={tex} /> : null;
