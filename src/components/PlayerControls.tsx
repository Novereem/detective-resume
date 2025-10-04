'use client'
import React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type {FocusOpts, MoveRequest, V3Like, Vec3} from '@/components/Types/room'

export function FreeLookControls({
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

export function PlayerMover({
                                move,
                                onArrive,
                                qGoalRef,
                                moveDamping = 4,
                            }: {
    move: MoveRequest | null
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
export function MouseZoom({
                              enabled = true,
                              mode: modeProp = 'fov',
                              fovMin = 50,
                              fovMax = 100,
                              fovSpeed = 0.04,
                              dollySpeed = 0.002,
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

export function useRightClickFocus(requestMove: (req: MoveRequest) => void) {
    const { camera } = useThree()

    const toV3 = React.useCallback((v: Vec3 | THREE.Vector3) => {
        return Array.isArray(v) ? new THREE.Vector3(v[0], v[1], v[2]) : v.clone?.() ?? new THREE.Vector3()
    }, [])

    const resolve = React.useCallback(
        (v: V3Like | undefined, ctx: {
            event: any
            object?: THREE.Object3D
            camera: THREE.PerspectiveCamera
            target: THREE.Vector3
            currentEye: THREE.Vector3
        }) => {
            if (!v) return undefined
            if (typeof v === 'function') return toV3(v(ctx) as any)
            return toV3(v as any)
        },
        [toV3]
    )

    return React.useCallback(
        (opts: FocusOpts = {}) => {
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
                const finalEye  = resolve(eye, ctx)    ?? smartEye
                const finalLook = resolve(lookAt, ctx) ?? target

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
        },
        [camera, resolve, requestMove]
    )
}