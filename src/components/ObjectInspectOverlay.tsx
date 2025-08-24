import React from 'react'
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { Outlined } from '@/shaders/OutlinedMesh'
import { FramedPlane } from '@/shaders/FramedPlane'
import { InspectState } from '@/shaders/inspectTypes'
import { PixelateNearestFX } from '@/shaders/PixelateNearestFX'

function RecenterOnce({
                          contentRef,
                          setOffset,
                          invalidate,
                          resetToken,
                      }: {
    contentRef: React.RefObject<THREE.Group<THREE.Object3DEventMap> | null>
    setOffset: (o: [number, number, number]) => void
    invalidate: () => void
    resetToken: unknown
}) {
    const done = React.useRef(false)

    // reset when a new object is being inspected
    React.useEffect(() => { done.current = false }, [resetToken])

    const computeBox = React.useCallback(() => {
        const root = contentRef.current
        if (!root) return null
        root.updateWorldMatrix(true, true)
        const box = new THREE.Box3()
        root.traverse((obj) => {
            // @ts-ignore
            if (obj?.isMesh && obj.geometry) {
                const mat: any = (obj as any).material
                if (!mat?.isMeshStandardMaterial) return
                const mesh = obj as THREE.Mesh
                mesh.updateWorldMatrix(true, false)
                if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
                const gbox = mesh.geometry.boundingBox!.clone()
                gbox.applyMatrix4(mesh.matrixWorld)
                box.union(gbox)
            }
        })
        return box.isEmpty() ? null : box
    }, [contentRef])

    useFrame(() => {
        if (done.current) return
        const box = computeBox()
        if (!box) return
        const center = new THREE.Vector3()
        box.getCenter(center)
        setOffset([0, -center.y, 0])
        done.current = true
        invalidate()
    })

    return null
}

function ResetControlsOnChange({
                                   resetToken,
                                   controlsRef,
                                   invalidate,
                                   camPos = [0, 0, 3.2],
                                   target = [0, 0, 0],
                               }: {
    resetToken: unknown
    controlsRef: React.RefObject<OrbitControlsImpl | null>
    invalidate: () => void
    camPos?: [number, number, number]
    target?: [number, number, number]
}) {
    const { camera } = useThree()

    React.useEffect(() => {
        const controls = controlsRef.current
        if (!controls) return
        camera.position.set(camPos[0], camPos[1], camPos[2])
        controls.target.set(target[0], target[1], target[2])
        controls.update()
        invalidate()
    }, [resetToken])

    return null
}

type Props = {
    open: boolean
    state: InspectState | null
    onClose: () => void
    durationMs?: number
    pixelSize?: number
}

