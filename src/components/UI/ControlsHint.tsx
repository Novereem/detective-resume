'use client'
import React from 'react'
import { useSettings } from '@/components/Settings/SettingsProvider'

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const cornerStyle: Record<Corner, React.CSSProperties> = {
    'top-left': { top: 12, left: 12 },
    'top-right': { top: 12, right: 12 },
    'bottom-left': { bottom: 12, left: 12 },
    'bottom-right': { bottom: 12, right: 12 },
}

export function ControlsHint({
                                 position = 'bottom-left',
                                 className,
                                 scale = 1.25,
                             }: {
    position?: Corner
    className?: string
    scale?: number
}) {
    const { controlsHintVisible, setControlsHintVisible } = useSettings()
    const [showToast, setShowToast] = React.useState(false)
    const [toastKey, setToastKey] = React.useState(0)

    const hide = React.useCallback(() => {
        setControlsHintVisible(false)
        setShowToast(true)
        setToastKey((k) => k + 1)
    }, [setControlsHintVisible])

    React.useEffect(() => {
        if (controlsHintVisible) setShowToast(false)
    }, [controlsHintVisible])

    if (!controlsHintVisible && !showToast) return null

    const Scaled = ({ children }: { children: React.ReactNode }) => (
        <div
            style={{
                transform: `scale(${scale})`,
                transformOrigin:
                    position === 'top-left'    ? 'top left' :
                        position === 'top-right'   ? 'top right' :
                            position === 'bottom-left' ? 'bottom left' : 'bottom right',
            }}
        >
            {children}
        </div>
    )

    if (!controlsHintVisible && showToast) {
        return (
            <div style={{ position: 'fixed', zIndex: 120, pointerEvents: 'none', ...cornerStyle[position] }} aria-live="polite">
                <style>{`
          @keyframes ch__fadeOutOnly {
            0%   { opacity: 1 }
            70%  { opacity: 1 }  /* hold visible for a moment */
            100% { opacity: 0 }
          }
          .ch__toast {
            animation: ch__fadeOutOnly 2.6s ease forwards; /* adjust duration as you like */
          }
        `}</style>
                <Scaled>
                    <div
                        key={toastKey}
                        className="ch__toast"
                        onAnimationEnd={() => setShowToast(false)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 999,
                            background: 'rgba(0,0,0,0.55)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.12)',
                            backdropFilter: 'blur(4px)',
                            fontSize: 14,
                            lineHeight: 1.25,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <span style={{ opacity: 0.9 }}>Controls hint hidden.</span>
                        <span style={{ opacity: 0.9 }}>Can be turned on again in Menu → Controls.</span>
                    </div>
                </Scaled>
            </div>
        )
    }

    return (
        <div
            style={{ position: 'fixed', zIndex: 120, pointerEvents: 'none', ...cornerStyle[position] }}
            className={className}
            aria-hidden
        >
            <Scaled>
                <div
                    style={{
                        position: 'relative',
                        display: 'grid',
                        gap: 8,
                        padding: '12px 14px',
                        borderRadius: 14,
                        background: 'rgba(0,0,0,0.55)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(4px)',
                        fontSize: 14,
                        lineHeight: 1.25,
                        boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                        maxWidth: 320,
                    }}
                >
                    <button
                        onClick={hide}
                        aria-label="Hide controls hint"
                        title="Hide (you can re-enable in Menu → Controls)"
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
                            pointerEvents: 'auto',
                        }}
                    >
                        ×
                    </button>

                    <Row icon={<MouseIcon button="left" size={22} />}  label="Inspect" hint="Left click" />
                    <Row icon={<MouseIcon button="right" size={22} />} label="Move to object"   hint="Right click" />
                    <Row icon={<HoldLeftMouseIcon size={22} />} label="Orbit camera" hint="Hold left click + move" />
                    <Row icon={<KbdEscIcon size={22} />} label="Menu" hint="Press Esc" />
                </div>
            </Scaled>
        </div>
    )
}

function Row({ icon, label, hint }: { icon: React.ReactNode; label: string; hint: string }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '22px 1fr', alignItems: 'center', gap: 10 }}>
            <div style={{ opacity: 0.95 }}>{icon}</div>
            <div>
                <div style={{ marginBottom: 2, fontWeight: 700 }}>{label}</div>
                <div style={{ opacity: 0.9 }}>{hint}</div>
            </div>
        </div>
    )
}

function MouseIcon({ button, size = 22 }: { button: 'left' | 'right'; size?: number }) {
    const isLeft = button === 'left'
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={`${button} mouse button`}>
            <rect x="6" y="3" width="12" height="18" rx="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <line x1={12} y1={3} x2={12} y2={10.5} stroke="currentColor" strokeWidth="1.6" />
            <rect x={isLeft ? 6.75 : 12.75} y="4.5" width="4.5" height="6" rx="2" fill="currentColor" opacity="0.9" />
        </svg>
    )
}

function HoldLeftMouseIcon({ size = 22 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Hold left click">
            <rect x="6" y="3" width="12" height="18" rx="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <line x1={12} y1={3} x2={12} y2={10.5} stroke="currentColor" strokeWidth="1.6" />
            <rect x="6.75" y="4.5" width="4.5" height="6" rx="2" fill="currentColor" opacity="0.9" />
            <g transform="translate(0,-5.2)" stroke="currentColor" strokeLinecap="round" fill="none">
                <path d="M4.2 8.8 C5.5 6.7 7.7 5.4 9.8 5.2" strokeWidth="1.4" />
                <path d="M3.0 10.2 C4.9 7.0 8.3 5.0 10.7 4.7" strokeWidth="1.4" opacity="0.7" />
            </g>
        </svg>
    );
}

function KbdEscIcon({ size = 22 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Esc key">
            <rect x="6" y="10" width="36" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <text x="24" y="29" textAnchor="middle" fontSize="12" fill="currentColor" fontFamily="ui-sans-serif, system-ui, -apple-system">
                Esc
            </text>
        </svg>
    )
}
