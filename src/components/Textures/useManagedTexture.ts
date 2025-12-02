import * as React from 'react'
import * as THREE from 'three'
import { loadManagedTexture, releaseManagedTexture } from '@/components/Textures/TextureManager'

/**
 * React hook wrapper for managed textures.
 *
 * - Loads the given URL via `loadManagedTexture`.
 * - Exposes the resolved `THREE.Texture` (or `null` on error / no URL).
 * - Calls `releaseManagedTexture` on unmount or when the URL changes.
 */
export function useManagedTexture(url?: string, opts?: Parameters<typeof loadManagedTexture>[1]) {
    const [tex, setTex] = React.useState<THREE.Texture | null>(null)
    React.useEffect(() => {
        let dead = false
        if (!url) { setTex(null); return }
        loadManagedTexture(url, opts).then(t => !dead && setTex(t)).catch(() => !dead && setTex(null))
        return () => { dead = true; releaseManagedTexture(url) }
    }, [url])
    return tex
}