export default function ObjectInspectOverlay({
                                                 open,
                                                 state,
                                                 onClose,
                                                 durationMs = 500,
                                                 pixelSize: defaultPixelSize = 1,
                                             }: Props) {
    const [renderState, setRenderState] = React.useState<InspectState | null>(null)
    const [visible, setVisible] = React.useState(false)

    // centering
    const contentRef = React.useRef<THREE.Group>(null)
    const [offset, setOffset] = React.useState<[number, number, number]>([0, 0, 0])

    // r3f helpers
    const invalidateRef = React.useRef<() => void>(() => {})
    const canvasElRef = React.useRef<HTMLCanvasElement | null>(null)

    // pixel size
    const effectivePixelSize = state?.pixelSize ?? defaultPixelSize

    React.useEffect(() => {
        if (open && state) {
            setRenderState(state)
            const id = requestAnimationFrame(() => setVisible(true))
            return () => cancelAnimationFrame(id)
        } else {
            setVisible(false)
            const t = setTimeout(() => setRenderState(null), durationMs)
            return () => clearTimeout(t)
        }
    }, [open, state, durationMs])

    const recomputeCenter = React.useCallback(() => {
        if (!contentRef.current) return
        contentRef.current.updateWorldMatrix(true, true)
        const box = new THREE.Box3().setFromObject(contentRef.current)
        const center = new THREE.Vector3()
        box.getCenter(center)
        setOffset([0, -center.y, 0])
        invalidateRef.current?.()
    }, [])

    // when content changes, center it next tick
    React.useLayoutEffect(() => {
        if (renderState) setOffset([0, 0, 0])
    }, [renderState])

    React.useEffect(() => {
        if (renderState) invalidateRef.current?.()
    }, [renderState])

    React.useEffect(() => {
        invalidateRef.current?.()
    }, [offset])

    const controlsRef = React.useRef<OrbitControlsImpl | null>(null)

    // Esc to close
    React.useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: open ? 'auto' : 'none',
                overflow: 'hidden',
            }}
        >
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: visible ? 'blur(8px) brightness(0.85)' : 'blur(0px) brightness(1)',
                    WebkitBackdropFilter: visible ? 'blur(8px) brightness(0.85)' : 'blur(0px) brightness(1)',
                    opacity: visible ? 1 : 0,
                    transition: `opacity ${durationMs}ms ease, backdrop-filter ${durationMs}ms ease`,
                }}
            />

            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 'min(80vw, 820px)',
                    height: 'min(80vh, 540px)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.45)',
                    background: 'rgba(18,18,18,0.6)',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                    transform: visible ? 'translateY(0)' : 'translateY(calc(100vh + 24px))',
                    transition: `transform ${durationMs}ms cubic-bezier(.22,.8,.36,1)`,
                }}
            >
                <Canvas
                    camera={{ position: [0, 0, 3.2], fov: 50 }}
                    dpr={[1, 1]}
                    frameloop="demand"
                    gl={{ antialias: false, powerPreference: 'low-power' }}
                    style={{ imageRendering: 'pixelated' }}
                    onCreated={({ gl, invalidate }) => {
                        invalidateRef.current = invalidate
                        canvasElRef.current = gl.domElement as HTMLCanvasElement

                        const onLost = (e: Event) => e.preventDefault()
                        const onRestored = () => {
                            invalidateRef.current?.()
                            requestAnimationFrame(recomputeCenter)
                        }
                        canvasElRef.current.addEventListener('webglcontextlost', onLost, false)
                        canvasElRef.current.addEventListener('webglcontextrestored', onRestored, false)

                        return () => {
                            canvasElRef.current?.removeEventListener('webglcontextlost', onLost, false)
                            canvasElRef.current?.removeEventListener('webglcontextrestored', onRestored, false)
                        }
                    }}
                >
                    <ambientLight intensity={1} />
                    <directionalLight position={[2, 3, 4]} intensity={1} />

                    <group rotation={renderState?.initialRotation ?? [0, 0, 0]}>
                        <group ref={contentRef} position={offset}>
                            {renderState?.kind === 'outlined' && (
                                <Outlined
                                    geometry={(renderState as any).geometry}
                                    color={(renderState as any).color ?? '#808080'}
                                    outlineColor={(renderState as any).outlineColor ?? '#ffffff'}
                                    outlineScale={(renderState as any).outlineScale ?? 1.035}
                                    canInteract={false}
                                />
                            )}

                            {renderState?.kind === 'outlinedGroup' && (
                                <>
                                    {(renderState as any).parts.map((p: any, i: number) => (
                                        <Outlined
                                            key={i}
                                            geometry={p.geometry}
                                            color={p.color ?? '#808080'}
                                            outlineColor={p.outlineColor ?? '#ffffff'}
                                            outlineScale={p.outlineScale ?? 1.035}
                                            canInteract={false}
                                            position={p.position}
                                            rotation={p.rotation}
                                            scale={p.scale}
                                        />
                                    ))}
                                </>
                            )}

                            {renderState &&
                                renderState.kind !== 'outlined' &&
                                renderState.kind !== 'outlinedGroup' && (
                                    <FramedPlane
                                        width={(renderState as any).width}
                                        height={(renderState as any).height}
                                        color={(renderState as any).color ?? '#333'}
                                        borderColor={(renderState as any).borderColor ?? '#fff'}
                                        border={(renderState as any).border ?? 0.05}
                                        doubleSide={(renderState as any).doubleSide ?? true}
                                        canInteract={false}
                                    />
                                )}
                        </group>
                    </group>

                    <RecenterOnce
                        contentRef={contentRef}
                        setOffset={(o) => setOffset(o)}
                        invalidate={() => invalidateRef.current?.()}
                        resetToken={renderState}
                    />

                    <ResetControlsOnChange
                        resetToken={renderState}
                        controlsRef={controlsRef}
                        invalidate={() => invalidateRef.current?.()}
                    />

                    <OrbitControls
                        ref={controlsRef}
                        enablePan={false}
                        onChange={() => invalidateRef.current?.()}
                    />
                    {effectivePixelSize > 1 ? <PixelateNearestFX size={effectivePixelSize} /> : null}
                </Canvas>
            </div>
        </div>
    )
}
