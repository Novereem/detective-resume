'use client'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, {useEffect, useRef} from 'react'
import * as THREE from 'three'
import { OutlinePass } from "@/shaders/OutlinePass";
import {DeferredOutlineComposer} from "@/shaders/OutlineComposer";

// function Scene() {
//     const { scene } = useThree()
//     scene.background = new THREE.Color('#3c3c3c')
//
//     return (
//         <>
//             {/* lights */}
//             <ambientLight intensity={1}/>
//             <directionalLight position={[2, 5, 7]}/>
//
//             {/* floor */}
//             <mesh rotation={[-Math.PI / 2, 0, 0]}>
//                 <planeGeometry args={[10, 10]}/>
//                 <meshStandardMaterial color="#333" side={THREE.DoubleSide}/>
//             </mesh>
//
//             <mesh>
//                 <planeGeometry args={[10, 10]}/>
//                 <meshStandardMaterial color="#333" side={THREE.DoubleSide}/>
//             </mesh>
//
//             <mesh position={[3, 1, -3]}>
//                 <boxGeometry args={[1, 1, 1]}/>
//                 <meshStandardMaterial color={"#4e4e4e"}/>
//             </mesh>
//
//             <mesh position={[0.5, 0.6, -0.2]}>
//                 <boxGeometry args={[1, 1, 0.1]}/>
//                 <meshStandardMaterial color={"#979797"}/>
//             </mesh>
//
//             <OrbitControls enablePan={false} enableRotate/>
//         </>
//     )
// }

function Scene() {
    const { scene } = useThree()

    // Set background as before
    scene.background = new THREE.Color('#3c3c3c')

    useEffect(() => {
        scene.traverse((obj) => {
            const mesh = obj as THREE.Mesh
            if (!mesh.isMesh) return

            const mat  = mesh.material as THREE.MeshStandardMaterial

            // pick color
            const oCol = (mesh.userData.outlineColor as THREE.Color)
                ?? new THREE.Color(1,1,1)

            mat.onBeforeCompile = (shader) => {
                // treat shader as “any” so TS stops complaining
                const sh = shader as any

                // enable MRT
                sh.extensions = { ...sh.extensions, drawBuffers: true }
                // inject our custom uniform
                sh.uniforms.uOutlineColor = { value: oCol }

                // inject normal varying
                sh.vertexShader = sh.vertexShader
                    .replace('#include <common>',
                        `#include <common>
           varying vec3 vNormal;`)
                    .replace('#include <begin_vertex>',
                        `#include <begin_vertex>
           vNormal = normalize(normalMatrix * normal);`)

                // rewrite the output to write into all 3 targets
                sh.fragmentShader = `
        #extension GL_EXT_draw_buffers : require
        varying vec3 vNormal;
        uniform vec3 uOutlineColor;
      ` + sh.fragmentShader.replace(
                    '#include <output_fragment>',
                    `
        // 1) lit color
        gl_FragData[0] = vec4(outgoingLight, diffuseColor.a);
        // 2) normal encoded [0..1]
        vec3 n = normalize(vNormal) * 0.5 + 0.5;
        gl_FragData[1] = vec4(n, 1.0);
        // 3) per-object outline color
        gl_FragData[2] = vec4(uOutlineColor, 1.0);
        `
                )
            }

            mat.needsUpdate = true
        })
    }, [scene])

    return (
        <>
            {/* your lights, floor, meshes, etc. */}
            <ambientLight intensity={1}/>
            <directionalLight position={[2,5,7]}/>

            <mesh
                position={[3,1,-3]}
                userData={{ outlineColor: new THREE.Color(1,0,0) }}
            >
                <boxGeometry args={[1,1,1]}/>
                <meshStandardMaterial color="#4e4e4e"/>
            </mesh>

             {/* floor */}
             <mesh rotation={[-Math.PI / 2, 0, 0]}>
                 <planeGeometry args={[10, 10]}/>
                 <meshStandardMaterial color="#333" side={THREE.DoubleSide}/>
             </mesh>

            <mesh>
                 <planeGeometry args={[10, 10]}/>
                 <meshStandardMaterial color="#333" side={THREE.DoubleSide}/>
            </mesh>

           {/* <mesh position={[3, 1, -3]}>*/}
           {/*     <boxGeometry args={[1, 1, 1]}/>*/}
           {/*      <meshStandardMaterial color={"#4e4e4e"}/>*/}
           {/*</mesh>*/}
           {/*  <mesh position={[0.5, 0.6, -0.2]}>*/}
           {/*      <boxGeometry args={[1, 1, 0.1]}/>*/}
           {/*      <meshStandardMaterial color={"#979797"}/>*/}
           {/* </mesh>*/}
             <OrbitControls enablePan={false} enableRotate/>

            {/* …other meshes with their own userData.outlineColor… */}
        </>
    )
}

export default function DetectiveRoom() {
    return (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh'}}>
            <Canvas
                gl={{ antialias: false }}
                camera={{ position:[0,2,5], fov:100 }}
                style={{ width: '100%', height: '100%' }}
            >
                <color attach="background" args={['#3c3c3c']} />
                <Scene />

                {/* ← this line turns on the full‐screen silhouette pass */}
                <DeferredOutlineComposer />
            </Canvas>
        </div>
    )
}