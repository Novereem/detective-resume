import React from 'react'
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { Outlined } from '@/components/Primitives/Outlined'
import { FramedPlane } from '@/components/Primitives/FramedPlane'
import type { InspectState } from '@/components/Types/inspectModels'
import { PixelateNearestFX } from '@/components/CameraEffects/PixelateNearestFX'
import { SecretFile } from '@/components/Models/SecretFile'
import {cardboardMaterials, secretFileMaterials} from "@/components/Materials/detectiveRoomMats";
import {InspectOverlayProps} from "@/components/Types/inspect";
import {useSettings} from "@/components/UI/SettingsProvider";
import {CardboardBox} from "@/components/Models/CardboardBox/CardboardBox";
import {CardboardLid} from "@/components/Models/CardboardBox/CardboardLid";

function SecretFilePreview({ targetAngle }: { targetAngle: number }) {
    const invalidate = useThree((s) => s.invalidate)
    const [angle, setAngle] = React.useState(0)

    React.useEffect(() => {
        invalidate()
    }, [targetAngle, invalidate])

    useFrame((_, dt) => {
        const dtClamped = Math.min(dt, 1 / 60)
        const next = THREE.MathUtils.damp(angle, targetAngle, 6, dtClamped)
        if (Math.abs(next - angle) > 1e-4) {
            setAngle(next)
            invalidate()
        }
    })

    return (
        <group rotation={[0, Math.PI, 0]}>
            <SecretFile
                frontOpen={angle}
                inspectPixelSize={3}
                disableOutline
                materialsById={secretFileMaterials}
            />
        </group>
    )
}

function CardboardBoxPreview({
                                 targetLift = 0,
                                 size = [0.28, 0.14, 0.28] as [number, number, number],
                                 lidLip = 0.028,
                                 lidWallT = 0.003,
                                 lidClearance = 0.002,
                             }: {
    targetLift?: number
    size?: [number, number, number]
    lidLip?: number
    lidWallT?: number
    lidClearance?: number
}) {
    const invalidate = useThree((s) => s.invalidate)
    const [lift, setLift] = React.useState(0)

    React.useEffect(() => { invalidate() }, [targetLift, invalidate])

    useFrame((_, dt) => {
        const dtClamped = Math.min(dt, 1 / 60)
        const next = THREE.MathUtils.damp(lift, targetLift, 6, dtClamped)
        if (Math.abs(next - lift) > 1e-4) {
            setLift(next)
            invalidate()
        }
    })

    const [W, H, D] = size
    const lidY = H / 2 + THREE.MathUtils.lerp(0, 0.12, lift)

    return (
        <group rotation={[0, Math.PI, 0]}>
            <CardboardBox
                size={size}
                lidEnabled={false}
                materialsById={cardboardMaterials}
                disableOutline
                inspectDisableOutline
            />
            <group position={[0, lidY, 0]}>
                <CardboardLid
                    size={[W, D]}
                    sideH={lidLip}
                    wallT={lidWallT}
                    clearance={lidClearance}
                    materialsById={cardboardMaterials}
                    disableOutline
                    inspectDisableOutline
                />
            </group>
        </group>
    )
}

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
                if (!(mat?.isMeshStandardMaterial || mat?.isMeshBasicMaterial)) return
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

