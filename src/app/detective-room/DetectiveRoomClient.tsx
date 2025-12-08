'use client'
import dynamic from 'next/dynamic'
import React from 'react'
import { useTextureLoading } from '@/components/Textures/useTextureLoading'
import { NotificationsProvider, NotificationsViewport } from '@/components/UI/Notifications'
import { ControlsHint } from '@/components/UI/ControlsHint'
import EscapeMenu from '@/components/UI/EscapeMenu'
import { SettingsProvider, useSettings } from '@/components/Settings/SettingsProvider'
import BackToDeskButton from '@/components/UI/BackToDeskButton'
import { preloadTextures } from '@/components/Textures/TextureManager'
import { DETECTIVE_ROOM_TEXTURES } from '@/components/Textures/detectiveRoomTextures'
import { MagnifierHint } from '@/components/UI/MagnifierHint'
import {MagnifierStateProvider, useMagnifierState} from '@/components/CameraEffects/Magnifier/MagnifierStateContext'
import {CaseProgressHud} from "@/components/UI/PuzzleProgressHud";
import {CaseClosedOverlay} from "@/components/UI/CaseClosedOverlay";

const TUTORIAL_STEPS = [
    {
        id: 'overview',
        title: 'Solve the case',
        body: 'Explore this detective room, find the puzzles, and solve them all to close the case.',
    },
    {
        id: 'look-around',
        title: 'Look around the room',
        body: 'Hold left click and move your mouse to orbit the camera around your current focus.',
    },
    {
        id: 'inspect',
        title: 'Inspect objects',
        body: 'Left click on interesting objects to inspect them up close and look for clues.',
    },
    {
        id: 'move-to',
        title: 'Move to objects',
        body: 'Right click to move to objects or areas you want to check out from a better angle.',
    },
    {
        id: 'puzzles',
        title: 'Solve the puzzles',
        body: 'When you find a puzzle, read the prompt, type your answer, and submit. Solve them all to trigger the Case Closed screen with my CV and contact details.',
    },
];

