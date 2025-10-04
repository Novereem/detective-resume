import * as React from 'react'

export type Notification = {
    id: number
    message: React.ReactNode
    ttlMs: number
}

export type NotificationsCtx = {
    items: Notification[]
    notify: (message: React.ReactNode, opts?: { ttlMs?: number }) => number
    remove: (id: number) => void
    clear: () => void
}

export type ToastPosition =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'