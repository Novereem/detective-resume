'use client'
import * as React from 'react'
import { subscribeTextureLoading } from './TextureManager'

export function useTextureLoading() {
    const [state, setState] = React.useState({ pending: 0, inFlight: 0, queued: 0 })
    React.useEffect(() => subscribeTextureLoading(setState), [])
    return { ...state, isLoading: state.pending > 0 }
}