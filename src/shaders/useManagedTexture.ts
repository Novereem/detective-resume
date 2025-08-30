import * as React from 'react'
import * as THREE from 'three'
import { loadManagedTexture, releaseManagedTexture } from './TextureManager'

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