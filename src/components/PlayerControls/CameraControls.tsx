'use client'
import React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { MoveRequest, Vec3 } from '@/components/Types/room'

/**
 * Mouse drag look control for the main camera.
 *
 * - Left-drag to adjust yaw/pitch stored in `qGoalRef`.
 * - Smoothly interpolates the camera quaternion towards `qGoalRef` each frame.
 * - Updates the canvas cursor to show grab/grabbing while interacting.
 *
 * Respects `enabled` to disable interaction and cursor hints.
 */
export function FreeLookControls({
                                     enabled = true,
                                     lookSensitivity = 0.0022,
                                     orientDamping = 10,
                                     qGoalRef,
                                 }: {
    enabled?: boolean
    lookSensitivity?: number
    orientDamping?: number
    qGoalRef: React.RefObject<THREE.Quaternion | null>
}) {
    const { camera, gl } = useThree()
    const dragging = React.useRef(false)
    const yaw = React.useRef(0)
    const pitch = React.useRef(0)
    const euler = React.useRef(new THREE.Euler(0, 0, 0, 'YXZ'))

    React.useEffect(() => {
        if (!qGoalRef.current) return
        qGoalRef.current.copy(camera.quaternion)
        const e = new THREE.Euler().setFromQuaternion(qGoalRef.current, 'YXZ')
        pitch.current = e.x
        yaw.current = e.y
        gl.domElement.style.cursor = 'grab'
        return () => { gl.domElement.style.cursor = '' }
    }, [camera.quaternion, gl.domElement, qGoalRef])

    React.useEffect(() => {
        dragging.current = false
        gl.domElement.style.cursor = enabled ? 'grab' : ''
    }, [enabled, gl.domElement])

    React.useEffect(() => {
        const el = gl.domElement
        const onDown = (ev: MouseEvent) => {
            if (!enabled || ev.button !== 0) return
            dragging.current = true
            el.style.cursor = 'grabbing'
            if (!qGoalRef.current) return
            const e = new THREE.Euler().setFromQuaternion(qGoalRef.current, 'YXZ')
            pitch.current = e.x
            yaw.current = e.y
        }
        const onMove = (ev: MouseEvent) => {
            if (!enabled || !dragging.current || !qGoalRef.current) return
            yaw.current += ev.movementX * lookSensitivity
            pitch.current += ev.movementY * lookSensitivity
            const max = Math.PI / 2 - 0.05
            const min = -max
            pitch.current = Math.min(max, Math.max(min, pitch.current))
            euler.current.set(pitch.current, yaw.current, 0)
            qGoalRef.current.setFromEuler(euler.current)
        }
        const onUp = () => {
            dragging.current = false
            el.style.cursor = enabled ? 'grab' : ''
        }

        el.addEventListener('mousedown', onDown)
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            el.removeEventListener('mousedown', onDown)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [enabled, lookSensitivity, gl, qGoalRef])

    useFrame((_, dt) => {
        if (!qGoalRef.current) return
        const t = 1 - Math.exp(-orientDamping * dt)
        camera.quaternion.slerp(qGoalRef.current, t)
    })

    return null
}

/**
 * Smooth camera mover toward a requested pose.
 *
 * - When `move` is set, computes a target position and orientation from `move.camera` / `move.lookAt`.
 * - Each frame, damps the camera position toward the target.
 * - Uses `qGoalRef` for the target orientation and calls `onArrive` once when position and orientation are close enough.
 */
export function PlayerMover({
                                move,
                                onArrive,
                                qGoalRef,
                                moveDamping = 4,
                            }: {
    move: MoveRequest | null
    onArrive?: () => void
    qGoalRef: React.RefObject<THREE.Quaternion | null>
    moveDamping?: number
}) {
    const { camera } = useThree()
    const camGoal = React.useRef(new THREE.Vector3())
    const active = React.useRef(false)

    React.useEffect(() => {
        if (!move || !qGoalRef.current) return

        const cam = new THREE.Vector3().fromArray(move.camera)
        const tgt = new THREE.Vector3().fromArray(move.lookAt)

        camGoal.current.copy(cam)

        const m = new THREE.Matrix4().lookAt(cam, tgt, new THREE.Vector3(0, 1, 0))
        qGoalRef.current.setFromRotationMatrix(m)

        active.current = true
    }, [move, qGoalRef])

    useFrame((_, dt) => {
        if (!active.current || !qGoalRef.current) return

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

/**
 * Bridges the active camera pose into plain Vec3 refs.
 *
 * - Each frame writes the camera position into `posRef`.
 * - Derives a simple look-at point from the camera forward direction into `lookAtRef`.
 *
 * Useful for exposing the current camera pose to non-Three code.
 */
export function CameraPoseBridge({
                                     posRef,
                                     lookAtRef,
                                 }: {
    posRef: React.MutableRefObject<Vec3>
    lookAtRef: React.MutableRefObject<Vec3>
}) {
    const { camera } = useThree()
    const tmp = React.useMemo(() => ({
        dir: new THREE.Vector3(),
        look: new THREE.Vector3(),
    }), [])

    useFrame(() => {
        posRef.current = [camera.position.x, camera.position.y, camera.position.z]
        camera.getWorldDirection(tmp.dir)
        tmp.look.copy(camera.position).add(tmp.dir)
        lookAtRef.current = [tmp.look.x, tmp.look.y, tmp.look.z]
    })
    return null
}