const tutorialMedia: Record<string, React.ReactNode> = {
    overview: (
        <img
            src="/tutorial/overview.gif"
            alt="Overview of the detective room and goal"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    ),
    'look-around': (
        <img
            src="/tutorial/look-around.gif"
            alt="Hold left click and move to orbit the camera"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    ),
    inspect: (
        <img
            src="/tutorial/inspect.gif"
            alt="Left click objects to inspect them up close"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    ),
    'move-to': (
        <img
            src="/tutorial/move-to.gif"
            alt="Right click to move to objects or areas"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    ),
    puzzles: (
        <img
            src="/tutorial/puzzles.gif"
            alt="Solve puzzles you find to close the case"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    ),
};
function StartupTutorialOverlay({
                                    isBootLoading,
                                    onClose,
                                }: {
    isBootLoading: boolean;
    onClose: () => void;
}) {
    const [index, setIndex] = React.useState(0);
    const step = TUTORIAL_STEPS[index];
    const lastIndex = TUTORIAL_STEPS.length - 1;

    const goPrev = React.useCallback(
        () => setIndex((i) => (i > 0 ? i - 1 : i)),
        []
    );
    const goNext = React.useCallback(
        () => setIndex((i) => (i < lastIndex ? i + 1 : i)),
        [lastIndex]
    );

    const primaryLabel = index === lastIndex ? 'Start exploring' : 'Next';

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 4000,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(0,0,0,0.62)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#f9fafb',
                pointerEvents: 'auto',
            }}
        >
            {/* Big loading / ready text at the very top */}
            <div
                style={{
                    position: 'absolute',
                    top: 24,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 650,
                    color: '#ffffff',
                    textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                    pointerEvents: 'none',
                }}
            >
                {isBootLoading ? 'Loading detective room…' : 'Detective room ready'}
            </div>

            {/* Tutorial card */}
            <div
                style={{
                    width: 'min(760px, 94vw)',
                    borderRadius: 20,
                    background: 'rgba(15,15,18,0.96)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 28px 80px rgba(0,0,0,0.9)',
                    padding: '20px 22px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 4,
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            opacity: 0.85,
                        }}
                    >
                        How to play
                    </div>
                    <div
                        style={{
                            fontSize: 11,
                            opacity: 0.6,
                        }}
                    >
                        Step {index + 1} of {TUTORIAL_STEPS.length}
                    </div>
                </div>

                {/* Media area – replace with per-step images/videos later */}
                <div
                    style={{
                        borderRadius: 14,
                        overflow: 'hidden',
                        background:
                            'radial-gradient(circle at 20% 0%, rgba(248,250,252,0.12), transparent 55%)',
                        border: '1px solid rgba(148,163,184,0.35)',
                        minHeight: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {tutorialMedia[step.id] ?? (
                        <span style={{ fontSize: 13, opacity: 0.8 }}>
                         Tutorial image / video for “{step.title}”
                        </span>
                    )}
                </div>

                {/* Text area */}
                <div
                    style={{
                        paddingTop: 6,
                        display: 'grid',
                        gap: 6,
                    }}
                >
                    <h2
                        style={{
                            fontSize: 22,
                            lineHeight: 1.3,
                            fontWeight: 650,
                        }}
                    >
                        {step.title}
                    </h2>
                    <p
                        style={{
                            fontSize: 14,
                            lineHeight: 1.5,
                            color: 'rgba(226,232,240,0.92)',
                        }}
                    >
                        {step.body}
                    </p>
                </div>

                {/* Navigation row */}
                <div
                    style={{
                        marginTop: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                    }}
                >
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={index === 0}
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 999,
                            border: '1px solid rgba(148,163,184,0.7)',
                            background:
                                index === 0
                                    ? 'rgba(15,23,42,0.7)'
                                    : 'rgba(15,23,42,1)',
                            color: 'rgba(248,250,252,0.9)',
                            fontSize: 16,
                            cursor: index === 0 ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: index === 0 ? 0.4 : 0.9,
                        }}
                    >
                        ‹
                    </button>

                    {/* Progress dots */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            justifyContent: 'center',
                            flex: 1,
                        }}
                    >
                        {TUTORIAL_STEPS.map((s, i) => {
                            const active = i === index;
                            return (
                                <span
                                    key={s.id}
                                    style={{
                                        width: active ? 16 : 8,
                                        height: 8,
                                        borderRadius: 999,
                                        background: active
                                            ? '#e5e7eb'
                                            : 'rgba(148,163,184,0.7)',
                                        transition:
                                            'width 150ms ease, background 150ms ease',
                                    }}
                                />
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={index === lastIndex ? onClose : goNext}
                        style={{
                            width: 120,
                            height: 34,
                            borderRadius: 999,
                            border: '1px solid rgba(148,163,184,0.7)',
                            background: '#f9fafb',
                            color: '#020617',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                        }}
                    >
                        <span>{primaryLabel}</span>
                        {index !== lastIndex && <span>›</span>}
                    </button>
                </div>

                {/* Skip link */}
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        marginTop: 4,
                        alignSelf: 'flex-end',
                        border: 'none',
                        background: 'transparent',
                        fontSize: 12,
                        color: 'rgba(148,163,184,0.95)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                    }}
                >
                    Skip tutorial
                </button>
            </div>
        </div>
    );
}

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
                zIndex: 999,
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
            <NotificationsViewport position="top-center" />
            {controlsHintVisible && <ControlsHint position={controlsHintPosition} scale={1.3} />}
            <MagnifierHint held={held} position="bottom-right" scale={1.25} />
            <BackToDeskButton scale={1.5}/>
            <CaseProgressHud position="top-right" scale={1.5} />
            <CaseClosedOverlay />
            <EscapeMenu />
        </>
    )
}

const HIDE_DELAY_MS = 400
const FADE_MS = 200

export default function DetectiveRoomClient() {
    const { isLoading } = useTextureLoading()

    const [bootPreloadDone, setBootPreloadDone] = React.useState(false)
    const [overlayVisible, setOverlayVisible] = React.useState(true)
    const [opacity, setOpacity] = React.useState(1)
    const [booted, setBooted] = React.useState(false)
    const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const [tutorialVisible, setTutorialVisible] = React.useState(true)

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
                    {tutorialVisible && (
                        <StartupTutorialOverlay
                            isBootLoading={!booted}
                            onClose={() => setTutorialVisible(false)}
                        />
                    )}

                    {booted && (
                        <div
                            data-testid="detective-ready"
                            style={{
                                position: 'fixed',
                                inset: 0,
                                pointerEvents: 'none',
                                opacity: 0,
                            }}
                        />
                    )}
                    <OverlayedRoom />
                </MagnifierStateProvider>
            </SettingsProvider>
        </NotificationsProvider>
    )
}
