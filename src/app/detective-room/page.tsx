'use client'
import dynamic from 'next/dynamic'
import React from 'react'
import { useTextureLoading } from '@/components/Textures/useTextureLoading'
import { NotificationsProvider, NotificationsViewport } from '@/components/Notifications'
import { ControlsHint } from '@/components/UI/ControlsHint'
import EscapeMenu from '@/components/UI/EscapeMenu'
import { SettingsProvider, useSettings } from '@/components/UI/SettingsProvider'
import BackToDeskButton from "@/components/UI/BackToDeskButton";

function StaticLoader({ message }: { message: string }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
            background: 'black', color: 'white', zIndex: 50, pointerEvents: 'none'
        }}>
            <p>{message}</p>
        </div>
    )
}

const DetectiveRoom = dynamic(() => import('@/components/DetectiveRoom'), {
    ssr: false,
    loading: () => <StaticLoader message="Loading detective room…" />,
})

function OverlayedRoom() {
    const { controlsHintVisible, controlsHintPosition } = useSettings()
    return (
        <>
            <DetectiveRoom />
            <NotificationsViewport position="top-left" />
            <ControlsHint position={controlsHintPosition} scale={1.3} />
            <BackToDeskButton />
            <EscapeMenu />
        </>
    )
}

const HIDE_DELAY_MS = 400
const FADE_MS = 200

export default function DetectiveRoomPage() {
    const { isLoading, pending } = useTextureLoading()

    const [overlayVisible, setOverlayVisible] = React.useState(true)
    const [opacity, setOpacity] = React.useState(1)
    const [booted, setBooted] = React.useState(false)
    const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
        if (booted) return

        if (isLoading) {
            if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null }
            setOverlayVisible(true)
            setOpacity(1)
            return
        }
        if (!hideTimer.current) {
            hideTimer.current = setTimeout(() => {
                setOpacity(0)
                setTimeout(() => {
                    setOverlayVisible(false)
                    setBooted(true)
                }, FADE_MS)
                hideTimer.current = null
            }, HIDE_DELAY_MS)
        }
        return () => {
            if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null }
        }
    }, [isLoading, booted])

    return (
        <NotificationsProvider>
            <SettingsProvider>
                {overlayVisible && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            display: 'grid',
                            placeItems: 'center',
                            background: 'black',
                            color: 'white',
                            zIndex: 60,
                            pointerEvents: 'none',
                            opacity,
                            transition: `opacity ${FADE_MS}ms ease`,
                        }}
                    >
                        <p>Loading detective room. . . {!booted && isLoading && pending > 0 ? ` (${pending})` : ''}</p>
                    </div>
                )}

                <OverlayedRoom />
            </SettingsProvider>
        </NotificationsProvider>
    )
}