'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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
import {Pin} from "@/components/Models/Pin";
import {LightBulb} from "@/components/Models/LightBulb";
import {MetalDesk} from "@/components/Models/MetalDesk";
import {SecretFile} from "@/components/Models/SecretFile";
import { useNotifications } from '@/components/Notifications'
import {PoofEffect} from "@/components/PoofEffect";
import {FreeLookControls, PlayerMover, MouseZoom, useRightClickFocus} from '@/components/PlayerControls'
import type { Vec3, MoveRequest, SecretFileSpawn } from '@/components/Types/room'
import {InspectState} from "@/components/Types/inspectModels";

const ANCHOR = {
    bulb: { eye: [ 0.6, 1.6,  3.3] as Vec3, position: [0, 2, 4.3] as Vec3 },
    desk1: { eye: [ 0.8, 1.1, 2.8] as Vec3, position: [1.6, 0, 4.3] as Vec3 },
    desk2: { eye: [ -0.5, 1.1, 2.8] as Vec3, position: [-2, 0, 3] as Vec3 },
    deskMetal: { eye: [ 0, 1.1, 2.8] as Vec3, position: [0, 0, 4.2] as Vec3 },
    corkBoard: { eye: [0, 1.3, 3.2] as Vec3, position: [0, 1.3, 4.7] as Vec3 },
    mug: { eye: [-0.2, 1.3, 3.2] as Vec3, position: [-0.2, 0.77, 4.2] as Vec3 },
    houseFrame: { eye: [0.2, 1.3, 3.6] as Vec3, position: [0.2, 1.3, 4.6] as Vec3 },
}

const INITIAL_FILES: SecretFileSpawn[] = [
    { id: 'sf-ransom', pos: [-0.6, 0.7, 3.4], rot: [0, Math.PI / 4, 0], message: 'Case File: Ransom Note — new puzzle available.', persistAfterOpen: false },
    { id: 'sf-badge',  pos: [ 0.4, 0.7, 3.1], rot: [0, -Math.PI / 8, 0], message: 'Case File: Missing Badge — investigate the lead.', persistAfterOpen: true },
]

