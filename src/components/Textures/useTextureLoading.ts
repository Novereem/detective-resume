'use client'
import * as React from 'react'
import {subscribeTextureLoading} from "@/components/Textures/TextureManager";

/**
 * React hook for global texture loading state.
 *
 * - Subscribes to `subscribeTextureLoading`.
 * - Returns { pending, inFlight, queued, isLoading }.
 */
export function useTextureLoading() {
    const [state, setState] = React.useState({ pending: 0, inFlight: 0, queued: 0 })
    React.useEffect(() => subscribeTextureLoading(setState), [])
    return { ...state, isLoading: state.pending > 0 }
}