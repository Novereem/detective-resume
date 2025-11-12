'use client'
import React from 'react'
import { useSettings } from '@/components/UI/SettingsProvider'

const EV_MOVE_BACK_TO_DESK = 'tt:moveBackToDesk'

export default function BackToDeskButton() {
    const { moveBackToDeskEnabled } = useSettings()

    const onClick = React.useCallback(() => {
        window.dispatchEvent(new CustomEvent(EV_MOVE_BACK_TO_DESK))
    }, [])

    if (!moveBackToDeskEnabled) return null

    return (
        <div
            style={{
                position: 'fixed',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: 12,
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
                    backdropFilter: 'blur(4px)'
                }}
            >
                Move back to desk
            </button>
        </div>
    )
}