function Scene({
                   openInspect,
                   requestMove,
                   files,
                   poofs,
                   onPoofDone,
               }: {
    openInspect: (s: InspectState) => void
    requestMove: (req: MoveRequest) => void
    files: SecretFileSpawn[]
    poofs: { id: string; pos: Vec3 }[]
    onPoofDone: (id: string) => void
}) {
    const { scene } = useThree()
    const rcFocus = useRightClickFocus(requestMove)

    scene.background = new THREE.Color('#3c3c3c')

    const makeOpenInspectSecret = React.useCallback(
        (file: SecretFileSpawn) =>
            (p: InspectState) =>
                openInspect({
                    ...(p as any),
                    metadata: {
                        type: 'secretfile',
                        id: file.id,
                        notif: file.message,
                        persistAfterOpen: !!file.persistAfterOpen,
                        worldPos: file.pos,
                    },
                }),
        [openInspect]
    )

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

            <group rotation={[Math.PI, 0, 3]} position={ANCHOR.houseFrame.position}
                   onContextMenu={rcFocus(ANCHOR.houseFrame)}>
                <FramedPlane
                    width={0.17}
                    height={0.2}
                    color="#000"
                    borderColor="#fff"
                    hoverColor="#ff3b30"
                    border={0.01}
                    canInteract
                    inspectDistance={0.4}
                    onInspect={(p) =>
                        openInspect({
                            ...p,
                            puzzle: {
                                type: 'text',
                                id: 'frame-code',
                                prompt: 'What is the name of this popular medical drama from the 2000s?',
                                answers: ['house', /house\s*md/i],
                                normalize: 'trim-lower',
                                feedback: {correct: 'Nice find!', incorrect: 'Not quite—look closer.'},
                            },
                        })
                    }
                    inspectOverrides={{pixelSize: 1}}
                    textureUrl="/textures/house_szn1.jpg"
                    textureFit="stretch"
                />
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

            <group>
                <Pin
                    position={[0.2, 1.37, 4.6]}
                    rotation={[Math.PI + (Math.PI / 2), 0, 0]}
                    materialsById={corkBoardMaterials}
                    inspectDistance={0.2}
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

            <group onContextMenu={rcFocus(ANCHOR.mug)}>
                <Mug
                    position={ANCHOR.mug.position}
                    rotation={[0, Math.PI / 6, 0]}
                    color="#fff"
                    outlineThickness={0.008}
                    inspectDistance={0.5}
                    onInspect={(p) =>
                        openInspect({
                            ...p,
                            puzzle: {
                                type: 'text',
                                id: 'mug-initials',
                                prompt: 'What is this weird object supposed to be',
                                answers: ['a mug', 'mug', 'what?'],
                                normalize: 'trim-lower',
                                feedback: {correct: 'Correct!', incorrect: 'This is a tricky one!'},
                            },
                        })
                    }
                    inspectPixelSize={3}
                    materialsById={mugMaterials}
                    visualizeHitbox={true}
                />
            </group>

            <group onContextMenu={rcFocus(ANCHOR.deskMetal)} position={ANCHOR.deskMetal.position}
                   rotation={[0, Math.PI, 0]}>
                <MetalDesk
                    topSize={[1.80, 0.04, 0.70]}
                    materials={{
                        top: metalDeskTopMaterials,
                        cabinet: metalCabinetMaterials,
                        drawer: metalDrawerMaterials
                    }}
                />
            </group>

            {files.map((f) => (
                <group key={f.id} position={f.pos} rotation={f.rot ?? [0, 0, 0]}>
                    <SecretFile
                        onInspect={makeOpenInspectSecret(f)}
                        materialsById={secretFileMaterials}
                        frontOpen={0}
                        inspectPixelSize={2.5}
                        inspectDistance={0.5}
                        disableOutline={false}
                    />
                </group>
            ))}

            {poofs.map((p) => (
                <PoofEffect key={p.id} position={p.pos} onDone={() => onPoofDone(p.id)} />
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
    const { notify } = useNotifications()

    const SECRETFILE_VIEW_BEFORE_CLOSE_MS = 900
    const OVERLAY_CLOSE_ANIM_MS = 200

    const viewTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const deleteTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    React.useEffect(() => {
        return () => {
            if (viewTimerRef.current) clearTimeout(viewTimerRef.current)
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
        }
    }, [])

    const [files, setFiles] = React.useState<SecretFileSpawn[]>(INITIAL_FILES)
    const [poofs, setPoofs] = React.useState<{ id: string; pos: Vec3 }[]>([])

    const removeFile = React.useCallback((id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }, [])
    const spawnPoof = React.useCallback((pos: Vec3) => {
        setPoofs(p => [...p, { id: `poof-${Math.random().toString(36).slice(2)}`, pos }])
    }, [])
    const removePoof = React.useCallback((id: string) => {
        setPoofs(p => p.filter(x => x.id !== id))
    }, [])

    return (
        <div style={{ position: 'fixed', inset: 0 }} onContextMenu={(e) => e.preventDefault()}>
            <div style={{ position: 'absolute', inset: 0 }}>
                <Canvas
                    dpr={[1, 1.25]}
                    camera={{ position: [0, 1, 3], fov: 80, rotation: [0, Math.PI, 0] }}
                    gl={{ antialias: false, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
                    style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
                >
                    <Scene openInspect={setInspect} requestMove={setMoveReq} files={files} poofs={poofs} onPoofDone={removePoof}/>
                    <PlayerMover move={moveReq} onArrive={() => setMoveReq(null)} qGoalRef={qGoalRef} />
                    <MouseZoom enabled={moveReq === null} mode="fov" />
                    <FreeLookControls enabled={moveReq === null} qGoalRef={qGoalRef} />
                    <PixelateNearestFX size={roomPixelSize} />
                </Canvas>
            </div>

            <ObjectInspectOverlay
                open={!!inspect}
                state={inspect}
                onClose={() => setInspect(null)}
                pixelSize={defaultInspectPixelSize}
                onAction={(action, state) => {
                    if (action !== 'secret-open') return
                    const meta = (state as any)?.metadata ?? {}
                    const { id, notif, persistAfterOpen, worldPos } = meta

                    notify(notif ?? 'Secret file opened — new puzzle available.', { ttlMs: 10000 })

                    if (viewTimerRef.current) clearTimeout(viewTimerRef.current)
                    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)

                    if (!persistAfterOpen && id) {
                        viewTimerRef.current = setTimeout(() => {
                            setInspect(null)
                            deleteTimerRef.current = setTimeout(() => {
                                removeFile(id)
                                if (worldPos) spawnPoof(worldPos)
                            }, OVERLAY_CLOSE_ANIM_MS)
                        }, SECRETFILE_VIEW_BEFORE_CLOSE_MS)
                    }
                }}
            />
        </div>
    )
}