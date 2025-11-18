'use client'
import React, { useMemo, useRef } from 'react'
import type { JSX } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useMagnifierState } from '@/components/CameraEffects/Magnifier/MagnifierStateContext'

type BaseMatProps = JSX.IntrinsicElements['meshStandardMaterial']
type Props = Omit<BaseMatProps, 'args'> & {
    maxDistance?: number
    debug?: boolean
}

export function MagnifierRevealMaterial({
                                            maxDistance = 6,
                                            debug = false,
                                            ...rest
                                        }: Props) {
    const materialRef = useRef<THREE.MeshStandardMaterial | null>(null)
    const { lensMaskRef } = useMagnifierState()
    const { camera } = useThree()
    const loggedOnceRef = useRef(false)

    const uniforms = useMemo(
        () => ({
            uMaskActive: { value: 0 },
            uMaskOrigin: { value: new THREE.Vector3() },
            uMaskDir: { value: new THREE.Vector3(0, 0, -1) }, // unused for now
            uMaskRadius: { value: 0.25 },
            uMaskMaxDist: { value: maxDistance }, // unused
            uMaskDebug: { value: debug ? 1 : 0 },
            uAspect: { value: 1 },
        }),
        [maxDistance, debug]
    )

    useFrame(() => {
        const mat = materialRef.current as any
        const shader = mat?.userData?.shader as any
        if (!shader) return

        const mask = lensMaskRef.current
        if (!mask) return

        shader.uniforms.uMaskActive.value = mask.active ? 1 : 0
        shader.uniforms.uMaskOrigin.value.fromArray(mask.origin)
        shader.uniforms.uMaskDir.value.fromArray(mask.dir)
        shader.uniforms.uMaskRadius.value = mask.radius
        shader.uniforms.uMaskMaxDist.value = maxDistance
        shader.uniforms.uMaskDebug.value = debug ? 1 : 0

        const persp = camera as THREE.PerspectiveCamera
        shader.uniforms.uAspect.value = persp.aspect || 1

        if (!loggedOnceRef.current) {
            console.log('[MagnifierRevealMaterial] first update (screen mask)', {
                active: mask.active,
                origin: mask.origin,
                dir: mask.dir,
                radius: mask.radius,
                debug,
                aspect: shader.uniforms.uAspect.value,
            })
            loggedOnceRef.current = true
        }
    })

    return (
        <meshStandardMaterial
            ref={materialRef}
            {...rest}
            onBeforeCompile={(shader: any) => {
                console.log(
                    '[MagnifierRevealMaterial] onBeforeCompile, fragmentShader head:',
                    shader.fragmentShader.slice(0, 200)
                )

                shader.uniforms.uMaskActive = uniforms.uMaskActive
                shader.uniforms.uMaskOrigin = uniforms.uMaskOrigin
                shader.uniforms.uMaskDir = uniforms.uMaskDir
                shader.uniforms.uMaskRadius = uniforms.uMaskRadius
                shader.uniforms.uMaskMaxDist = uniforms.uMaskMaxDist
                shader.uniforms.uMaskDebug = uniforms.uMaskDebug
                shader.uniforms.uAspect = uniforms.uAspect

                // Clip position for per-fragment NDC
                shader.vertexShader =
                    `
                    varying vec4 vClipPosition;
                ` + shader.vertexShader

                shader.vertexShader = shader.vertexShader.replace(
                    '#include <project_vertex>',
                    `
                    #include <project_vertex>
                    vClipPosition = gl_Position;
                `
                )

                shader.fragmentShader =
                    `
                    varying vec4 vClipPosition;
                    uniform float uMaskActive;
                    uniform vec3 uMaskOrigin;
                    uniform vec3 uMaskDir;
                    uniform float uMaskRadius;   // NDC radius (vertical)
                    uniform float uMaskMaxDist;  // unused for now
                    uniform float uMaskDebug;
                    uniform float uAspect;       // viewport aspect = width/height
                ` + shader.fragmentShader

                if (shader.fragmentShader.includes('void main() {')) {
                    console.log('[MagnifierRevealMaterial] patching main() for screen-space circle + debug (aspect-correct)')
                    shader.fragmentShader = shader.fragmentShader.replace(
                        'void main() {',
                        `
                        void main() {
                            if (uMaskActive <= 0.5) {
                                discard;
                            }

                            // per-fragment NDC from clip position
                            vec3 ndc = vClipPosition.xyz / vClipPosition.w;
                            vec2 fragNdc = ndc.xy;
                            vec2 lensNdc = uMaskOrigin.xy;

                            // compensate for aspect so the circle is round in pixels
                            vec2 diff = fragNdc - lensNdc;
                            diff.x *= uAspect;

                            float d = length(diff);

                            if (uMaskDebug > 0.5) {
                                float edgeWidth = 0.02;
                                float inner = uMaskRadius - edgeWidth;
                                float ring = smoothstep(inner, uMaskRadius, d);
                                float inside = 1.0 - step(uMaskRadius, d);

                                vec3 insideColor = vec3(0.0, 1.0, 0.0); // green
                                vec3 outsideColor = vec3(1.0, 0.0, 0.0); // red
                                vec3 ringColor = vec3(1.0, 1.0, 0.0); // yellow border

                                vec3 col = mix(outsideColor, insideColor, inside);
                                col = mix(col, ringColor, ring * (1.0 - inside));

                                gl_FragColor = vec4(col, 1.0);
                                return;
                            }

                            if (d > uMaskRadius) {
                                discard;
                            }
                        `
                    )
                } else {
                    console.warn(
                        '[MagnifierRevealMaterial] "void main() {" not found in fragmentShader'
                    )
                }

                if (materialRef.current) {
                    ;(materialRef.current as any).userData.shader = shader
                }
            }}
        />
    )
}

export default MagnifierRevealMaterial
