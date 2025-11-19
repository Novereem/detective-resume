'use client'
import { Canvas, useThree } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'
import ObjectInspectOverlay from '@/components/ObjectInspectOverlay'
import { PixelateNearestFX } from '@/components/CameraEffects/PixelateNearestFX'

import { useNotifications } from '@/components/Notifications'
import {
    CameraPoseBridge,
    DevFlyMove,
    DevObjectMove,
    FreeLookControls,
    MouseZoom,
    PlayerMover,
    requestZoomPeek,
    useRightClickFocus,
    MagnifierPickupControls,
} from '@/components/PlayerControls'
import type { MoveRequest, Vec3 } from '@/components/Types/room'
import { InspectState } from '@/components/Types/inspectModels'
import { ANCHOR } from '@/components/Game/anchors'
import { useGameActions, useGameState } from '@/components/Game/state'
import { DrawerFileSpawn, PositionedSecretFile } from '@/components/Game/state.data'
import { useSettings } from '@/components/Settings/SettingsProvider'
import { BindersAndBooksCluster } from '@/components/DetectiveRoom/Clusters/BindersAndBooks'
import { BigFurnitureCluster } from '@/components/DetectiveRoom/Clusters/BigFurniture'
import { LightsCluster } from '@/components/DetectiveRoom/Clusters/Lights'
import { AnimatedDecorationCluster } from '@/components/DetectiveRoom/Clusters/AnimatedDecoration'
import { FlatDecorationCluster } from '@/components/DetectiveRoom/Clusters/FlatDecoration'
import { DecorationCluster } from '@/components/DetectiveRoom/Clusters/Decoration'
import { WallsCluster } from '@/components/DetectiveRoom/Clusters/Walls'
import { MovingObjects } from '@/components/DetectiveRoom/FunctionalObjects/MovingObjects'
import { PuzzleObjects } from '@/components/DetectiveRoom/FunctionalObjects/PuzzleObjects'
import { SceneEffects } from '@/components/DetectiveRoom/FunctionalObjects/Effects'
import {TriangleLogger} from "@/components/Debug/TriangleLogger";
import {Preload} from "@react-three/drei";
import {QualityLevel, QualityProvider} from "@/components/Settings/QualityContext";
import {UsableItemObjects} from "@/components/DetectiveRoom/FunctionalObjects/UsableItemObjects";
import {MagnifierStateProvider} from "@/components/CameraEffects/Magnifier/MagnifierStateContext";
import {MagnifierDebug} from "@/components/Debug/MagnifierDebug";

function Scene({
                   openInspect,
                   requestMove,
                   files,
                   drawerFiles,
                   poofs,
                   onPoofDone,
                   drawers,
               }: {
    openInspect: (s: InspectState) => void
    requestMove: (req: MoveRequest) => void
    files: PositionedSecretFile[]
    drawerFiles: DrawerFileSpawn[]
    poofs: { id: string; pos: Vec3 }[]
    onPoofDone: (id: string) => void
    drawers: Record<string, { fileAlive?: boolean }>
}) {
    const { scene } = useThree()
    const rcFocus = useRightClickFocus(requestMove)

    scene.background = new THREE.Color('#3c3c3c')
    const isDev = true;

    return (
        <>
            <ambientLight intensity={0.2} />
            <WallsCluster />

            <BindersAndBooksCluster rcFocus={rcFocus} />
            <BigFurnitureCluster rcFocus={rcFocus} />
            <LightsCluster rcFocus={rcFocus} />
            <AnimatedDecorationCluster rcFocus={rcFocus} />
            <FlatDecorationCluster rcFocus={rcFocus} />
            <DecorationCluster rcFocus={rcFocus} />

            <MovingObjects
                rcFocus={rcFocus}
                openInspect={openInspect}
                drawerFiles={drawerFiles}
                drawers={drawers}
            />

            <PuzzleObjects rcFocus={rcFocus} openInspect={openInspect} files={files} />
            <UsableItemObjects/>

            <SceneEffects poofs={poofs} onPoofDone={onPoofDone} />

            {isDev && <TriangleLogger />}
        </>
    )
}

