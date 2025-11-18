'use client'
import React from 'react'

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const cornerStyle: Record<Corner, React.CSSProperties> = {
    'top-left': { top: 12, left: 12 },
    'top-right': { top: 12, right: 12 },
    'bottom-left': { bottom: 12, left: 12 },
    'bottom-right': { bottom: 12, right: 12 },
}

const DISMISS_KEY = 'ui.magnifierHint.dismissed.v1'

export function MagnifierHint({
                                  position = 'bottom-right',
                                  className,
                                  held = false,
                                  scale = 1.25,
                              }: {
    position?: Corner
    className?: string
    held?: boolean
    scale?: number
}) {
    const [dismissed, setDismissed] = React.useState(false)
    const loadedRef = React.useRef(false)

    React.useEffect(() => {
        try {
            const v = localStorage.getItem(DISMISS_KEY)
            if (v === '1') setDismissed(true)
        } catch {
            /* ignore */
        } finally {
            loadedRef.current = true
        }
    }, [])

    const onClose = React.useCallback(() => {
        setDismissed(true)
        try {
            if (loadedRef.current) {
                localStorage.setItem(DISMISS_KEY, '1')
            }
        } catch {
            /* ignore */
        }
    }, [])

    if (!held || dismissed) return null

    const Scaled = ({ children }: { children: React.ReactNode }) => (
        <div
            style={{
                transform: `scale(${scale})`,
                transformOrigin:
                    position === 'top-left'
                        ? 'top left'
                        : position === 'top-right'
                            ? 'top right'
                            : position === 'bottom-left'
                                ? 'bottom left'
                                : 'bottom right',
            }}
        >
            {children}
        </div>
    )

    return (
        <div
            style={{
                position: 'fixed',
                zIndex: 120,
                pointerEvents: 'none',
                ...cornerStyle[position],
            }}
            className={className}
            aria-hidden
        >
            <Scaled>
                <div
                    style={{
                        position: 'relative',
                        display: 'grid',
                        gap: 6,
                        padding: '10px 12px',
                        borderRadius: 14,
                        background: 'rgba(0,0,0,0.55)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(4px)',
                        fontSize: 14,
                        lineHeight: 1.25,
                        boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                        maxWidth: 260,
                        pointerEvents: 'auto',
                    }}
                >
                    <button
                        onClick={onClose}
                        aria-label="Close magnifier hint"
                        title="Close"
                        style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 22,
                            height: 22,
                            borderRadius: 8,
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.08)',
                            color: 'white',
                            fontSize: 16,
                            lineHeight: 1,
                            cursor: 'pointer',
                        }}
                    >
                        ×
                    </button>

                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Magnifier equipped</div>
                    <div style={{ opacity: 0.9 }}>Look around the room for secrets.</div>
                    <div style={{ opacity: 0.9 }}>Click anywhere outside the lens to put it away.</div>
                </div>
            </Scaled>
        </div>
    )
}
