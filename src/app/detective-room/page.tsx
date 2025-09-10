'use client'
import dynamic from 'next/dynamic'
import React from 'react'
import { useTextureLoading } from '@/shaders/useTextureLoading'

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

const HIDE_DELAY_MS = 400
const FADE_MS = 200

export default function DetectiveRoomPage() {
    const { isLoading, pending } = useTextureLoading()

    const [overlayVisible, setOverlayVisible] = React.useState(true)
    const [opacity, setOpacity] = React.useState(1)
    const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
        if (isLoading) {
            if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null }
            setOverlayVisible(true)
            setOpacity(1)
            return
        }
        if (!hideTimer.current) {
            hideTimer.current = setTimeout(() => {
                setOpacity(0)
                setTimeout(() => setOverlayVisible(false), FADE_MS)
                hideTimer.current = null
            }, HIDE_DELAY_MS)
        }
        return () => {
            if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null }
        }
    }, [isLoading])

    return (
        <>
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
                    <p>Loading detective room…{isLoading && pending > 0 ? ` (${pending})` : ''}</p>
                </div>
            )}

            <DetectiveRoom />
        </>
    )
}
