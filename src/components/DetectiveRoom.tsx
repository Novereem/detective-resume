'use client'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { useRef } from 'react'
import * as THREE from 'three'
import { OutlinePass } from "@/shaders/OutlinePass";

function Scene() {
    const { scene } = useThree()
    scene.background = new THREE.Color('#3c3c3c')

    return (
        <>
            {/* lights */}
            <ambientLight intensity={0.5}/>
            <directionalLight position={[2, 5, 7]}/>

            {/* floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10, 10]}/>
                <meshStandardMaterial color="#333" side={THREE.DoubleSide}/>
            </mesh>

            <mesh position={[0, 0.5, -3]}>
                <boxGeometry args={[1, 1, 1]}/>
                <meshStandardMaterial color="lightblue"/>
            </mesh>

            <mesh position={[3, 0.5, 0]}>
                <boxGeometry args={[1, 1, 1]}/>
                <meshStandardMaterial color="white"/>
            </mesh>

            <OrbitControls enablePan={false} enableRotate/>
        </>
    )
}

export default function DetectiveRoom() {
    return (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
            <Canvas
                gl={{ antialias: false }}
                camera={{ position:[0,2,5], fov:100 }}
                style={{ width: '100%', height: '100%' }}
            >
                <color attach="background" args={['#3c3c3c']} />
                <Scene />

                {/* ← this line turns on the full‐screen silhouette pass */}
                <OutlinePass
                    edgeThickness={2}         // how many pixels out to sample
                    depthThreshold={1}    // depth jump to count as an edge
                    normalThreshold={0.5}    // normal difference to count as an edge
                    outlineColor="#ffffff"    // silhouette color
                />
            </Canvas>
        </div>
    )
}