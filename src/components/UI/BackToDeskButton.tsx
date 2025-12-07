'use client'
import React from 'react'
import { useSettings } from '@/components/Settings/SettingsProvider'

const EV_MOVE_BACK_TO_DESK = 'tt:moveBackToDesk'
const EV_CLOSE_INSPECT = 'tt:closeInspect'

export default function BackToDeskButton({ scale = 1.25 }: { scale?: number }) {
    const { moveBackToDeskEnabled, isInspecting } = useSettings()

    const onClick = React.useCallback(() => {
        if (isInspecting) {
            window.dispatchEvent(new Event(EV_CLOSE_INSPECT))
        } else {
            window.dispatchEvent(new CustomEvent(EV_MOVE_BACK_TO_DESK))
        }
    }, [isInspecting])

    if (!moveBackToDeskEnabled) return null

    return (
        <div
            style={{
                transform: `scale(${scale}) translateX(-50%)`,
                position: 'fixed',
                left: `${(scale * 1.25) + 50}%`,
                bottom: 12 * scale,
                zIndex: 70
            }}
        >
            <button
                onClick={onClick}
                style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: 'white',
                    fontSize: 13,
                    cursor: 'pointer',
                    borderRadius: 10,
                    backdropFilter: 'blur(4px)',
                }}
            >
                {isInspecting ? 'Close inspection screen' : 'Move back to desk'}
            </button>
        </div>
    )
}