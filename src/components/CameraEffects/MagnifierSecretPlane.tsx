'use client'

import React, { JSX, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMagnifierState } from '@/components/MagnifierStateContext'

type MagnifierSecretPlaneProps = {
    textureUrl: string
    width: number
    height: number
} & Omit<JSX.IntrinsicElements['mesh'], 'args'>

export function MagnifierSecretPlane({
                                         textureUrl,
                                         width,
                                         height,
                                         ...rest
                                     }: MagnifierSecretPlaneProps) {
    const { held, lensMaskRef } = useMagnifierState()

    const [tex, setTex] = useState<THREE.Texture | null>(null)

    useEffect(() => {
        let cancelled = false
        const loader = new THREE.TextureLoader()

        loader.load(
            textureUrl,
            (t) => {
                if (cancelled) return
                t.wrapS = THREE.ClampToEdgeWrapping
                t.wrapT = THREE.ClampToEdgeWrapping
                t.magFilter = THREE.LinearFilter
                t.minFilter = THREE.LinearMipmapLinearFilter
                setTex(t)
            },
            undefined,
            (err) => {
                console.error('MagnifierSecretPlane texture load error', err)
            }
        )

        return () => {
            cancelled = true
        }
    }, [textureUrl])

    const vertexShader = `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `

    const fragmentShader = `
        uniform sampler2D uMap;
        uniform vec2 uLensCenterUv;
        uniform float uLensRadiusUv;
        uniform float uUseMask;
        uniform vec3 uTint;
        uniform float uOpacity;

        varying vec2 vUv;

        void main() {
            vec4 tex = texture2D(uMap, vUv);

            if (uUseMask < 0.5) discard;

            float d = distance(vUv, uLensCenterUv);
            float inner = uLensRadiusUv * 0.8;
            float m = 1.0 - smoothstep(inner, uLensRadiusUv, d);
            if (m <= 0.01) discard;

            float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
            vec3 tinted = mix(vec3(lum), uTint, 0.6);

            gl_FragColor = vec4(tinted, tex.a * m * uOpacity);
        }
    `

    const meshRef = useRef<THREE.Mesh>(null)
    const matRef = useRef<THREE.ShaderMaterial>(null)

    useFrame(() => {
        const mat = matRef.current
        const mesh = meshRef.current
        const mask = lensMaskRef.current

        if (!mat || !mesh) return

        const uniforms = mat.uniforms

        if (!tex) {
            uniforms.uUseMask.value = 0.0
            return
        }

        if (uniforms.uMap.value !== tex) {
            uniforms.uMap.value = tex
        }

        if (!held || !mask.active) {
            uniforms.uUseMask.value = 0.0
            return
        }

        const centerWorld = new THREE.Vector3(
            mask.origin[0],
            mask.origin[1],
            mask.origin[2]
        )
        const localCenter = centerWorld.clone()
        mesh.worldToLocal(localCenter)

        const u = localCenter.x / width + 0.5
        const v = localCenter.y / height + 0.5

        if (u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0) {
            uniforms.uUseMask.value = 0.0
            return
        }

        uniforms.uLensCenterUv.value.set(u, v)

        const planeSize = Math.min(width, height)
        const radiusWorld = mask.radius ?? 0.3
        uniforms.uLensRadiusUv.value = radiusWorld / planeSize

        uniforms.uUseMask.value = 1.0
    })

    return (
        <mesh ref={meshRef} {...rest} renderOrder={10}>
            <planeGeometry args={[width, height]} />
            <shaderMaterial
                ref={matRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent
                depthWrite={false}
                depthTest={false}
                uniforms={{
                    uMap: { value: null },
                    uLensCenterUv: { value: new THREE.Vector2(0.5, 0.5) },
                    uLensRadiusUv: { value: 0.7 },
                    uUseMask: { value: 0.0 },
                    uTint: { value: new THREE.Color('#7ecbff') },
                    uOpacity: { value: 1.0 },
                }}
            />
        </mesh>
    )
}
