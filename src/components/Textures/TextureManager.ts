import * as THREE from 'three'
import type { LoadOpts, LoadState } from '@/components/Types/textures'

const DEFAULT: LoadOpts = {
    colorSpace: THREE.SRGBColorSpace,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    generateMipmaps: false,
}

type Entry = { tex?: THREE.Texture; promise?: Promise<THREE.Texture>; refs: number }

const cache = new Map<string, Entry>()
const loader = new THREE.TextureLoader()

let inFlight = 0
const MAX = 2
const q: Array<() => void> = []

let pending = 0
const listeners = new Set<(s: LoadState) => void>()

declare global {
    interface Window {
        __TT_TEXTURE_LOADING__?: LoadState
    }
}

const emit = () => {
    const s: LoadState = { pending, inFlight, queued: q.length }
    if (typeof window !== 'undefined') {
        window.__TT_TEXTURE_LOADING__ = s
    }
    listeners.forEach(l => l(s))
}
/**
 * Subscribe to global texture loading state.
 *
 * - Immediately calls `cb` with the current { pending, inFlight, queued }.
 * - Calls `cb` again whenever these counters change.
 * - Returns an unsubscribe function.
 */
export function subscribeTextureLoading(
    cb: (s: LoadState) => void
): () => void {
    listeners.add(cb)
    cb({ pending, inFlight, queued: q.length })
    return () => {
        listeners.delete(cb)
    }
}

const next = () => {
    if (inFlight >= MAX || q.length === 0) return
    inFlight++
    emit()
    q.shift()!()
}

/**
 * Load a texture with caching and ref counting.
 *
 * - First call for a URL starts a load and stores a Promise in the cache.
 * - Concurrent calls reuse the same Promise and bump a ref count.
 * - Once loaded, later calls return the cached `THREE.Texture`.
 *
 * Use `releaseManagedTexture` when the texture is no longer needed.
 */
export function loadManagedTexture(url: string, opts: LoadOpts = {}): Promise<THREE.Texture> {
    const found = cache.get(url)
    if (found?.tex) { found.refs++; return Promise.resolve(found.tex) }
    if (found?.promise) { found.refs++; return found.promise }

    const merged = { ...DEFAULT, ...opts }

    pending++
    emit()

    const p = new Promise<THREE.Texture>((resolve, reject) => {
        const start = () => {
            loader.load(
                url,
                (tex) => {
                    tex.colorSpace = merged.colorSpace!
                    tex.wrapS = merged.wrapS!
                    tex.wrapT = merged.wrapT!
                    tex.minFilter = merged.minFilter!
                    tex.magFilter = merged.magFilter!
                    tex.generateMipmaps = merged.generateMipmaps!
                    cache.set(url, { tex, refs: (cache.get(url)?.refs ?? 0) })
                    resolve(tex)
                    inFlight--
                    pending--
                    emit()
                    next()
                },
                undefined,
                () => {
                    cache.delete(url)
                    reject(new Error(`Failed to load ${url}`))
                    inFlight--
                    pending--
                    emit()
                    next()
                }
            )
        }
        q.push(start)
        next()
    })

    cache.set(url, { promise: p, refs: 1 })
    return p
}

/**
 * Decrease the ref count for a texture by URL.
 *
 * When the ref count reaches zero, disposes the texture and removes it
 * from the cache.
 */
export function releaseManagedTexture(url: string) {
    const e = cache.get(url); if (!e) return
    e.refs = Math.max(0, e.refs - 1)
    if (e.refs === 0 && e.tex) { e.tex.dispose(); cache.delete(url) }
}

/**
 * Preload a deduplicated set of texture URLs.
 *
 * - Filters out falsy values.
 * - Deduplicates URLs.
 * - Loads each texture via `loadManagedTexture`.
 * - Resolves when all unique textures are ready.
 */
export function preloadTextures(urls: readonly (string | undefined)[], opts?: LoadOpts) {
    const list = Array.from(new Set(urls.filter(Boolean) as string[]))
    return Promise.all(list.map(u => loadManagedTexture(u, opts))).then(() => void 0)
}

/**
 * Dispose all cached textures and clear the manager.
 *
 * Safe to call when leaving the detective room or resetting the scene.
 */
export function disposeAllManagedTextures() {
    for (const e of cache.values()) if (e.tex) e.tex.dispose()
    cache.clear()
}
