import React, { useMemo } from 'react'
import { EffectComposer } from '@react-three/postprocessing'
import { Effect } from 'postprocessing'
import { Uniform, Vector2 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'

/** Nearest-neighbor pixelation. `size` is block size in screen pixels. */
function NearestPixelate({ size = 6 }: { size?: number }) {
    const { gl, size: viewport } = useThree()

    const effect = useMemo(() => {
        const fragment = /* glsl */ `
      // DO NOT redeclare inputBuffer here; postprocessing provides it.
      uniform float size;
      uniform vec2 resolution;

      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec2 stepUV = vec2(size) / resolution;
        vec2 blockUV = (floor(uv / stepUV) + 0.5) * stepUV; // center of each block
        outputColor = texture2D(inputBuffer, blockUV);
      }
    `
        const uniforms = new Map<string, Uniform>([
            ['size', new Uniform(size)],
            ['resolution', new Uniform(new Vector2(1, 1))],
        ])
        return new Effect('NearestPixelate', fragment, { uniforms })
    }, [])

    useFrame(() => {
        // Use drawing buffer size to respect devicePixelRatio
        const res = effect.uniforms.get('resolution')!.value as Vector2
        const dpr = gl.getPixelRatio()
        res.set(viewport.width * dpr, viewport.height * dpr)
        effect.uniforms.get('size')!.value = Math.max(2, Math.floor(size))
    })

    return <primitive object={effect} />
}

export function PixelateNearestFX({ size = 6 }: { size?: number }) {
    if (size <= 1) return null
    return (
        <EffectComposer multisampling={0} enableNormalPass={false}>
            <NearestPixelate size={size} />
        </EffectComposer>
    )
}