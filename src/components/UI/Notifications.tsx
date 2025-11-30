'use client'
import React from 'react'
import type { Notification, NotificationsCtx, ToastPosition } from '@/components/Types/ui'

const NotificationsContext = React.createContext<NotificationsCtx  | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = React.useState<Notification[]>([])
    const timersRef = React.useRef(new Map<number, ReturnType<typeof setTimeout>>())
    const idRef = React.useRef(1)

    const remove = React.useCallback((id: number) => {
        setItems((prev) => prev.filter((n) => n.id !== id))
        const t = timersRef.current.get(id)
        if (t) clearTimeout(t)
        timersRef.current.delete(id)
    }, [])

    const notify = React.useCallback(
        (message: React.ReactNode, opts?: { ttlMs?: number }) => {
            const id = idRef.current++
            const ttlMs = Math.max(1000, opts?.ttlMs ?? 10000)
            const n: Notification = { id, message, ttlMs }
            setItems((prev) => [n, ...prev])
            const t = setTimeout(() => remove(id), ttlMs)
            timersRef.current.set(id, t)
            return id
        },
        [remove]
    )

    const clear = React.useCallback(() => {
        setItems([])
        for (const t of timersRef.current.values()) clearTimeout(t)
        timersRef.current.clear()
    }, [])

    React.useEffect(() => () => clear(), [clear])

    return (
        <NotificationsContext.Provider value={{ items, notify, remove, clear }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export function useNotifications() {
    const ctx = React.useContext(NotificationsContext)
    if (!ctx) throw new Error('useNotifications must be used within <NotificationsProvider>')
    return ctx
}

export function NotificationsViewport({
                                          position = 'top-left',
                                          maxWidth = 460,
                                      }: {
    position?: ToastPosition
    maxWidth?: number
}) {
    const { items, remove } = useNotifications()
    const [hoverId, setHoverId] = React.useState<number | null>(null)

    const pos: React.CSSProperties = { position: 'fixed', zIndex: 3000 }
    const gap = 8
    if (position.includes('top')) pos.top = 12
    if (position.includes('bottom')) pos.bottom = 12
    if (position.includes('left')) pos.left = 12
    if (position.includes('right')) pos.right = 12

    return (
        <div
            style={{
                ...pos,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap,
                pointerEvents: 'none',
            }}
        >
            {items.map((n) => {
                const hovered = hoverId === n.id
                return (
                    <div
                        key={n.id}
                        role="button"
                        aria-label="Dismiss notification"
                        onClick={() => remove(n.id)}
                        onMouseEnter={() => setHoverId(n.id)}
                        onMouseLeave={() => setHoverId(null)}
                        style={{
                            pointerEvents: 'auto',
                            userSelect: 'none',
                            cursor: 'pointer',
                            maxWidth,
                            width: 'fit-content',
                            color: '#fff',
                            fontSize: 'x-large',
                            background: hovered ? 'rgba(37,37,37,0.78)' : 'rgba(0,0,0,0.65)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
                            backdropFilter: 'blur(2px)',
                            WebkitBackdropFilter: 'blur(2px)',
                            transition: 'background 140ms ease, opacity 180ms ease, transform 180ms ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <div
                            onClick={(e) => {
                                e.stopPropagation()
                                remove(n.id)
                            }}
                            aria-hidden
                            title="Dismiss"
                            style={{
                                flex: '0 0 18px',
                                width: 18,
                                height: 18,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 4,
                                opacity: hovered ? 0.9 : 0,
                                transition: 'opacity 120ms ease',
                            }}
                        >
                            <span style={{ fontSize: 16, lineHeight: 1 }}>×</span>
                        </div>

                        <div style={{ lineHeight: 1.25 }}>{n.message}</div>
                    </div>
                )
            })}
        </div>
    )
}