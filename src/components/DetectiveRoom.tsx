'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'
import { FramedPlane } from "@/shaders/FramedPlane"
import { Outlined } from "@/shaders/OutlinedMesh"
import ObjectInspectOverlay from "@/components/ObjectInspectOverlay"
import { InspectState } from '@/shaders/inspectTypes'
import { PixelateNearestFX } from "@/shaders/PixelateNearestFX"
import { Desk } from '@/components/Models/Desk'
import { Mug } from "@/components/Models/Mug"
import {corkBoardMaterials, deskMaterials, mugMaterials} from "@/components/Materials/detectiveRoomMats"
import {CorkBoard} from "@/components/Models/CorkBoard";
import {Pin} from "@/components/Models/Pin";

type V3 = [number, number, number]

/** Free-look controls (drag LMB to look), driven by a shared quaternion goal */
function FreeLookControls({
                              enabled = true,
                              lookSensitivity = 0.0022,
                              orientDamping = 10,
                              qGoalRef,
                          }: {
    enabled?: boolean
    lookSensitivity?: number
    orientDamping?: number
    qGoalRef: React.RefObject<THREE.Quaternion>
}) {
    const { camera, gl } = useThree()
    const dragging = React.useRef(false)
    const yaw = React.useRef(0)
    const pitch = React.useRef(0)
    const euler = React.useRef(new THREE.Euler(0, 0, 0, 'YXZ'))

    // init goal = current camera orientation
    React.useEffect(() => {
        qGoalRef.current.copy(camera.quaternion)
        const e = new THREE.Euler().setFromQuaternion(qGoalRef.current, 'YXZ')
        pitch.current = e.x
        yaw.current = e.y
        gl.domElement.style.cursor = 'grab'
        return () => { gl.domElement.style.cursor = '' }
    }, [])

    React.useEffect(() => {
        const el = gl.domElement

        const onDown = (ev: MouseEvent) => {
            if (!enabled || ev.button !== 0) return
            dragging.current = true
            el.style.cursor = 'grabbing'
            const e = new THREE.Euler().setFromQuaternion(qGoalRef.current, 'YXZ')
            pitch.current = e.x
            yaw.current = e.y
        }

        const onMove = (ev: MouseEvent) => {
            if (!enabled || !dragging.current) return
            yaw.current  -= ev.movementX * lookSensitivity
            pitch.current -= ev.movementY * lookSensitivity
            const max = Math.PI / 2 - 0.05
            const min = -max
            pitch.current = Math.min(max, Math.max(min, pitch.current))
            euler.current.set(pitch.current, yaw.current, 0)
            qGoalRef.current.setFromEuler(euler.current)
        }

        const onUp = () => {
            if (!enabled) return
            dragging.current = false
            el.style.cursor = 'grab'
        }

        el.addEventListener('mousedown', onDown)
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            el.removeEventListener('mousedown', onDown)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [enabled, lookSensitivity, gl])

    useFrame((_, dt) => {
        const t = 1 - Math.exp(-orientDamping * dt)
        camera.quaternion.slerp(qGoalRef.current, t)
    })

    return null
}

type MoveRequest = {
    camera: V3
    lookAt: V3
}

function PlayerMover({
                         move,
                         onArrive,
                         qGoalRef,
                         moveDamping = 4,
                     }: {
    move: { camera: [number, number, number], lookAt: [number, number, number] } | null
    onArrive?: () => void
    qGoalRef: React.RefObject<THREE.Quaternion>
    moveDamping?: number
}) {
    const { camera } = useThree()
    const camGoal = React.useRef(new THREE.Vector3())
    const active = React.useRef(false)

    React.useEffect(() => {
        if (!move) return
        const cam = new THREE.Vector3().fromArray(move.camera)
        const tgt = new THREE.Vector3().fromArray(move.lookAt)

        camGoal.current.copy(cam)

        // orientation goal = look from cam -> tgt
        const m = new THREE.Matrix4().lookAt(cam, tgt, new THREE.Vector3(0, 1, 0))
        qGoalRef.current.setFromRotationMatrix(m)

        active.current = true
    }, [move])

    useFrame((_, dt) => {
        if (!active.current) return
        const λ = moveDamping

        camera.position.x = THREE.MathUtils.damp(camera.position.x, camGoal.current.x, λ, dt)
        camera.position.y = THREE.MathUtils.damp(camera.position.y, camGoal.current.y, λ, dt)
        camera.position.z = THREE.MathUtils.damp(camera.position.z, camGoal.current.z, λ, dt)

        const posOk = camera.position.distanceTo(camGoal.current) < 0.02
        const dot = THREE.MathUtils.clamp(camera.quaternion.dot(qGoalRef.current), -1, 1)
        const ang = 2 * Math.acos(Math.abs(dot))
        const oriOk = ang < THREE.MathUtils.degToRad(1.0)

        if (posOk && oriOk) {
            active.current = false
            onArrive?.()
        }
    })

    return null
}

function Scene({
                   openInspect,
                   requestMove,
               }: {
    openInspect: (s: InspectState) => void
    requestMove: (req: MoveRequest) => void
}) {
    const { scene } = useThree()
    scene.background = new THREE.Color('#3c3c3c')


    const rcGo = (camera: V3, lookAt: V3) => (e: any) => {
        e?.nativeEvent?.preventDefault?.()
        e?.stopPropagation?.()
        requestMove({ camera, lookAt })
    }

    const rcGoAt = (lookAt: V3, offset: V3) => rcGo(
        [lookAt[0] + offset[0], lookAt[1] + offset[1], lookAt[2] + offset[2]],
        lookAt
    )

    // universal offset
    const DEFAULT_OFFSET: V3 = [0, 0.75, 2.2]

    return (
        <>
            {/* lights */}
            <ambientLight intensity={2}/>
            <directionalLight position={[2, 5, 7]}/>

            {/* floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
                <FramedPlane
                    width={10}
                    height={10}
                    color="#000"
                    borderColor="#fff"
                    hoverColor="#ff3b30"
                    canInteract={false}
                    border={0.06}
                    textureUrl="/textures/light_concrete.jpg"
                    textureFit="stretch"
                />
            </mesh>

            <mesh raycast={() => null} position={[10, 0, 0]}>
                <planeGeometry args={[10, 10]}/>
                <meshStandardMaterial color="#333" side={THREE.DoubleSide}/>
            </mesh>

            <group onContextMenu={rcGoAt([-3, 1, -2], DEFAULT_OFFSET)}>
                <Outlined
                    geometry={<boxGeometry args={[1, 1, 1]}/>}
                    rotation={[0.5, 0, 0]}
                    color="#000"
                    outlineColor="#fff"
                    hoverColor="#ff3b30"
                    outlineScale={1.04}
                    position={[-3, 1, -2]}
                    onInspect={openInspect}
                />
            </group>

            <group onContextMenu={rcGoAt([3, 1, -2], DEFAULT_OFFSET)}>
                <Outlined
                    geometry={<torusKnotGeometry args={[0.55, 0.18, 128, 16]}/>}
                    color="#000"
                    outlineColor="#fff"
                    hoverColor="#ff3b30"
                    outlineScale={1.04}
                    position={[3, 1, -2]}
                    onInspect={openInspect}
                />
            </group>

            <group rotation={[0, 0, 0.2]} position={[0, 2, 0]}
                   onContextMenu={rcGoAt([0, 2, 0], DEFAULT_OFFSET)}>
                <FramedPlane
                    width={1}
                    height={1}
                    color="#000"
                    borderColor="#fff"
                    hoverColor="#ff3b30"
                    border={0.035}
                    canInteract
                    onInspect={(p) =>
                        openInspect({
                            ...p,
                            puzzle: {
                                type: 'text',
                                id: 'frame-code',
                                prompt: 'What is the hidden word on the photo?',
                                answers: ['house', /house\s*md/i],
                                normalize: 'trim-lower',
                                feedback: {correct: 'Nice find!', incorrect: 'Not quite—look closer.'},
                            },
                        })
                    }
                    inspectOverrides={{pixelSize: 1}}
                    textureUrl="/textures/testimage.jpg"
                    textureFit="stretch"
                />
            </group>

            <group onContextMenu={rcGo([0.8, 1.1, -1.2], [0.5, 0.75, -2.4])}>
                <Desk
                    position={[0, 0, -3]}
                    rotation={[0, Math.PI / 6, 0]}
                    color="#fff"
                    outlineScale={6.56}
                    outlinePerPart={{topScale: 1.04, legScale: 1.1}}
                    onInspect={openInspect as any}
                    inspectPixelSize={1}
                    materialsById={deskMaterials}
                />
            </group>

            <group onContextMenu={rcGo([0, 1.5, -4.7], [0, 1.2, -2])}>
                <CorkBoard
                    position={[0, 1.2, -2]}
                    rotation={[0, 0.1, 0]}
                    onInspect={openInspect}
                    color="#fff"
                    materialsById={corkBoardMaterials}
                    inspectDistance={1}
                    inspectPixelSize={3}
                />
            </group>

            <group onContextMenu={rcGo([0, 1.5, -4.7], [0, 1.2, -2.2])}>
                <Pin
                    position={[0, 1.45, -4.4]}
                    rotation={[0, 0.1, 0]}
                    onInspect={openInspect}
                    materialsById={corkBoardMaterials}
                    inspectDistance={0.2}
                    inspectPixelSize={3}
                    disableOutline={true}
                    inspectDisableOutline={true}
                />
            </group>

            <group onContextMenu={rcGo([0.2, 1.05, -4.7], [0.15, 0.77, -2.85])}>
                <Mug
                    position={[0, 0.77, -3]}
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
                                prompt: 'Whose initials are on the mug?',
                                answers: ['NO', /N\.?\s*O\.?/i],
                                normalize: 'trim-lower',
                                feedback: {correct: 'Correct!', incorrect: 'Check the engraving.'},
                            },
                        })
                    }
                    inspectPixelSize={3}
                    materialsById={mugMaterials}
                />
            </group>

        </>
    )
}

export default function DetectiveRoom() {
    const [inspect, setInspect] = React.useState<InspectState | null>(null)
    const defaultInspectPixelSize = 3
    const [roomPixelSize] = React.useState(2.7)

    // deterministic movement/orientation
    const [moveReq, setMoveReq] = React.useState<MoveRequest | null>(null)
    const qGoalRef = React.useRef(new THREE.Quaternion())

    return (
        <div style={{ position: 'fixed', inset: 0 }} onContextMenu={(e) => e.preventDefault()}>
            <div style={{ position: 'absolute', inset: 0 }}>
                <Canvas
                    dpr={[1, 1.25]}
                    camera={{ position: [0, 2, -5], fov: 100 }}
                    gl={{
                        antialias: false, alpha: false, depth: true, stencil: false,
                        powerPreference: 'high-performance', preserveDrawingBuffer: false,
                    }}
                    style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
                >
                    <Scene openInspect={setInspect} requestMove={setMoveReq} />
                    <PlayerMover move={moveReq} onArrive={() => setMoveReq(null)} qGoalRef={qGoalRef} />
                    <FreeLookControls enabled={moveReq === null} qGoalRef={qGoalRef} />
                    <PixelateNearestFX size={roomPixelSize} />
                </Canvas>
            </div>

            <ObjectInspectOverlay
                open={!!inspect}
                state={inspect}
                onClose={() => setInspect(null)}
                pixelSize={defaultInspectPixelSize}
                onSolved={({ state }) => {
                    // setInspect(null)
                }}
            />
        </div>
    )
}
