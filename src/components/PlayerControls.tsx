'use client'
import React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type {FocusOpts, MoveRequest, V3Like, Vec3} from '@/components/Types/room'
import {ANCHOR} from "@/components/Game/anchors";

type DevObjectMoveProps = {
    enabled?: boolean
    onBusyChange?: (busy: boolean) => void
    snap?: number | null
}


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
        dragging.current = false
        gl.domElement.style.cursor = enabled ? 'grab' : ''
    }, [enabled, gl.domElement])

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

export function requestZoomPeek(
    setMoveReq: (req: MoveRequest) => void,
    to: MoveRequest,
    back: MoveRequest,
    ms = 200
) {
    setMoveReq(to)
    setTimeout(() => setMoveReq(back), ms)
}

export function DevFlyMove({
                               enabled = true,
                               speed = 2.2,
                               verticalSpeed = 2.2,
                               smoothing = 0,
                           }: {
    enabled?: boolean
    speed?: number
    verticalSpeed?: number
    smoothing?: number
}) {
    const { camera } = useThree()
    const keys = React.useRef({
        w:false,a:false,s:false,d:false, space:false, shift:false
    })
    const vel = React.useRef(new THREE.Vector3())

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (!enabled) return
            switch (e.code) {
                case 'KeyW': keys.current.w = true; break
                case 'KeyA': keys.current.a = true; break
                case 'KeyS': keys.current.s = true; break
                case 'KeyD': keys.current.d = true; break
                case 'Space': keys.current.space = true; e.preventDefault(); break
                case 'ShiftLeft':
                case 'ShiftRight': keys.current.shift = true; e.preventDefault(); break
            }
        }
        const up = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW': keys.current.w = false; break
                case 'KeyA': keys.current.a = false; break
                case 'KeyS': keys.current.s = false; break
                case 'KeyD': keys.current.d = false; break
                case 'Space': keys.current.space = false; break
                case 'ShiftLeft':
                case 'ShiftRight': keys.current.shift = false; break
            }
        }
        window.addEventListener('keydown', down, { passive: false })
        window.addEventListener('keyup', up)
        return () => {
            window.removeEventListener('keydown', down as any)
            window.removeEventListener('keyup', up as any)
        }
    }, [enabled])

    useFrame((_, dt) => {
        if (!enabled) return

        const fwd = new THREE.Vector3()
        camera.getWorldDirection(fwd)
        fwd.y = 0; fwd.normalize()

        const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0,1,0)).negate().normalize()
        const up = new THREE.Vector3(0,1,0)

        const v = new THREE.Vector3()
        if (keys.current.w) v.add(fwd)
        if (keys.current.s) v.sub(fwd)
        if (keys.current.a) v.add(right)
        if (keys.current.d) v.sub(right)
        v.normalize().multiplyScalar(speed)

        if (keys.current.space) v.addScaledVector(up, verticalSpeed)
        if (keys.current.shift) v.addScaledVector(up, -verticalSpeed)

        if (smoothing > 0) {
            const t = 1 - Math.exp(-smoothing * dt)
            vel.current.lerp(v, t)
            camera.position.addScaledVector(vel.current, dt)
        } else {
            camera.position.addScaledVector(v, dt)
        }
    })

    return null
}