export default function DetectiveRoom() {
    const [inspect, setInspect] = React.useState<InspectState | null>(null)
    const defaultInspectPixelSize = 3

    const { initializePixelBase, pixelateSize } = useSettings()
    React.useEffect(() => {
        const RUNTIME_DEFAULT_PIXEL = 2.7
        initializePixelBase(RUNTIME_DEFAULT_PIXEL)
    }, [initializePixelBase])

    const { initializeMouseSensitivity, mouseSensitivity } = useSettings()
    React.useEffect(() => {
        initializeMouseSensitivity(0.0022)
    }, [initializeMouseSensitivity])

    const { orientDamping, initializeOrientDamping } = useSettings()
    React.useEffect(() => {
        initializeOrientDamping(20)
    }, [initializeOrientDamping])

    const { shadowsEnabled, shadowPreset } = useSettings()

    const [moveReq, setMoveReq] = React.useState<MoveRequest | null>(null)
    const qGoalRef = React.useRef(new THREE.Quaternion())
    const { notify } = useNotifications()

    const SECRETFILE_VIEW_BEFORE_CLOSE_MS = 900
    const OVERLAY_CLOSE_ANIM_MS = 200
    const PUZZLE_SOLVE_ZOOM_MS = 1750

    const viewTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const deleteTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    React.useEffect(() => {
        return () => {
            if (viewTimerRef.current) clearTimeout(viewTimerRef.current)
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
        }
    }, [])

    const { files, drawer_files, poofs, drawers, puzzlesConfig } = useGameState()
    const { removePoof, handleSecretOpen, pinPuzzle, solveIdToPuzzle, requestOpenCardboardBox } = useGameActions()

    const prevCamPosRef = React.useRef<Vec3>([0, 1, 3])
    const prevLookAtRef = React.useRef<Vec3>([0, 1, 4])

    const params = new URLSearchParams(location.search)
    const isDev =
        typeof window !== 'undefined' &&
        (params.has('fly') || params.get('fly') === '1' || params.get('fly') === 'true')

    const isMove =
        params.has('move-objects') ||
        params.get('move-objects') === '1' ||
        params.get('move-objects') === 'true'
    const [moverBusy, setMoverBusy] = React.useState(false)

    const shadowType =
        shadowPreset.type === 'basic'
            ? THREE.BasicShadowMap
            : shadowPreset.type === 'pcf'
                ? THREE.PCFShadowMap
                : THREE.PCFSoftShadowMap

    React.useEffect(() => {
        const handler = () => setMoveReq({ camera: [0, 1, 3], lookAt: [0, 1, 4] })
        window.addEventListener('tt:moveBackToDesk' as any, handler)
        return () => window.removeEventListener('tt:moveBackToDesk' as any, handler)
    }, [])

    return (
        <div style={{ position: 'fixed', inset: 0 }} onContextMenu={(e) => e.preventDefault()}>
            <div style={{ position: 'absolute', inset: 0 }}>
                <Canvas
                    //frameloop="demand" //Makes the camera not rotate at the start?
                    shadows={shadowsEnabled ? { type: shadowType } : false}
                    dpr={[1, 1.25]}
                    camera={{ position: [0, 1, 3], fov: 80, rotation: [0, Math.PI, 0] }}
                    gl={{
                        antialias: false,
                        alpha: false,
                        depth: true,
                        stencil: false,
                        powerPreference: 'high-performance',
                        preserveDrawingBuffer: false,
                    }}
                    style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
                >
                    <QualityProvider>
                        <Scene
                            openInspect={setInspect}
                            requestMove={setMoveReq}
                            files={files}
                            drawerFiles={drawer_files}
                            poofs={poofs}
                            onPoofDone={removePoof}
                            drawers={drawers}
                        />
                    </QualityProvider>
                    <PlayerMover move={moveReq} onArrive={() => setMoveReq(null)} qGoalRef={qGoalRef} />
                    <MouseZoom enabled={moveReq === null} mode="fov" />

                    <FreeLookControls
                        qGoalRef={qGoalRef}
                        enabled={!isMove || !moverBusy}
                        lookSensitivity={mouseSensitivity}
                        orientDamping={orientDamping}
                    />

                    <MagnifierPickupControls
                        enabled={moveReq === null && !isMove && !moverBusy}
                    />

                    <DevFlyMove enabled={isDev} speed={3} verticalSpeed={3} smoothing={0} />
                    <DevObjectMove enabled={isMove} onBusyChange={setMoverBusy} />

                    <PixelateNearestFX size={pixelateSize} />
                    <CameraPoseBridge posRef={prevCamPosRef} lookAtRef={prevLookAtRef} />
                    <Preload all/>

                    <MagnifierDebug />
                </Canvas>
            </div>

            <ObjectInspectOverlay
                open={!!inspect}
                state={inspect}
                onClose={() => setInspect(null)}
                pixelSize={defaultInspectPixelSize}
                onSolved={({ state, answer }) => {
                    const solvedId = (state as any)?.puzzle?.id as string | undefined
                    const puzzleId = solvedId ? solveIdToPuzzle[solvedId] : undefined
                    if (!puzzleId) return

                    pinPuzzle(puzzleId, true, typeof answer === 'string' ? answer : undefined)
                    notify('Pinned to cork board!', { ttlMs: 6000 })

                    const VIEW_MS =
                        typeof SECRETFILE_VIEW_BEFORE_CLOSE_MS === 'number'
                            ? SECRETFILE_VIEW_BEFORE_CLOSE_MS
                            : 1000
                    const CLOSE_ANIM_MS =
                        typeof OVERLAY_CLOSE_ANIM_MS === 'number' ? OVERLAY_CLOSE_ANIM_MS : 300

                    const SOLVE_ZOOM_FACTOR = 0.6

                    function makeSolveZoomEye(anchorEye: Vec3, anchorPos: Vec3, factor = SOLVE_ZOOM_FACTOR): Vec3 {
                        const t = factor
                        return [
                            anchorPos[0] + (anchorEye[0] - anchorPos[0]) * t,
                            anchorPos[1] + (anchorEye[1] - anchorPos[1]) * t,
                            anchorPos[2] + (anchorEye[2] - anchorPos[2]) * t,
                        ]
                    }

                    if (viewTimerRef.current) clearTimeout(viewTimerRef.current)
                    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)

                    viewTimerRef.current = setTimeout(() => {
                        setInspect(null)

                        setTimeout(() => {
                            const cfg = puzzlesConfig[puzzleId]
                            const a = cfg ? ANCHOR[cfg.wallAnchorKey] : undefined
                            if (a?.eye && a?.position) {
                                const zoomEye = makeSolveZoomEye(
                                    a.eye as Vec3,
                                    a.position as Vec3
                                )

                                requestZoomPeek(
                                    setMoveReq,
                                    { camera: zoomEye, lookAt: a.position as Vec3 },
                                    {
                                        camera: prevCamPosRef.current,
                                        lookAt: prevLookAtRef.current,
                                    },
                                    PUZZLE_SOLVE_ZOOM_MS
                                )
                            }
                        }, CLOSE_ANIM_MS)
                    }, VIEW_MS)
                }}
                onAction={(action, state) => {
                    if (action === 'secret-open') {
                        const meta = (state as any)?.metadata ?? {}
                        const { id, notif, persistAfterOpen, worldPos } = meta
                        notify(notif ?? 'Secret file opened — new puzzle available.', { ttlMs: 10000 })
                        if (!persistAfterOpen && id) {
                            if (viewTimerRef.current) clearTimeout(viewTimerRef.current)
                            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
                            viewTimerRef.current = setTimeout(() => {
                                setInspect(null)
                                deleteTimerRef.current = setTimeout(() => {
                                    handleSecretOpen({ id, worldPos })
                                }, typeof OVERLAY_CLOSE_ANIM_MS === 'number'
                                    ? OVERLAY_CLOSE_ANIM_MS
                                    : 300)
                            }, typeof SECRETFILE_VIEW_BEFORE_CLOSE_MS === 'number'
                                ? SECRETFILE_VIEW_BEFORE_CLOSE_MS
                                : 1000)
                        }
                        return
                    }

                    if (action === 'box-open') {
                        const id = (state as any)?.metadata?.id as string | undefined
                        if (id) requestOpenCardboardBox(id)

                        const BOX_VIEW_BEFORE_CLOSE_MS = 900
                        if (viewTimerRef.current) clearTimeout(viewTimerRef.current)
                        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)

                        viewTimerRef.current = setTimeout(() => {
                            setInspect(null)
                        }, BOX_VIEW_BEFORE_CLOSE_MS)

                        return
                    }
                }}
            />
        </div>
    )
}