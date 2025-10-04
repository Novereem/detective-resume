import type { InspectState } from '@/shaders/inspectTypes'

export type InspectAction = 'secret-open' | 'secret-close'

export type InspectOverlayProps = {
    open: boolean
    state: InspectState | null
    onClose: () => void
    durationMs?: number
    pixelSize?: number
    camDistance?: number
    onSolved?: (ctx: { state: InspectState }) => void
    onAction?: (action: InspectAction, state: InspectState) => void
}