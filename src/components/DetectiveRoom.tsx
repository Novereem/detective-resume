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
import {
    corkBoardMaterials,
    deskMaterials,
    metalCabinetMaterials, metalDeskTopMaterials, metalDrawerMaterials,
    mugMaterials, secretFileMaterials
} from "@/components/Materials/detectiveRoomMats"
import {CorkBoard} from "@/components/Models/CorkBoard";
import {Pin} from "@/components/Models/Pin";
import {LightBulb} from "@/components/Models/LightBulb";
import {MetalCabinet} from "@/components/Models/MetalCabinet";
import {MetalDeskTop} from "@/components/Models/MetalDeskTop";
import {MetalDrawer} from "@/components/Models/MetalDrawer";
import {MetalDesk} from "@/components/Models/MetalDesk";
import {SecretFile} from "@/components/Models/SecretFile";

type Vec3 = [number, number, number]

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
    camera: Vec3
    lookAt: Vec3
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

type ZoomMode = 'fov' | 'dolly'

function MouseZoom({
                       enabled = true,
                       mode: modeProp = 'fov',
                       fovMin = 50,
                       fovMax = 100,
                       fovSpeed = 0.04,
                       dollySpeed = 0.002
                   }: {
    enabled?: boolean
    mode?: ZoomMode
    fovMin?: number
    fovMax?: number
    fovSpeed?: number
    dollySpeed?: number
}) {
    const { camera, gl } = useThree()
    const mode = modeProp

    React.useEffect(() => {
        const el = gl.domElement
        const onWheel = (e: WheelEvent) => {
            if (!enabled) return
            e.preventDefault()

            if (mode === 'fov') {
                const persp = camera as THREE.PerspectiveCamera
                persp.fov = THREE.MathUtils.clamp(persp.fov + e.deltaY * fovSpeed, fovMin, fovMax)
                persp.updateProjectionMatrix()
            } else {
                const dir = new THREE.Vector3()
                camera.getWorldDirection(dir)
                camera.position.addScaledVector(dir, e.deltaY * dollySpeed)
            }
        }

        el.addEventListener('wheel', onWheel, { passive: false })
        return () => el.removeEventListener('wheel', onWheel as any)
    }, [enabled, mode, fovMin, fovMax, fovSpeed, dollySpeed, gl, camera])

    return null
}

