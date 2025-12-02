'use client'
import React from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import type { FocusOpts, MoveRequest, V3Like, Vec3 } from '@/components/Types/room'

type ZoomMode = 'fov' | 'dolly'

/**
 * Mouse wheel zoom control.
 *
 * - Listens for wheel events on the R3F canvas.
 * - In "fov" mode, zooms by changing the PerspectiveCamera FOV within limits.
 * - In "dolly" mode, zooms by moving the camera forward/backward.
 *
 * Does nothing when `enabled` is false.
 */
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

/**
 * Computes a camera + lookAt target for right-click focus.
 *
 * - Focuses the clicked point or object center.
 * - Clamps distance using min/max and optional "fit to object".
 * - Optionally keeps camera height and clamps the final eye position to bounds.
 *
 * The returned handler only computes targets; the caller animates the camera.
 */
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
                } else {
                    // Bail out so the camera doesn't move toward an arbitrary default.
                    return
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
                const finalEye = resolve(eye, ctx) ?? smartEye
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