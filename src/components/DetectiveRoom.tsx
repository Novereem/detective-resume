'use client'
import { Canvas, useThree } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'
import { FramedPlane } from "@/components/Primitives/FramedPlane"
import ObjectInspectOverlay from "@/components/ObjectInspectOverlay"
import { PixelateNearestFX } from "@/components/Effects/PixelateNearestFX"
import { Desk } from '@/components/Models/Desk'
import { Mug } from "@/components/Models/Mug"
import {
    corkBoardMaterials,
    deskMaterials,
    metalCabinetMaterials, metalDeskTopMaterials, metalDrawerMaterials,
    mugMaterials, secretFileMaterials
} from "@/components/Materials/detectiveRoomMats"
import {CorkBoard} from "@/components/Models/CorkBoard";
import {LightBulb} from "@/components/Models/LightBulb";
import {MetalDesk} from "@/components/Models/MetalDesk";
import {SecretFile} from "@/components/Models/SecretFile";
import { useNotifications } from '@/components/Notifications'
import {PoofEffect} from "@/components/PoofEffect";
import {
    FreeLookControls,
    PlayerMover,
    MouseZoom,
    useRightClickFocus,
    CameraPoseBridge
} from '@/components/PlayerControls'
import type {Vec3, MoveRequest, DrawerFileLike} from '@/components/Types/room'
import {InspectState} from "@/components/Types/inspectModels";
import { ANCHOR } from "@/components/Game/anchors"
import { useGameState, useGameActions } from "@/components/Game/state"
import {PuzzleNode} from "@/components/PuzzleNode";
import {DrawerFileSpawn, PositionedSecretFile} from "@/components/Game/state.data";
import RedStringsEffect from "@/components/RedStringsEffect";
import { requestZoomPeek } from '@/components/PlayerControls'

