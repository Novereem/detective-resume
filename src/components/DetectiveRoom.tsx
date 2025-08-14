'use client'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React from 'react'
import * as THREE from 'three'
import {FramedPlane} from "@/shaders/FramedPlane";
import {Outlined} from "@/shaders/OutlinedMesh";
import ObjectInspectOverlay, { InspectState } from "@/components/ObjectInspectOverlay";

function Scene({openInspect}: { openInspect: (s: InspectState) => void }) {
    const { scene } = useThree()
    scene.background = new THREE.Color('#3c3c3c')

    return (
        <>
            {/* lights */}
            <ambientLight intensity={1}/>
            <directionalLight position={[2, 5, 7]}/>

            {/* floor */}
            <group rotation={[-Math.PI / 2, 0, 0]}>
                <FramedPlane width={10} height={10} color="#333" borderColor="#fff" hoverColor="#ff3b30" canInteract={false} border={0.06}/>
            </group>

            {/* extra plane (as before) */}
            <mesh>
                <planeGeometry args={[10, 10]}/>
                <meshStandardMaterial color="#333" side={THREE.DoubleSide}/>
            </mesh>

            {/* boxes */}
            <Outlined
                geometry={<boxGeometry args={[1, 1, 1]} />}
                color="#4e4e4e"
                outlineColor="#fff"
                hoverColor="#ff3b30"
                outlineScale={1.035}
                position={[3, 1, -3]}
                onInspect={openInspect}
            />

            <mesh position={[3, 1, -3]}>
                <boxGeometry args={[1, 1, 1]}/>
                <meshStandardMaterial color="#4e4e4e"/>
            </mesh>

            <mesh position={[0.5, 0.6, -0.2]}>
                <boxGeometry args={[1, 1, 0.1]}/>
                <meshStandardMaterial color="#979797"/>
            </mesh>

            <OrbitControls enablePan={false} enableRotate/>
        </>
    )
}

export default function DetectiveRoom() {
    const [inspect, setInspect] = React.useState<InspectState | null>(null)

    return (
        <div style={{ position: 'fixed', inset: 0 }}>
            <div style={{position: 'absolute', inset: 0}}>
                <Canvas camera={{position: [0, 2, 5], fov: 100}} style={{width: '100%', height: '100%'}}>
                    <Scene openInspect={setInspect}/>
                </Canvas>
            </div>

            {/* Foreground overlay with copy */}
            <ObjectInspectOverlay
                open={!!inspect}
                state={inspect}
                onClose={() => setInspect(null)}
            />
        </div>
    )
}