function HoverButton({
                         onClick,
                         opening,
                     }: {
    onClick: () => void
    opening: boolean
}) {
    const [hovered, setHovered] = React.useState(false)
    const [active, setActive] = React.useState(false)
    const [focused, setFocused] = React.useState(false)

    const baseBg = '#474747'
    const hoverBg = '#5a5a5a'
    const activeBg = '#3f3f3f'

    const bg = active ? activeBg : hovered ? hoverBg : baseBg
    const border = hovered ? '1px solid #b0b0b0' : '1px solid #888'
    const shadow =
        active
            ? '0 1px 6px rgba(0,0,0,0.35)'
            : hovered
                ? '0 6px 18px rgba(0,0,0,0.35)'
                : '0 3px 12px rgba(0,0,0,0.25)'
    const transform = active ? 'translateY(0px)' : hovered ? 'translateY(-1px)' : 'translateY(0)'

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setActive(false) }}
            onMouseDown={() => setActive(true)}
            onMouseUp={() => setActive(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                }
            }}
            style={{
                padding: '12px 20px',
                borderRadius: 0,
                border,
                background: bg,
                color: '#ffffff',
                fontSize: 'large',
                fontWeight: 'bold',
                fontFamily: 'Times New Roman',
                cursor: 'pointer',
                transition: 'background 120ms ease, border-color 120ms ease, box-shadow 140ms ease, transform 120ms ease',
                boxShadow: shadow,
                transform,
                outline: 'none',
                ...(focused
                    ? { boxShadow: `${shadow}, 0 0 0 2px rgba(255,255,255,0.75) inset` }
                    : null),
            }}
            aria-label={opening ? 'Open secret file' : 'Close secret file'}
        >
            {opening ? 'Open' : 'Close'}
        </button>
    )
}