export function DevObjectMove({ enabled = false, onBusyChange, snap = null }: DevObjectMoveProps) {
    const { scene, camera, gl } = useThree()
    const raycaster = React.useRef(new THREE.Raycaster())
    const mouseNdc = React.useRef(new THREE.Vector2())
    const selected = React.useRef<THREE.Object3D | null>(null)
    type AnchorKey = keyof typeof ANCHOR
    const selectedAnchorKey = React.useRef<AnchorKey | null>(null)

    const baseAnchorMat = React.useRef(new THREE.Matrix4())
    const selectionStartWorldMat = React.useRef(new THREE.Matrix4())
    const startWorldMat = React.useRef(new THREE.Matrix4())
    const endWorldMat   = React.useRef(new THREE.Matrix4())

    const boxHelper = React.useRef<THREE.Box3Helper | null>(null)
    const gizmo = React.useRef<THREE.Group | null>(null)
    const transG = React.useRef<THREE.Group | null>(null)
    const rotG = React.useRef<THREE.Group | null>(null)

    const mode = React.useRef<'translate' | 'rotate'>('translate')
    const picking = React.useRef(false)
    const dragAxis = React.useRef<'x'|'y'|'z'|null>(null)

    const tmpPlane = React.useRef(new THREE.Plane())
    const tmpIsect = React.useRef(new THREE.Vector3())
    const tmpAxisW = React.useRef(new THREE.Vector3())
    const tmpQ = React.useRef(new THREE.Quaternion())
    const tmpM = React.useRef(new THREE.Matrix4())
    const tmpM2 = React.useRef(new THREE.Matrix4())

    const dragStartPtW = React.useRef(new THREE.Vector3())
    const startWorldPos = React.useRef(new THREE.Vector3())
    const parentWorldInv = React.useRef(new THREE.Matrix4())
    const pivotWorld = React.useRef(new THREE.Vector3())
    const dragStartVec = React.useRef(new THREE.Vector3())

    // Axis-line state (pivot at gizmo center)
    const axisOriginW = React.useRef(new THREE.Vector3())
    const uStart = React.useRef(0)

    const setBusy = React.useCallback((v: boolean) => onBusyChange?.(v), [onBusyChange])
    const EPS = 1e-3
    const snapPi = (rad: number) => {
        const step = Math.PI / 2
        const s = Math.round(rad / step) * step
        return Math.abs(rad - s) < 0.02 ? s : rad
    }
    const fmtRad = (rad: number) => {
        const r = snapPi(rad), n = Math.abs(r)
        if (n < EPS) return '0'
        if (Math.abs(n - Math.PI) < EPS) return (r < 0 ? '-' : '') + 'Math.PI'
        if (Math.abs(n - Math.PI/2) < EPS) return (r < 0 ? '-' : '') + 'Math.PI/2'
        return r.toFixed(3)
    }

    const movableRoots = React.useCallback((): THREE.Object3D[] => {
        const out: THREE.Object3D[] = []
        scene.traverse(o => { if ((o as any).userData?.movable && (o as any).userData?.anchorKey) out.push(o) })
        return out
    }, [scene])

    const toTopMovable = (o: THREE.Object3D | null) => {
        let p: THREE.Object3D | null = o
        while (p && !(p as any).userData?.movable) p = p.parent
        return p && (p as any).userData?.movable ? p : null
    }

    const ensureBoxHelper = () => {
        if (!boxHelper.current) {
            const b = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(1,1,1))
            boxHelper.current = new THREE.Box3Helper(b, 0x00ffff)
            boxHelper.current.visible = false
            scene.add(boxHelper.current)
        }
    }
    const updateBoxFor = (obj: THREE.Object3D | null) => {
        ensureBoxHelper()
        if (!boxHelper.current) return
        if (!obj) { boxHelper.current.visible = false; return }
        const box = new THREE.Box3().setFromObject(obj)
        boxHelper.current.box.copy(box)
        boxHelper.current.visible = true
    }

    const updateGizmoVisibility = () => {
        if (!gizmo.current) return
        gizmo.current.visible = !!selected.current
        if (transG.current) transG.current.visible = mode.current === 'translate'
        if (rotG.current)   rotG.current.visible   = mode.current === 'rotate'
    }
    const ensureGizmo = () => {
        if (gizmo.current) return
        const g = new THREE.Group(); g.name = '__gizmo'
        const makeAxis = (axis: 'x'|'y'|'z', color: number) => {
            const grp = new THREE.Group(); grp.name = `axis-${axis}`
            const len = 0.45, r = 0.008, coneR = 0.018, coneH = 0.06
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len-0.06, 12), new THREE.MeshBasicMaterial({ color }))
            rod.position.y = (len-0.06)/2
            const tip = new THREE.Mesh(new THREE.ConeGeometry(coneR, coneH, 16), new THREE.MeshBasicMaterial({ color }))
            tip.position.y = len-0.06 + coneH/2
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len + coneH, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
            col.position.y = (len + coneH) / 2
            col.name = `axis-col-${axis}`; (col as any).userData.axis = axis; (col as any).userData.kind = 'translate'
            if (axis === 'x') grp.rotation.z = Math.PI/2
            if (axis === 'z') grp.rotation.x = -Math.PI/2
            grp.add(rod, tip, col)
            return grp
        }
        const gTrans = new THREE.Group()
        gTrans.add(makeAxis('x', 0xff4444))
        gTrans.add(makeAxis('y', 0x44ff44))
        gTrans.add(makeAxis('z', 0x4488ff))

        const makeRing = (axis: 'x'|'y'|'z', color: number) => {
            const grp = new THREE.Group(); grp.name = `ring-${axis}`
            const R = 0.32, tube = 0.008
            const vis = new THREE.Mesh(new THREE.TorusGeometry(R, tube, 16, 64), new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.9 }))
            const pick = new THREE.Mesh(new THREE.TorusGeometry(R, 0.06, 8, 64), new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false }))
            pick.name = `ring-col-${axis}`; (pick as any).userData.axis = axis; (pick as any).userData.kind = 'rotate'
            if (axis === 'x') grp.rotation.y = Math.PI/2
            if (axis === 'y') grp.rotation.x = Math.PI/2
            grp.add(vis, pick)
            return grp
        }
        const gRot = new THREE.Group()
        gRot.add(makeRing('x', 0xff4444))
        gRot.add(makeRing('y', 0x44ff44))
        gRot.add(makeRing('z', 0x4488ff))
        g.add(gTrans, gRot)
        gizmo.current = g; transG.current = gTrans; rotG.current = gRot
        g.visible = false; scene.add(g)
        updateGizmoVisibility()
    }
    const showGizmoAt = (obj: THREE.Object3D | null) => {
        ensureGizmo(); if (!gizmo.current) return
        if (!obj) { gizmo.current.visible = false; return }
        const box = new THREE.Box3().setFromObject(obj)
        const c = box.getCenter(new THREE.Vector3())
        gizmo.current.position.copy(c)
        updateGizmoVisibility()
    }

    const setMouse = (ev: PointerEvent | MouseEvent) => {
        const rect = gl.domElement.getBoundingClientRect()
        mouseNdc.current.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
        mouseNdc.current.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
    }
    const pick = (ev: PointerEvent | MouseEvent) => {
        raycaster.current.setFromCamera(mouseNdc.current, camera)
        if (selected.current && gizmo.current?.visible) {
            const cols: THREE.Object3D[] = []
            const want = mode.current === 'rotate' ? 'ring-col-' : 'axis-col-'
            gizmo.current.traverse(o => { if ((o as any).name?.startsWith?.(want)) cols.push(o) })
            const ig = raycaster.current.intersectObjects(cols, false)[0]
            if (ig) return ig
        }
        const hits = raycaster.current.intersectObjects(movableRoots(), true)
        return hits[0]
    }

    const axisUnit = (axis: 'x'|'y'|'z') =>
        axis === 'x' ? new THREE.Vector3(1,0,0) : axis === 'y' ? new THREE.Vector3(0,1,0) : new THREE.Vector3(0,0,1)

    // ray ↔ line (through axisOriginW in direction a, both world-space) : get scalar u along a
    const closestUToRay = (ray: THREE.Ray, p0: THREE.Vector3, a: THREE.Vector3) => {
        const ro = ray.origin, rd = ray.direction.clone().normalize()
        const A = a.clone().normalize()
        const w0 = ro.clone().sub(p0)
        const c = A.dot(rd)
        const denom = 1 - c*c
        if (Math.abs(denom) < 1e-6) {
            // fallback: plane through p0, normal as viewDir×A×A (keeps axis in-plane)
            const view = new THREE.Vector3(); camera.getWorldDirection(view)
            const n = new THREE.Vector3().crossVectors(A, view).cross(A).normalize()
            if (n.lengthSq() < 1e-6) n.set(0,1,0).cross(A).normalize()
            const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, p0)
            const hit = new THREE.Vector3()
            if (!ray.intersectPlane(plane, hit)) return 0
            return hit.sub(p0).dot(A)
        }
        return (A.dot(w0) - c * rd.dot(w0)) / denom
    }

    const startTranslate = (axis: 'x'|'y'|'z') => {
        selected.current!.updateMatrixWorld(true)
        startWorldMat.current.copy(selected.current!.matrixWorld)
        startWorldPos.current.setFromMatrixPosition(startWorldMat.current)
        parentWorldInv.current.copy(selected.current!.parent?.matrixWorld ?? tmpM2.current.identity()).invert()
        tmpAxisW.current.copy(axisUnit(axis))

        // pivot at the gizmo center (matches the visible handles)
        const pivot = gizmo.current?.position ?? selected.current!.getWorldPosition(new THREE.Vector3())
        axisOriginW.current.copy(pivot)

        raycaster.current.setFromCamera(mouseNdc.current, camera)
        uStart.current = closestUToRay(raycaster.current.ray, axisOriginW.current, tmpAxisW.current)

        const n = new THREE.Vector3(); camera.getWorldDirection(n)
        tmpPlane.current.setFromNormalAndCoplanarPoint(n, pivot)
        raycaster.current.ray.intersectPlane(tmpPlane.current, dragStartPtW.current)

        dragAxis.current = axis
        picking.current = true
        setBusy(true)
        gl.domElement.style.cursor = 'grabbing'
    }

    const startRotate = (axis: 'x'|'y'|'z') => {
        selected.current!.updateMatrixWorld(true)
        startWorldMat.current.copy(selected.current!.matrixWorld)

        const worldAxis = axisUnit(axis)
        tmpAxisW.current.copy(worldAxis)

        const center = (gizmo.current?.position ?? selected.current!.getWorldPosition(new THREE.Vector3())).clone()
        pivotWorld.current.copy(center)

        tmpPlane.current.setFromNormalAndCoplanarPoint(worldAxis, center)
        raycaster.current.setFromCamera(mouseNdc.current, camera)
        raycaster.current.ray.intersectPlane(tmpPlane.current, dragStartPtW.current)
        dragStartVec.current.copy(dragStartPtW.current).sub(center).normalize()

        dragAxis.current = axis
        picking.current = true
        setBusy(true)
        gl.domElement.style.cursor = 'grabbing'
    }

    const onMove = (ev: PointerEvent) => {
        if (!enabled) return
        setMouse(ev)

        if (picking.current && dragAxis.current && selected.current) {
            if (mode.current === 'translate') {
                raycaster.current.setFromCamera(mouseNdc.current, camera)
                const uNow = closestUToRay(raycaster.current.ray, axisOriginW.current, tmpAxisW.current)
                let du = uNow - uStart.current
                if (snap) du = Math.round(du / snap) * snap

                const newWorldPos = new THREE.Vector3().copy(startWorldPos.current).addScaledVector(tmpAxisW.current, du)
                const newLocalPos = newWorldPos.clone().applyMatrix4(parentWorldInv.current)
                selected.current.position.copy(newLocalPos)

                showGizmoAt(selected.current)
                updateBoxFor(selected.current)
                return
            } else {
                const center = pivotWorld.current
                raycaster.current.setFromCamera(mouseNdc.current, camera)
                if (!raycaster.current.ray.intersectPlane(tmpPlane.current, tmpIsect.current)) return

                const vNow = tmpIsect.current.clone().sub(center).normalize()
                const axis = tmpAxisW.current
                const cross = new THREE.Vector3().crossVectors(dragStartVec.current, vNow)
                const sin = THREE.MathUtils.clamp(cross.dot(axis), -1, 1)
                const cos = THREE.MathUtils.clamp(dragStartVec.current.dot(vNow), -1, 1)
                let ang = Math.atan2(sin, cos)
                if (ev.shiftKey) {
                    const snapRad = THREE.MathUtils.degToRad(15)
                    ang = Math.round(ang / snapRad) * snapRad
                }
                const dq = tmpQ.current.setFromAxisAngle(axis, ang)

                const startPos = new THREE.Vector3().setFromMatrixPosition(startWorldMat.current)
                const startQuat = new THREE.Quaternion().setFromRotationMatrix(startWorldMat.current)
                const startScl = new THREE.Vector3().setFromMatrixScale(startWorldMat.current)

                const pw = startPos.clone().sub(center).applyQuaternion(dq).add(center)
                const qw = dq.clone().multiply(startQuat)

                const Mw = tmpM.current.compose(pw, qw, startScl)
                const parentInv = new THREE.Matrix4().copy(selected.current.parent?.matrixWorld ?? tmpM2.current.identity()).invert()
                const Ml = tmpM2.current.copy(parentInv).multiply(Mw)

                const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3()
                Ml.decompose(pos, quat, scl)
                selected.current.position.copy(pos)
                selected.current.quaternion.copy(quat)
                selected.current.scale.copy(scl)

                showGizmoAt(selected.current)
                updateBoxFor(selected.current)
                return
            }
        }

        const hit = pick(ev)
        const root = hit ? toTopMovable(hit.object) : null
        updateBoxFor(root)
    }

    const onDown = (ev: PointerEvent) => {
        if (!enabled || ev.button !== 0) return
        setMouse(ev)
        const hit = pick(ev)
        const isTrans = !!(hit && (hit.object as any).userData?.kind === 'translate' && selected.current)
        const isRot   = !!(hit && (hit.object as any).userData?.kind === 'rotate'    && selected.current)
        const root    = hit ? toTopMovable(hit.object) : null
        if (isTrans || isRot || root) { ev.stopImmediatePropagation?.(); ev.preventDefault?.() }
        if (isTrans) { startTranslate((hit!.object as any).userData.axis); return }
        if (isRot)   { startRotate((hit!.object as any).userData.axis);    return }

        selected.current = root
        const key = root ? ((root as any).userData?.anchorKey as AnchorKey) ?? null : null
        selectedAnchorKey.current = key
        showGizmoAt(root)
        updateBoxFor(root)

        if (selected.current && key) {
            const base = ANCHOR[key]
            const basePos = new THREE.Vector3().fromArray(base.position as any)
            const br = base.rotation ?? [0, 0, 0]
            const baseQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(br[0], br[1], br[2], 'XYZ'))
            baseAnchorMat.current.compose(basePos, baseQuat, new THREE.Vector3(1,1,1))

            selected.current.updateMatrixWorld(true)
            selectionStartWorldMat.current.copy(selected.current.matrixWorld)
        }
    }

    const onUp = () => {
        if (!enabled) return
        if (picking.current && selected.current) {
            picking.current = false
            setBusy(false)
            gl.domElement.style.cursor = ''

            if (selectedAnchorKey.current) {
                selected.current.updateMatrixWorld(true)
                endWorldMat.current.copy(selected.current.matrixWorld)

                const deltaMat = new THREE.Matrix4()
                    .copy(endWorldMat.current)
                    .multiply(new THREE.Matrix4().copy(selectionStartWorldMat.current).invert())

                const newMat = new THREE.Matrix4().copy(deltaMat).multiply(baseAnchorMat.current)

                const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3()
                newMat.decompose(pos, quat, scl)
                const e = new THREE.Euler().setFromQuaternion(quat, 'XYZ')

                const key = selectedAnchorKey.current as AnchorKey
                const eye = ANCHOR[key]?.eye
                const eyeStr = eye ? eye.map((v: number) => v.toFixed(3)).join(', ') : null

                const sP = new THREE.Vector3().setFromMatrixPosition(selectionStartWorldMat.current)
                const eP = new THREE.Vector3().setFromMatrixPosition(endWorldMat.current)
                const dP = eP.clone().sub(sP)

                console.group(`[DevMove] ${key}`)
                console.log('axis', dragAxis.current, 'axisOriginW', [axisOriginW.current.x.toFixed(3), axisOriginW.current.y.toFixed(3), axisOriginW.current.z.toFixed(3)])
                console.log('Δ_total.sinceSelect', { pos: [dP.x.toFixed(3), dP.y.toFixed(3), dP.z.toFixed(3)] })
                console.log('NEW.anchor', { pos: [pos.x.toFixed(3), pos.y.toFixed(3), pos.z.toFixed(3)], rotXYZ: [e.x.toFixed(3), e.y.toFixed(3), e.z.toFixed(3)] })
                console.groupEnd()

                const line =
                    `${key}: { ` +
                    (eyeStr ? `eye: [${eyeStr}], ` : ``) +
                    `position: [${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}], ` +
                    `rotation: [${fmtRad(e.x)}, ${fmtRad(e.y)}, ${fmtRad(e.z)}] },`

                console.log('// Paste into anchors.ts:\n' + line)
                navigator.clipboard?.writeText(line).catch(() => {})
            }
        }
        dragAxis.current = null
    }

    React.useEffect(() => {
        if (!enabled) return
        ensureBoxHelper(); ensureGizmo(); updateGizmoVisibility()
        const el = gl.domElement
        const key = (e: KeyboardEvent) => {
            if (e.code === 'KeyQ') { mode.current = 'translate'; updateGizmoVisibility() }
            if (e.code === 'KeyE') { mode.current = 'rotate'; if (selected.current) showGizmoAt(selected.current); updateGizmoVisibility() }
        }
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerdown', onDown)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('keydown', key)
        return () => {
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerdown', onDown)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('keydown', key)
            if (boxHelper.current) boxHelper.current.visible = false
            if (gizmo.current) gizmo.current.visible = false
            selected.current = null
            picking.current = false
            dragAxis.current = null
            setBusy(false)
        }
    }, [enabled, gl, camera, scene, setBusy])

    return null
}
