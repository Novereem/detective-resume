import * as THREE from 'three'

type LoadOpts = {
    colorSpace?: THREE.ColorSpace
    minFilter?: THREE.TextureFilter
    magFilter?: THREE.MagnificationTextureFilter
    wrapS?: THREE.Wrapping
    wrapT?: THREE.Wrapping
    generateMipmaps?: boolean
}

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
const next = () => { if (inFlight >= MAX || q.length === 0) return; inFlight++; q.shift()!() }

export function loadManagedTexture(url: string, opts: LoadOpts = {}): Promise<THREE.Texture> {
    const found = cache.get(url)
    if (found?.tex) { found.refs++; return Promise.resolve(found.tex) }
    if (found?.promise) { found.refs++; return found.promise }

    const merged = { ...DEFAULT, ...opts }
    const p = new Promise<THREE.Texture>((resolve, reject) => {
        const start = () => {
            loader.load(url, tex => {
                tex.colorSpace = merged.colorSpace!
                tex.wrapS = merged.wrapS!
                tex.wrapT = merged.wrapT!
                tex.minFilter = merged.minFilter!
                tex.magFilter = merged.magFilter!
                tex.generateMipmaps = merged.generateMipmaps!
                cache.set(url, { tex, refs: (cache.get(url)?.refs ?? 0) + 1 })
                resolve(tex)
                inFlight--; next()
            }, undefined, err => {
                cache.delete(url)
                reject(err)
                inFlight--; next()
            })
        }
        q.push(start); next()
    })

    cache.set(url, { promise: p, refs: 1 })
    return p
}

export function releaseManagedTexture(url: string) {
    const e = cache.get(url); if (!e) return
    e.refs = Math.max(0, e.refs - 1)
    if (e.refs === 0 && e.tex) { e.tex.dispose(); cache.delete(url) }
}

export function disposeAllManagedTextures() {
    for (const e of cache.values()) if (e.tex) e.tex.dispose()
    cache.clear()
}