function Scene({
                   openInspect, requestMove, files, drawerFiles, poofs, onPoofDone, drawers,
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
    const { puzzlesConfig, puzzleStatus } = useGameState()

    scene.background = new THREE.Color('#3c3c3c')

    const makeOpenInspectSecret = React.useCallback(
        (file: PositionedSecretFile) =>
            (p: InspectState) =>
                openInspect({
                    ...(p as any),
                    metadata: {
                        type: 'secretfile',
                        id: file.id,
                        notif: file.message ?? "",
                        persistAfterOpen: !!file.persistAfterOpen,
                        worldPos: file.pos,
                    },
                }),
        [openInspect]
    )

    const nodeMapRef = React.useRef(new Map<string, THREE.Object3D>())

    const refFor = React.useCallback((key: string) => (node: THREE.Object3D | null) => {
        if (node) nodeMapRef.current.set(key, node)
        else nodeMapRef.current.delete(key)
    }, [])

    const worldCenterOf = (node: THREE.Object3D): Vec3 => {
        node.updateWorldMatrix(true, true)
        const box = new THREE.Box3().setFromObject(node)
        const c = box.getCenter(new THREE.Vector3())
        return [c.x, c.y, c.z]
    }

    const makeOpenInspectFromKey =
        (meta: { id: string; message: string; persistAfterOpen?: boolean }, key: string) =>
            (p: InspectState) => {
                const node = nodeMapRef.current.get(key) || null
                const worldPos: Vec3 | null = node ? worldCenterOf(node) : null
                openInspect({
                    ...(p as any),
                    metadata: {
                        type: 'secretfile',
                        id: meta.id,
                        notif: meta.message,
                        persistAfterOpen: !!meta.persistAfterOpen,
                        worldPos,
                    },
                })
            }


    function useDrawerFileIndex(drawerFiles: DrawerFileLike[]) {
        return React.useMemo(() => {
            const byId: Record<string, DrawerFileLike> = {}
            for (const f of drawerFiles) byId[f.id] = f
            return { byId }
        }, [drawerFiles])
    }
    const { byId } = useDrawerFileIndex(drawerFiles)

    const renderPuzzles = React.useCallback(() => {
        return Object.values(puzzlesConfig).map((cfg) => (
            <PuzzleNode
                key={cfg.id}
                def={{
                    puzzleId: cfg.id,
                    solvedFromInspectId: cfg.solvedFromInspectId,
                    deskAnchorKey: cfg.deskAnchorKey,
                    wallAnchorKey: cfg.wallAnchorKey,
                }}
                view={{
                    kind: 'framed',
                    frame: { width: cfg.view.width, height: cfg.view.height, border: cfg.view.border },
                    textureUrl: cfg.view.textureUrl,
                    inspect: cfg.view.inspect,
                }}
                available={!!puzzleStatus[cfg.id]?.available}
                pinned={!!puzzleStatus[cfg.id]?.pinned}
                solved={!!puzzleStatus[cfg.id]?.solved}
                solvedAnswer={puzzleStatus[cfg.id]?.solvedAnswer}

                openInspect={openInspect}
                rcFocus={rcFocus}
                rotationOffsetWhenPinned={cfg.view.rotateY180WhenPinned ? [0, Math.PI, 0] : [0, 0, 0]}
            />
        ))
    }, [puzzlesConfig, puzzleStatus, openInspect, rcFocus])
    return (
        <>
            {/* lights */}
            <ambientLight intensity={0.2}/>

            {/* room walls and floors */}
            <group>
                {/* floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2.5]} raycast={() => null}>
                    <FramedPlane
                        width={5}
                        height={5}
                        textureUrl="/textures/dark_planks.jpg"
                        textureFit="contain"
                        border={0}
                        color="#777"
                        hoverColor="#ff3b30"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow

                    />
                </mesh>

                {/* roof */}
                <mesh rotation={[-Math.PI / 2, Math.PI, Math.PI]} position={[0, 2.5, 2.5]} raycast={() => null}>
                    <FramedPlane
                        width={5}
                        height={5}
                        textureUrl="/textures/rainbow_metal.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#777"
                        hoverColor="#ff3b30"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow

                    />
                </mesh>

                {/* back wall */}
                <mesh position={[0, 2.5, 5]} rotation={[-Math.PI, 0, 0]} raycast={() => null}>
                    <FramedPlane
                        width={5}
                        height={5}
                        textureUrl="/textures/light_concrete.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#777"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                    />
                </mesh>

                {/* front wall */}
                <mesh position={[0, 2.5, 0]} rotation={[0, 0, Math.PI]} raycast={() => null}>
                    <FramedPlane
                        width={5}
                        height={5}
                        textureUrl="/textures/light_concrete.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#777"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                    />
                </mesh>

                {/* left wall */}
                <mesh position={[-2.5, 2.5, 2.5]} rotation={[-Math.PI, (Math.PI / 2), 0]} raycast={() => null}>
                    <FramedPlane
                        width={5}
                        height={5}
                        textureUrl="/textures/light_concrete.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#777"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                    />
                </mesh>

                {/* right wall */}
                <mesh position={[2.5, 2.5, 2.5]} rotation={[-Math.PI, Math.PI + (Math.PI / 2), 0]} raycast={() => null}>
                    <FramedPlane
                        width={5}
                        height={5}
                        textureUrl="/textures/light_concrete.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#777"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                    />
                </mesh>
            </group>

            <group onContextMenu={rcFocus(ANCHOR.desk1)}>
                <Desk
                    position={ANCHOR.desk1.position}
                    rotation={[0, 0, 0]}
                    color="#fff"
                    outlineScale={6.56}
                    outlinePerPart={{topScale: 1.04, legScale: 1.1}}
                    inspectPixelSize={3}
                    materialsById={deskMaterials}
                    disableOutline={true}
                    inspectDisableOutline={true}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.desk2)}>
                <Desk
                    position={ANCHOR.desk2.position}
                    rotation={[0, Math.PI / 2, 0]}
                    topSize={[1.7, 0.05, 0.6]}
                    legHeight={0.65}
                    color="#fff"
                    outlineScale={6.56}
                    outlinePerPart={{topScale: 1.04, legScale: 1.1}}
                    inspectPixelSize={3}
                    materialsById={deskMaterials}
                    disableOutline={false}
                    inspectDisableOutline={true}
                    visualizeHitbox={true}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.corkBoard)}>
                <CorkBoard
                    position={ANCHOR.corkBoard.position}
                    rotation={[0, 0, 0]}
                    onInspect={openInspect}
                    color="#fff"
                    materialsById={corkBoardMaterials}
                    inspectDistance={1}
                    inspectPixelSize={3}
                    disableOutline={true}
                    inspectDisableOutline={true}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.bulb)}>
                <LightBulb
                    position={ANCHOR.bulb.position}
                    rotation={[0, 0, Math.PI]}
                    materialsById={{
                        base: {color: '#b8bcc2', metalness: 0.85, roughness: 0.3},
                        tip: {color: '#c5c9cf', metalness: 0.9, roughness: 0.2},
                        collar: {color: '#ededed', metalness: 0.05, roughness: 0.65},
                        neck: {color: '#dcdcdc', metalness: 0.0, roughness: 0.9},
                        postL: {color: '#b9bcc0'},
                        postR: {color: '#b9bcc0'},
                        filament: {color: '#ffcc55'},
                    }}
                    disableOutline
                    inspectDisableOutline
                    enableLight
                    inspectPixelSize={3}
                />
            </group>

            {/*<group onContextMenu={rcFocus(ANCHOR.mug)}>*/}
            {/*    <Mug*/}
            {/*        position={ANCHOR.mug.position}*/}
            {/*        rotation={[0, Math.PI / 6, 0]}*/}
            {/*        color="#fff"*/}
            {/*        outlineThickness={0.008}*/}
            {/*        inspectDistance={0.5}*/}
            {/*        onInspect={(p) =>*/}
            {/*            openInspect({*/}
            {/*                ...p,*/}
            {/*                puzzle: {*/}
            {/*                    type: 'text',*/}
            {/*                    id: 'mug-initials',*/}
            {/*                    prompt: 'What is this weird object supposed to be',*/}
            {/*                    answers: ['a mug', 'mug', 'what?'],*/}
            {/*                    normalize: 'trim-lower',*/}
            {/*                    feedback: {correct: 'Correct!', incorrect: 'This is a tricky one!'},*/}
            {/*                },*/}
            {/*            })*/}
            {/*        }*/}
            {/*        inspectPixelSize={3}*/}
            {/*        materialsById={mugMaterials}*/}
            {/*        visualizeHitbox={true}*/}
            {/*    />*/}
            {/*</group>*/}

            <group onContextMenu={rcFocus(ANCHOR.deskMetal)} position={ANCHOR.deskMetal.position}
                   rotation={[0, Math.PI, 0]}>
                <MetalDesk
                    topSize={[1.80, 0.04, 0.70]}
                    materials={{
                        top: metalDeskTopMaterials,
                        cabinet: metalCabinetMaterials,
                        drawer: metalDrawerMaterials
                    }}
                    drawerContentOffset={[0, 0.012, -0.02]}
                    drawerChildren={
                        <>
                            {!!byId["sf-in-drawer"] &&
                                !!drawers[byId["sf-in-drawer"].drawerKey]?.fileAlive && (
                                    <group ref={refFor(byId["sf-in-drawer"].id)} key={byId["sf-in-drawer"].id}
                                           position={[-0.12, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0.1]}>
                                        <SecretFile
                                            onInspect={makeOpenInspectFromKey(
                                                {
                                                    id: byId["sf-in-drawer"].id,
                                                    message: byId["sf-in-drawer"].message ?? "",
                                                    persistAfterOpen: byId["sf-in-drawer"].persistAfterOpen,
                                                },
                                                byId["sf-in-drawer"].id
                                            )}
                                            materialsById={secretFileMaterials}
                                            frontOpen={0}
                                            inspectPixelSize={2}
                                            inspectDistance={0.45}
                                            disableOutline={false}
                                            visualizeHitbox={false}
                                        />
                                    </group>
                                )}
                        </>
                    }
                />
            </group>

            {/* render the puzzles */}
            {renderPuzzles()}

            {/* render the red strings */}
            <RedStringsEffect
                zoom={1.3}
                vRepeat={2}
                contrast={1.6}
                brightness={0.15}
                baseUnit={0.08}
                radius={0.0035}
            />

            {files.map((f) => (
                <group key={f.id} position={f.pos} rotation={f.rot ?? [0, 0, 0]}>
                    <SecretFile
                        onInspect={makeOpenInspectSecret(f)}
                        materialsById={secretFileMaterials}
                        frontOpen={0}
                        inspectPixelSize={2.5}
                        inspectDistance={0.5}
                        disableOutline={false}
                        visualizeHitbox={false}
                    />
                </group>
            ))}

            {poofs.map((p) => (
                <PoofEffect key={p.id} position={p.pos} onDone={() => onPoofDone(p.id)}/>
            ))}

        </>
    )
}

