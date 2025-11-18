'use client'
import dynamic from 'next/dynamic'
import React from 'react'
import { useTextureLoading } from '@/components/Textures/useTextureLoading'
import { NotificationsProvider, NotificationsViewport } from '@/components/Notifications'
import { ControlsHint } from '@/components/UI/ControlsHint'
import EscapeMenu from '@/components/UI/EscapeMenu'
import { SettingsProvider, useSettings } from '@/components/Settings/SettingsProvider'
import BackToDeskButton from '@/components/UI/BackToDeskButton'
import { preloadTextures } from '@/components/Textures/TextureManager'
import { DETECTIVE_ROOM_TEXTURES } from '@/components/Textures/detectiveRoomTextures'
import { MagnifierHint } from '@/components/UI/MagnifierHint'
import {MagnifierStateProvider, useMagnifierState} from '@/components/CameraEffects/Magnifier/MagnifierStateContext'

function StaticLoader({ message }: { message: string }) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'black',
                color: 'white',
                zIndex: 50,
                pointerEvents: 'none',
            }}
        >
            <p>{message}</p>
        </div>
    )
}

const DetectiveRoom = dynamic(() => import('@/components/DetectiveRoom/DetectiveRoom'), {
    ssr: false,
    loading: () => <StaticLoader message="Loading detective room…" />,
})


function OverlayedRoom() {
    const { controlsHintVisible, controlsHintPosition } = useSettings()
    const { held } = useMagnifierState()
    return (
        <>
            <DetectiveRoom />
            <NotificationsViewport position="top-left" />
            {controlsHintVisible && <ControlsHint position={controlsHintPosition} scale={1.3} />}
            <MagnifierHint held={held} position="bottom-right" scale={1.25} />
            <BackToDeskButton />
            <EscapeMenu />
        </>
    )
}

const HIDE_DELAY_MS = 400
const FADE_MS = 200

export default function DetectiveRoomPage() {
    const { isLoading } = useTextureLoading()

    const [bootPreloadDone, setBootPreloadDone] = React.useState(false)
    const [overlayVisible, setOverlayVisible] = React.useState(true)
    const [opacity, setOpacity] = React.useState(1)
    const [booted, setBooted] = React.useState(false)
    const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
        let cancelled = false
        preloadTextures(DETECTIVE_ROOM_TEXTURES)
            .catch(() => {
                if (!cancelled) setBootPreloadDone(true)
            })
            .then(() => {
                if (!cancelled) setBootPreloadDone(true)
            })
        return () => {
            cancelled = true
        }
    }, [])

    const isBootLoading = !bootPreloadDone || isLoading

    React.useEffect(() => {
        if (booted) return

        if (isBootLoading) {
            if (hideTimer.current) {
                clearTimeout(hideTimer.current)
                hideTimer.current = null
            }
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
            if (hideTimer.current) {
                clearTimeout(hideTimer.current)
                hideTimer.current = null
            }
        }
    }, [isBootLoading, booted])

    return (
        <NotificationsProvider>
            <SettingsProvider>
                <MagnifierStateProvider>
                    {overlayVisible && (
                        <div
                            style={{
                                position: 'fixed',
                                inset: 0,
                                display: 'grid',
                                placeItems: 'center',
                                background: 'black',
                                color: 'white',
                                opacity,
                                transition: `opacity ${FADE_MS}ms`,
                                zIndex: 40,
                                pointerEvents: 'none',
                            }}
                        >
                            <p>Loading detective room…</p>
                        </div>
                    )}
                    <OverlayedRoom />
                </MagnifierStateProvider>
            </SettingsProvider>
        </NotificationsProvider>
    )
}
