// ObjectInspectOverlay.tsx
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Outlined } from '@/shaders/OutlinedMesh'
import {FramedPlane} from "@/shaders/FramedPlane";
import {InspectState} from "@/shaders/inspectTypes";
import {PixelateNearestFX} from "@/shaders/PixelateNearestFX";

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
                                                 pixelSize = 1,
                                             }: Props) {
    const [renderState, setRenderState] = React.useState<InspectState | null>(null)
    const [visible, setVisible] = React.useState(false)

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

    // ESC to close
    React.useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open && !renderState) return null

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
                    transform: visible
                        ? 'translateY(0)'
                        : 'translateY(calc(100vh + 24px))',
                    transition: `transform ${durationMs}ms cubic-bezier(.22,.8,.36,1)`,
                }}
            >
                {renderState && (
                    <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }} gl={{ antialias: false }} style={{ imageRendering: 'pixelated' }}>
                        <ambientLight intensity={1} />
                        <directionalLight position={[2, 3, 4]} intensity={1} />

                        <group rotation={renderState.initialRotation ?? [0, 0, 0]}>
                            {renderState.kind === 'outlined' ? (
                                <Outlined
                                    geometry={renderState.geometry}
                                    color={renderState.color ?? '#808080'}
                                    outlineColor={renderState.outlineColor ?? '#ffffff'}
                                    outlineScale={renderState.outlineScale ?? 1.035}
                                    canInteract={false}
                                />
                            ) : (
                                <FramedPlane
                                    width={renderState.width}
                                    height={renderState.height}
                                    color={renderState.color ?? '#333'}
                                    borderColor={renderState.borderColor ?? '#fff'}
                                    border={renderState.border ?? 0.05}
                                    doubleSide={renderState.doubleSide ?? true}
                                    canInteract={false}
                                />
                            )}
                        </group>

                        <OrbitControls enablePan={false} />
                        <PixelateNearestFX size={pixelSize} />
                    </Canvas>
                )}
            </div>
        </div>
    )
}
