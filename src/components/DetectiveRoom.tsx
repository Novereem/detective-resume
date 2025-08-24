'use client'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React from 'react'
import * as THREE from 'three'
import {FramedPlane} from "@/shaders/FramedPlane";
import {Outlined} from "@/shaders/OutlinedMesh";
import ObjectInspectOverlay from "@/components/ObjectInspectOverlay";
import { InspectState } from '@/shaders/inspectTypes'
import {PixelateNearestFX} from "@/shaders/PixelateNearestFX";
import { Desk } from '@/components/Models/Desk'

function Scene({ openInspect }: { openInspect: (s: InspectState) => void }) {
    const { scene } = useThree()
    scene.background = new THREE.Color('#3c3c3c')

    return (
        <>
            {/* lights */}
            <ambientLight intensity={0.1}/>
            <directionalLight position={[2, 5, 7]}/>

            {/* floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
                <FramedPlane width={10} height={10} color="#333" borderColor="#fff" hoverColor="#ff3b30"
                             canInteract={false} border={0.06}/>
            </mesh>

            {/* extra plane */}
            <mesh raycast={() => null} position={[10,0,0]}>
                <planeGeometry args={[10, 10]}/>
                <meshStandardMaterial color="#333" side={THREE.DoubleSide}/>
            </mesh>

            {/* shapes */}
            <Outlined
                geometry={<boxGeometry args={[1, 1, 1]}/>}
                rotation={[0.5, 0, 0]}
                color="#4e4e4e"
                outlineColor="#fff"
                hoverColor="#ff3b30"
                outlineScale={1.04}
                position={[-3, 1, -2]}
                onInspect={openInspect}
            />

            <Outlined
                geometry={<torusKnotGeometry args={[0.55, 0.18, 128, 16]}/>}
                color="#626262"
                outlineColor="#fff"
                hoverColor="#ff3b30"
                outlineScale={1.04}
                position={[3, 1, -2]}
                onInspect={openInspect}
            />

            <group rotation={[0, 0, 0.2]} position={[0, 1, -2]}>
                <FramedPlane
                    width={1}
                    height={1}
                    color="#333"
                    borderColor="#fff"
                    hoverColor="#ff3b30"
                    border={0.035}
                    canInteract
                    onInspect={openInspect}
                    inspectOverrides={{ pixelSize: 1}}
                />
            </group>

            <Desk
                position={[0, 0, -3]}
                rotation={[0, Math.PI / 6, 0]}
                color="#626262"
                outlineColor="#fff"
                hoverColor="#ff3b30"
                outlineScale={6.56}
                outlinePerPart={{ topScale: 1.04, legScale: 1.1 }}
                onInspect={openInspect as any}
                inspectPixelSize={6}
            />

            <OrbitControls enablePan={false} enableRotate/>
        </>
    )
}

export default function DetectiveRoom() {
    const [inspect, setInspect] = React.useState<InspectState | null>(null)
    const defaultInspectPixelSize = 3
    const [roomPixelSize, setroomPixelSize] = React.useState(3)

    return (
        <div style={{ position: 'fixed', inset: 0 }}>
            <div style={{ position: 'absolute', inset: 0 }}>
                <Canvas
                    camera={{ position: [0, 2, 5], fov: 100 }}
                    gl={{ antialias: false }}
                    style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
                >
                    <Scene openInspect={setInspect} />
                    <PixelateNearestFX size={roomPixelSize} />
                </Canvas>
            </div>

            <ObjectInspectOverlay
                open={!!inspect}
                state={inspect}
                onClose={() => setInspect(null)}
                pixelSize={defaultInspectPixelSize}
            />
        </div>
    )
}