function Scene({
                   openInspect,
                   requestMove,
               }: {
    openInspect: (s: InspectState) => void
    requestMove: (req: MoveRequest) => void
}) {
    const { scene, camera } = useThree()

    const openInspectSecret = React.useCallback(
        (p: InspectState) => openInspect({ ...(p as any), metadata: { type: 'secretfile' } }),
        [openInspect]
    )

    scene.background = new THREE.Color('#3c3c3c')

    type Vec3 = [number, number, number]
    type V3Like =
        | Vec3
        | THREE.Vector3
        | ((ctx: {
        event: any
        object?: THREE.Object3D
        camera: THREE.PerspectiveCamera
        target: THREE.Vector3
        currentEye: THREE.Vector3
    }) => Vec3 | THREE.Vector3)

    type FocusOpts = {
        eye?: V3Like
        lookAt?: V3Like

        distance?: number
        minDist?: number
        maxDist?: number
        keepHeight?: boolean
        fit?: boolean
        usePoint?: boolean

        bounds?: { min: Vec3; max: Vec3 }
    }

    const rcFocus = (opts: FocusOpts = {}) => {
        const {
            eye,
            lookAt,
            distance,
            minDist = 0.8,
            maxDist = 3.5,
            keepHeight = true,
            fit = true,
            usePoint = true,
            bounds,
        } = opts

        const toV3 = (v: Vec3 | THREE.Vector3) =>
            Array.isArray(v) ? new THREE.Vector3(v[0], v[1], v[2]) : v.clone?.() ?? new THREE.Vector3()

        const resolve = (
            v: V3Like | undefined,
            ctx: {
                event: any
                object?: THREE.Object3D
                camera: THREE.PerspectiveCamera
                target: THREE.Vector3
                currentEye: THREE.Vector3
            }
        ) => {
            if (!v) return undefined
            if (typeof v === 'function') return toV3(v(ctx) as any)
            return toV3(v as any)
        }

        return (e: any) => {
            e?.nativeEvent?.preventDefault?.()
            e?.stopPropagation?.()

            const cam = camera as THREE.PerspectiveCamera
            const camPos = cam.position.clone()

            const target = new THREE.Vector3()
            if (usePoint && e?.point) {
                target.copy(e.point)
            } else if (e?.object) {
                const obj: THREE.Object3D = e.object
                obj.updateWorldMatrix(true, true)
                const box = new THREE.Box3().setFromObject(obj)
                if (!box.isEmpty()) box.getCenter(target)
                else obj.getWorldPosition(target)
            }

            const currDist = camPos.distanceTo(target)
            let d = distance ?? THREE.MathUtils.clamp(currDist, minDist, maxDist)

            if (fit && e?.object) {
                const box = new THREE.Box3().setFromObject(e.object)
                const size = new THREE.Vector3()
                box.getSize(size)
                const largest = Math.max(size.x, size.y, size.z)
                const fovRad = THREE.MathUtils.degToRad(cam.fov)
                const fitDist = (largest / 2) / Math.tan(fovRad / 2)
                d = Math.max(d, Math.min(fitDist * 1.15, maxDist))
            }

            let dir = camPos.clone().sub(target)
            if (dir.lengthSq() < 1e-6) cam.getWorldDirection(dir).multiplyScalar(-1)
            else dir.normalize()

            const smartEye = target.clone().addScaledVector(dir, d)
            if (keepHeight) smartEye.y = camPos.y

            const ctx = { event: e, object: e?.object, camera: cam, target, currentEye: camPos }
            let finalEye = resolve(eye, ctx) ?? smartEye
            let finalLook = resolve(lookAt, ctx) ?? target

            if (bounds) {
                const vmin = new THREE.Vector3(...bounds.min)
                const vmax = new THREE.Vector3(...bounds.max)
                finalEye.clamp(vmin, vmax)
            }

            requestMove({
                camera: finalEye.toArray() as Vec3,
                lookAt: finalLook.toArray() as Vec3,
            })
        }
    }

    const ANCHOR = {
        bulb: { eye: [ 0.6, 1.6,  3.3] as Vec3, position: [0, 2, 4.3] as Vec3 },
        desk1: { eye: [ 0.8, 1.1, 2.8] as Vec3, position: [1.6, 0, 4.3] as Vec3 },
        desk2: { eye: [ -0.5, 1.1, 2.8] as Vec3, position: [-2, 0, 3] as Vec3 },
        deskMetal: { eye: [ 0, 1.1, 2.8] as Vec3, position: [0, 0, 4.2] as Vec3 },
        corkBoard: { eye: [0, 1.3, 3.2] as Vec3, position: [0, 1.3, 4.7] as Vec3 },
        mug: { eye: [-0.2, 1.3, 3.2] as Vec3, position: [-0.2, 0.77, 4.2] as Vec3 },
        houseFrame: { eye: [0.2, 1.3, 3.6] as Vec3, position: [0.2, 1.3, 4.6] as Vec3 },
    }

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

            {/*<group onContextMenu={rcFocus(ANCHOR.deskMetal)} position={[0, 0.7, 3.4]}*/}
            {/*       rotation={[0, Math.PI/4, 0]}>*/}
            {/*    <SecretFile*/}
            {/*        onInspect={openInspect}*/}
            {/*        materialsById={secretFileMaterials}*/}
            {/*        frontOpen={Math.PI*0.25}*/}
            {/*        inspectPixelSize={1}*/}
            {/*        disableOutline={true}*/}
            {/*    />*/}
            {/*</group>*/}
            {/*<group onContextMenu={rcFocus(ANCHOR.deskMetal)} position={[0.3, 0.7, 3.4]}*/}
            {/*       rotation={[0, Math.PI/4, 0]}>*/}
            {/*    <SecretFile*/}
            {/*        onInspect={openInspect}*/}
            {/*        materialsById={secretFileMaterials}*/}
            {/*        frontOpen={Math.PI}*/}
            {/*        inspectPixelSize={1}*/}
            {/*        disableOutline={true}*/}
            {/*    />*/}
            {/*</group>*/}
            {/*<group onContextMenu={rcFocus(ANCHOR.deskMetal)} position={[-0.3, 0.7, 3.4]}*/}
            {/*       rotation={[0, Math.PI/4, 0]}>*/}
            {/*    <SecretFile*/}
            {/*        onInspect={openInspect}*/}
            {/*        materialsById={secretFileMaterials}*/}
            {/*        frontOpen={Math.PI*0.75}*/}
            {/*        inspectPixelSize={1}*/}
            {/*        disableOutline={true}*/}
            {/*    />*/}
            {/*</group>*/}

            <group onContextMenu={rcFocus(ANCHOR.deskMetal)} position={[-0.6, 0.7, 3.4]}
                   rotation={[0, Math.PI/4, 0]}>
                <SecretFile
                    onInspect={openInspectSecret}
                    materialsById={secretFileMaterials}
                    frontOpen={0}
                    inspectPixelSize={1}
                    disableOutline={true}
                />
            </group>

        </>
    )
}

export default function DetectiveRoom() {
    const [inspect, setInspect] = React.useState<InspectState | null>(null)
    const defaultInspectPixelSize = 3
    const [roomPixelSize] = React.useState(2.7)
    //const [roomPixelSize] = React.useState(1)

    const [moveReq, setMoveReq] = React.useState<MoveRequest | null>(null)
    const qGoalRef = React.useRef(new THREE.Quaternion())

    return (
        <div style={{ position: 'fixed', inset: 0 }} onContextMenu={(e) => e.preventDefault()}>
            <div style={{ position: 'absolute', inset: 0 }}>
                <Canvas
                    dpr={[1, 1.25]}
                    camera={{ position: [0, 1, 3], fov: 80, rotation: [0 ,Math.PI, 0] }}
                    gl={{
                        antialias: false, alpha: false, depth: true, stencil: false,
                        powerPreference: 'high-performance', preserveDrawingBuffer: false,
                    }}
                    style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
                >
                    <Scene openInspect={setInspect} requestMove={setMoveReq} />
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
                onSolved={({ state }) => {
                    // setInspect(null)
                }}
            />
        </div>
    )
}