export default function ObjectInspectOverlay({
                                                 open,
                                                 state,
                                                 onClose,
                                                 durationMs = 500,
                                                 pixelSize: defaultPixelSize = 1,
                                                 camDistance = 3.2,
                                                 onSolved,
                                                 onAction,
                                             }: InspectOverlayProps) {
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
    // camera distance
    const effectiveCamDist   = state?.inspectDistance ?? camDistance

    const { setIsInspecting } = useSettings()

    React.useEffect(() => {
        setIsInspecting(open)
        return () => setIsInspecting(false)
    }, [open, setIsInspecting])

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

    // Close on ESC
    React.useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    const puzzle = renderState?.puzzle?.type === 'text' ? renderState.puzzle : undefined
    const puzzleMeta = (renderState as any)?.metadata ?? {}
    const puzzleSolved = !!puzzleMeta?.solved
    const puzzleSolvedAnswer = (puzzleMeta?.solvedAnswer ?? '') as string

    const [answer, setAnswer] = React.useState('')
    const [status, setStatus] = React.useState<'idle' | 'correct' | 'incorrect'>('idle')
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const cardRef = React.useRef<HTMLDivElement | null>(null)

    React.useEffect(() => {
        if (!open) return
        const body = document.body
        const scrollY = window.scrollY

        const prev = {
            position: body.style.position,
            top: body.style.top,
            width: body.style.width,
            overflow: body.style.overflow,
        }

        body.style.position = 'fixed'
        body.style.top = `-${scrollY}px`
        body.style.width = '100%'
        body.style.overflow = 'hidden'

        return () => {
            body.style.position = prev.position
            body.style.top = prev.top
            body.style.width = prev.width
            body.style.overflow = prev.overflow
            window.scrollTo(0, scrollY)
        }
    }, [open])

    React.useEffect(() => {
        if (!visible) return

        setAnswer('')
        setStatus('idle')

        const node = cardRef.current
        if (!node) return

        const onEnd = (e: TransitionEvent) => {
            if (e.propertyName === 'transform') {
                if (puzzle && !puzzleSolved) inputRef.current?.focus()
                node.removeEventListener('transitionend', onEnd)
            }
        }

        node.addEventListener('transitionend', onEnd)
        return () => node.removeEventListener('transitionend', onEnd)
    }, [visible, puzzle?.id])

    const normalize = React.useCallback((s: string) => {
        const mode = puzzle?.normalize ?? 'trim-lower'
        let v = s
        if (mode === 'trim' || mode === 'trim-lower') v = v.trim()
        if (mode === 'lower' || mode === 'trim-lower') v = v.toLowerCase()
        return v
    }, [puzzle?.normalize])

    const submitAnswer = React.useCallback(() => {
        if (!puzzle || !renderState) return
        const strAnswers = puzzle.answers.filter(a => typeof a === 'string') as string[]
        const rxAnswers  = puzzle.answers.filter(a => a instanceof RegExp) as RegExp[]

        const raw = answer
        const norm = normalize(answer)

        const strOk = strAnswers.some(a => normalize(a) === norm)
        const rxOk  = rxAnswers.some(rx => rx.test(raw))

        const ok = strOk || rxOk
        setStatus(ok ? 'correct' : 'incorrect')

        if (ok && renderState) {
            onSolved?.({ state: renderState, answer: raw })
        }
    }, [answer, puzzle, normalize, renderState, onSolved])

    const onKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            submitAnswer()
        }
    }, [submitAnswer])

    const [secretTarget, setSecretTarget] = React.useState(0)
    React.useEffect(() => {
        if (renderState) setSecretTarget(0)
    }, [renderState])

    const metaType = (renderState as any)?.metadata?.type

    const isInspectingSecretFile = React.useMemo(() => {
        // 1) Prefer explicit metadata from DetectiveRoom
        if (metaType === 'secretfile') return true

        // 2) Fallback: detect by parts ids (works with your ModelGroup output)
        const parts = (renderState as any)?.parts
        if (!Array.isArray(parts)) return false
        const ids = new Set(parts.map((p: any) => String(p.id)))
        const hasCovers = ids.has('coverBack') && ids.has('coverFront')

        // Accept either 'paper-1' style or a plain 'paper' id
        const hasPaper =
            [...ids].some((id) => id.startsWith('paper-')) ||
            ids.has('paper') ||
            ids.has('page') ||
            [...ids].some((id) => id.includes('paper'))

        return hasCovers && hasPaper
    }, [renderState])

    const isInspectingCardboardBox = metaType === 'cardboard-box'
    const [boxOpenAmt, setBoxOpenAmt] = React.useState(0)
    React.useEffect(() => { if (renderState) setBoxOpenAmt(0) }, [renderState])

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
                ref={cardRef}
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

                    transform: visible ? 'translateY(0) translateZ(0)' : 'translateY(calc(100vh + 24px)) translateZ(0)',
                    transition: `transform ${durationMs}ms cubic-bezier(.22,.8,.36,1)`,

                    willChange: 'transform',
                    backfaceVisibility: 'hidden',

                    position: 'relative',
                }}
            >
                <Canvas
                    camera={{position: [0, 0, 3.2], fov: 50}}
                    dpr={[1, 1]}
                    frameloop="demand"
                    gl={{antialias: false, powerPreference: 'low-power'}}
                    style={{imageRendering: 'pixelated'}}
                    onCreated={({gl, invalidate}) => {
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
                    <ambientLight intensity={3}/>
                    <directionalLight position={[2, 5, 7]}/>

                    <group rotation={renderState?.initialRotation ?? [0, 0, 0]}>
                        <group ref={contentRef} position={offset}>
                            {isInspectingCardboardBox ? (
                                <CardboardBoxPreview
                                    targetLift={boxOpenAmt}
                                    size={[0.28, 0.14, 0.28]}
                                    lidLip={0.028}
                                    lidWallT={0.003}
                                    lidClearance={0.002}
                                />
                            ) : isInspectingSecretFile ? (
                                <SecretFilePreview targetAngle={secretTarget}/>
                            ) : (
                                <>
                                    {renderState?.kind === 'outlined' && (
                                        <Outlined
                                            geometry={(renderState as any).geometry}
                                            color={(renderState as any).color ?? '#808080'}
                                            outlineColor={(renderState as any).outlineColor ?? '#ffffff'}
                                            outlineScale={(renderState as any).outlineScale ?? 1.035}
                                            canInteract={false}
                                            disableOutline={(renderState as any).inspectDisableOutline}
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
                                                    textureUrl={p.textureUrl}
                                                    texturePixelated={p.texturePixelated}
                                                    metalness={p.metalness}
                                                    roughness={p.roughness}
                                                    disablePointer
                                                    disableOutline={(renderState as any).inspectDisableOutline}
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
                                                textureUrl={(renderState as any).textureUrl}
                                                textureFit={(renderState as any).textureFit}
                                                texturePixelated={(renderState as any).texturePixelated}
                                                textureZ={(renderState as any).textureZ}
                                                frameDepthBias={false}
                                            />
                                        )}
                                </>
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
                        camPos={[0, 0, effectiveCamDist]}
                    />

                    <OrbitControls
                        ref={controlsRef}
                        enablePan={false}
                        onChange={() => invalidateRef.current?.()}
                    />
                    {effectivePixelSize > 1 ? <PixelateNearestFX size={effectivePixelSize}/> : null}
                </Canvas>

                {puzzle && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            padding: '12px 14px',
                            background: (puzzleSolved || status === 'correct')
                                ? 'rgba(0,128,0,0.22)'
                                : status === 'incorrect'
                                    ? 'rgba(128,0,0,0.25)'
                                    : 'rgba(0,0,0,0.55)',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            gap: 10,
                            alignItems: 'center',
                            backdropFilter: 'blur(2px)',
                        }}
                    >
                        <div style={{ color: '#ddd', fontSize: 14, whiteSpace: 'nowrap' }}>
                            {puzzle.prompt ?? 'Type your answer:'}
                        </div>

                        {puzzleSolved ? (
                            <>
                                <div
                                    style={{
                                        flex: 1,
                                        color: '#fff',
                                        fontSize: 14,
                                        padding: '8px 10px',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: 8,
                                    }}
                                >
                                    <strong>Solved answer:</strong> {puzzleSolvedAnswer || '(empty)'}
                                </div>
                                <div style={{ minWidth: 90, textAlign: 'right', color: '#00d323', fontSize: 13 }}>
                                    {puzzle.feedback?.correct ?? 'Correct!'}
                                </div>
                            </>
                        ) : (
                            <>
                                <input
                                    ref={inputRef}
                                    value={answer}
                                    onChange={(e) => { setAnswer(e.target.value); setStatus('idle') }}
                                    onKeyDown={onKeyDown}
                                    placeholder="Your answer..."
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        color: '#fff',
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        outline: 'none',
                                        fontSize: 14,
                                    }}
                                />
                                <button
                                    onClick={submitAnswer}
                                    disabled={!answer.trim()}
                                    style={{
                                        background: !answer.trim() ? 'rgba(255,255,255,0.12)' : '#fff',
                                        color: !answer.trim() ? 'rgba(255,255,255,0.55)' : '#111',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '8px 12px',
                                        cursor: !answer.trim() ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                    }}
                                >
                                    Confirm
                                </button>
                                <div style={{ minWidth: 90, textAlign: 'right', color: '#fff', fontSize: 13 }}>
                                    {status === 'correct' && (puzzle.feedback?.correct ?? 'Correct!')}
                                    {status === 'incorrect' && (puzzle.feedback?.incorrect ?? 'Try again')}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {isInspectingSecretFile && (
                    <div style={{ position: 'absolute', top: 20, right: 20 }}>
                        <HoverButton
                            onClick={() => {
                                const opening = secretTarget === 0
                                setSecretTarget(opening ? Math.PI : 0)
                                if (renderState && onAction) {
                                    onAction(opening ? 'secret-open' : 'secret-close', renderState)
                                }
                            }}
                            opening={secretTarget === 0}
                        />
                    </div>
                )}

                {isInspectingCardboardBox && (
                    <div style={{ position: 'absolute', top: 20, right: 20 }}>
                        <HoverButton
                            onClick={() => {
                                setBoxOpenAmt(1)
                                onAction?.('box-open', renderState!)
                            }}
                            opening={boxOpenAmt === 0}
                        />
                    </div>
                )}

            </div>
        </div>
    )
}