export default function DetectiveRoom() {
    const [inspect, setInspect] = React.useState<InspectState | null>(null)
    const defaultInspectPixelSize = 3
    const [roomPixelSize] = React.useState(2.7)
    const [moveReq, setMoveReq] = React.useState<MoveRequest | null>(null)
    const qGoalRef = React.useRef(new THREE.Quaternion())
    const {notify} = useNotifications()

    const SECRETFILE_VIEW_BEFORE_CLOSE_MS = 900
    const OVERLAY_CLOSE_ANIM_MS = 200
    const PUZZLE_SOLVE_ZOOM_MS = 900;

    const viewTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const deleteTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    React.useEffect(() => {
        return () => {
            if (viewTimerRef.current) clearTimeout(viewTimerRef.current)
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
        }
    }, [])

    const {files, drawer_files, poofs, drawers, puzzlesConfig } = useGameState()
    const {removePoof, handleSecretOpen, pinPuzzle, solveIdToPuzzle} = useGameActions()

    const prevCamPosRef = React.useRef<Vec3>([0, 1, 3])
    const prevLookAtRef = React.useRef<Vec3>([0, 1, 4])

    return (
        <div style={{position: 'fixed', inset: 0}} onContextMenu={(e) => e.preventDefault()}>
            <div style={{position: 'absolute', inset: 0}}>
                <Canvas
                    dpr={[1, 1.25]}
                    camera={{position: [0, 1, 3], fov: 80, rotation: [0, Math.PI, 0]}}
                    gl={{
                        antialias: false,
                        alpha: false,
                        depth: true,
                        stencil: false,
                        powerPreference: 'high-performance', preserveDrawingBuffer: false }}
                    style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
                >
                    <Scene
                        openInspect={setInspect}
                        requestMove={setMoveReq}
                        files={files}
                        drawerFiles={drawer_files}
                        poofs={poofs}
                        onPoofDone={removePoof}
                        drawers={drawers}
                    />
                    <PlayerMover move={moveReq} onArrive={() => setMoveReq(null)} qGoalRef={qGoalRef} />
                    <MouseZoom enabled={moveReq === null} mode="fov" />
                    <FreeLookControls enabled={moveReq === null} qGoalRef={qGoalRef} />
                    <PixelateNearestFX size={roomPixelSize} />
                    <CameraPoseBridge posRef={prevCamPosRef} lookAtRef={prevLookAtRef} />
                </Canvas>
            </div>

            <ObjectInspectOverlay
                open={!!inspect}
                state={inspect}
                onClose={() => setInspect(null)}
                pixelSize={defaultInspectPixelSize}

                onSolved={({ state, answer }) => {
                    const solvedId  = (state as any)?.puzzle?.id as string | undefined
                    const puzzleId  = solvedId ? solveIdToPuzzle[solvedId] : undefined
                    if (!puzzleId) return

                    pinPuzzle(puzzleId, true, typeof answer === 'string' ? answer : undefined)
                    notify('Pinned to cork board!', { ttlMs: 6000 })

                    const VIEW_MS = typeof SECRETFILE_VIEW_BEFORE_CLOSE_MS === 'number'
                        ? SECRETFILE_VIEW_BEFORE_CLOSE_MS : 1000
                    const CLOSE_ANIM_MS = typeof OVERLAY_CLOSE_ANIM_MS === 'number'
                        ? OVERLAY_CLOSE_ANIM_MS : 300

                    if (viewTimerRef.current)   clearTimeout(viewTimerRef.current)
                    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)

                    viewTimerRef.current = setTimeout(() => {
                        setInspect(null)

                        setTimeout(() => {
                            const cfg = puzzlesConfig[puzzleId]
                            const a = cfg ? ANCHOR[cfg.wallAnchorKey] : undefined
                            if (a?.eye && a?.position) {
                                requestZoomPeek(
                                    setMoveReq,
                                    { camera: a.eye as Vec3,      lookAt: a.position as Vec3 },
                                    { camera: prevCamPosRef.current, lookAt: prevLookAtRef.current },
                                    PUZZLE_SOLVE_ZOOM_MS
                                )
                            }
                        }, CLOSE_ANIM_MS)
                    }, VIEW_MS)
                }}

                onAction={(action, state) => {
                    if (action !== 'secret-open') return
                    const meta = (state as any)?.metadata ?? {}
                    const { id, notif, persistAfterOpen, worldPos } = meta

                    notify(notif ?? 'Secret file opened — new puzzle available.', { ttlMs: 10000 })

                    if (!persistAfterOpen && id) {
                        if (viewTimerRef.current)   clearTimeout(viewTimerRef.current)
                        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)

                        viewTimerRef.current = setTimeout(() => {
                            setInspect(null)
                            deleteTimerRef.current = setTimeout(() => {
                                handleSecretOpen({ id, worldPos })
                            }, typeof OVERLAY_CLOSE_ANIM_MS === 'number' ? OVERLAY_CLOSE_ANIM_MS : 300)
                        }, typeof SECRETFILE_VIEW_BEFORE_CLOSE_MS === 'number' ? SECRETFILE_VIEW_BEFORE_CLOSE_MS : 1000)
                    }
                }}
            />
        </div>
    )
}