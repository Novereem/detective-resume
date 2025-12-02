'use client'
import React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useMagnifierState } from "@/components/CameraEffects/Magnifier/MagnifierStateContext"

const MAG_LENS_LOCAL = new THREE.Vector3(0.72, 0, 4.276)

/**
 * Magnifier pickup and hold controls.
 *
 * - Left-click the magnifier object (userData.pickupId === "magnifier") to pick it up.
 * - While held, positions the magnifier in front of the camera and updates the lens mask.
 * - Click again on empty space to drop it back to its saved parent/transform.
 *
 * Respects `enabled` and uses MagnifierStateContext to drive `setHeld` and `lensMaskRef`.
 */
export function MagnifierPickupControls({ enabled = true }: { enabled?: boolean }) {
    const { camera, scene, gl } = useThree()
    const { setHeld, lensMaskRef } = useMagnifierState()

    const magnifierRef = React.useRef<THREE.Object3D | null>(null)
    const holdingRef = React.useRef(false)
    const savedRef = React.useRef<{
        parent: THREE.Object3D
        position: THREE.Vector3
        quaternion: THREE.Quaternion
        scale: THREE.Vector3
    } | null>(null)

    const raycasterRef = React.useRef(new THREE.Raycaster())
    const mouseNdc = React.useRef(new THREE.Vector2())
    const clickStateRef = React.useRef<{ downPos: { x: number; y: number } | null; moved: boolean }>({
        downPos: null,
        moved: false,
    })

    const tmp = React.useMemo(
        () => ({
            camPos: new THREE.Vector3(),
            forward: new THREE.Vector3(),
            worldUp: new THREE.Vector3(0, 1, 0),
            right: new THREE.Vector3(),
            up: new THREE.Vector3(),
            targetWorld: new THREE.Vector3(),
            invParent: new THREE.Matrix4(),
            lensDir: new THREE.Vector3(),
        }),
        []
    )

    const setMouseFromEvent = React.useCallback(
        (ev: MouseEvent) => {
            const rect = gl.domElement.getBoundingClientRect()
            mouseNdc.current.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
            mouseNdc.current.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
        },
        [gl]
    )

    const findMagnifier = React.useCallback(() => {
        if (magnifierRef.current) return magnifierRef.current
        let found: THREE.Object3D | null = null
        scene.traverse((o) => {
            if (found) return
            if ((o as any).userData?.pickupId === 'magnifier') {
                found = o
            }
        })
        magnifierRef.current = found
        return found
    }, [scene])

    React.useEffect(() => {
        if (!enabled) return

        const el = gl.domElement

        const onMouseDown = (ev: MouseEvent) => {
            if (!enabled || ev.button !== 0) return

            if (holdingRef.current) {
                clickStateRef.current.downPos = { x: ev.clientX, y: ev.clientY }
                clickStateRef.current.moved = false
                return
            }

            const magnifier = findMagnifier()
            if (!magnifier) return

            setMouseFromEvent(ev)

            const raycaster = raycasterRef.current
            raycaster.setFromCamera(mouseNdc.current, camera)
            const hit = raycaster.intersectObject(magnifier, true)[0]
            if (!hit) return

            ev.preventDefault()
            ev.stopPropagation()

            const parent: THREE.Object3D = magnifier.parent ?? scene
            const pos = magnifier.position.clone()
            const quat = magnifier.quaternion.clone()
            const scl = magnifier.scale.clone()
            savedRef.current = { parent, position: pos, quaternion: quat, scale: scl }

            holdingRef.current = true
            setHeld(true)
        }

        const onMouseMove = (ev: MouseEvent) => {
            if (!enabled) return
            const state = clickStateRef.current
            if (!state.downPos) return
            const dx = ev.clientX - state.downPos.x
            const dy = ev.clientY - state.downPos.y
            if (dx * dx + dy * dy > 4) {
                state.moved = true
            }
        }

        const onMouseUp = (ev: MouseEvent) => {
            if (!enabled || ev.button !== 0) return

            const state = clickStateRef.current
            const isClick = state.downPos && !state.moved
            state.downPos = null
            state.moved = false

            if (!holdingRef.current || !magnifierRef.current || !savedRef.current) return
            if (!isClick) return

            setMouseFromEvent(ev)
            const raycaster = raycasterRef.current
            raycaster.setFromCamera(mouseNdc.current, camera)
            const hit = raycaster.intersectObject(magnifierRef.current, true)[0]
            if (hit) return

            const obj = magnifierRef.current
            const { parent, position, quaternion, scale } = savedRef.current

            if (obj.parent !== parent) {
                parent.add(obj)
            }

            obj.position.copy(position)
            obj.quaternion.copy(quaternion)
            obj.scale.copy(scale)

            holdingRef.current = false
            setHeld(false)
            lensMaskRef.current.active = false
        }

        el.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)

        return () => {
            el.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [camera, gl, enabled, findMagnifier, setMouseFromEvent, scene, setHeld, lensMaskRef])

    React.useEffect(() => {
        return () => {
            setHeld(false)
            lensMaskRef.current.active = false
        }
    }, [setHeld, lensMaskRef])

    useFrame(() => {
        const mask = lensMaskRef.current

        if (!holdingRef.current) {
            mask.active = false
            return
        }

        const obj = magnifierRef.current
        const saved = savedRef.current
        if (!obj || !saved) {
            mask.active = false
            return
        }

        const {
            camPos,
            forward,
            worldUp,
            right,
            up,
            targetWorld,
            invParent,
            lensDir,
        } = tmp

        camPos.copy(camera.position)

        camera.getWorldDirection(forward)
        forward.normalize()

        right.crossVectors(forward, worldUp).normalize()
        up.crossVectors(right, forward).normalize()

        const MAG_DIST = 0.875
        const MAG_OFFSET_RIGHT = -0.713
        const MAG_OFFSET_UP = 4.25

        const MAG_Q_OFFSET = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(Math.PI + Math.PI / 2, Math.PI, Math.PI)
        )

        targetWorld
            .copy(camPos)
            .addScaledVector(forward, MAG_DIST)
            .addScaledVector(right, MAG_OFFSET_RIGHT)
            .addScaledVector(up, MAG_OFFSET_UP)

        const parent = saved.parent
        parent.updateMatrixWorld()
        invParent.copy(parent.matrixWorld).invert()
        const targetLocal = targetWorld.clone().applyMatrix4(invParent)

        if (obj.parent !== parent) {
            parent.add(obj)
        }

        obj.position.copy(targetLocal)
        obj.quaternion.copy(camera.quaternion).multiply(MAG_Q_OFFSET)

        const lensWorld = obj.localToWorld(MAG_LENS_LOCAL.clone())

        lensDir.copy(lensWorld).sub(camPos).normalize()
        const lensNdc = lensWorld.clone().project(camera)

        mask.active = true
        mask.origin = [lensNdc.x, lensNdc.y, 0]
        mask.dir = [lensDir.x, lensDir.y, lensDir.z]
        mask.radius = 0.47
    })

    return null
}