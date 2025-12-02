import React, { useMemo } from 'react'
import { EffectComposer } from '@react-three/postprocessing'
import { Effect } from 'postprocessing'
import { Uniform, Vector2 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'

/**
 * Postprocessing Effect that applies nearest-neighbor pixelation in screen space.
 *
 * Responsibilities:
 * - Allocate a small custom `Effect` with uniforms:
 *   - `size` (block size in screen pixels),
 *   - `resolution` (current render buffer size in pixels).
 * - On each frame:
 *   - update `resolution` using the R3F renderer + devicePixelRatio,
 *   - clamp `size` to a minimum of 2 pixels (avoid degenerate behavior),
 *   - sample the input buffer at a single representative pixel per block,
 *     so the result is crisp even with fractional sizes.
 *
 * Used inside PixelateNearestFX and not exported on its own.
 */
function NearestPixelate({ size = 6 }: { size?: number }) {
    const { gl, size: viewport } = useThree()

    const effect = useMemo(() => {
        const fragment = /* glsl */ `
        uniform float size;
        uniform vec2  resolution;
        
        void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
          // Convert current fragment to pixel coords
          vec2 fragPix = uv * resolution;
        
          // Which "block" are we in if blocks are 'size' pixels wide?
          vec2 blockIndex = floor(fragPix / size);
        
          // Start of this block in pixel space
          vec2 blockStart = blockIndex * size;
        
          // Pick a representative *pixel index* near the block center
          vec2 repPix = floor(blockStart + 0.5 * size);
        
          // Sample exactly at pixel centers -> crisp even with fractional 'size'
          vec2 centerUV = (repPix + 0.5) / resolution;
          outputColor = texture2D(inputBuffer, centerUV);
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
        effect.uniforms.get('size')!.value = Math.max(2, size)
    })

    return <primitive object={effect} />
}

/**
 * Top-level postprocessing wrapper that enables nearest-neighbor pixelation.
 *
 * Responsibilities:
 * - Render an EffectComposer with the `NearestPixelate` effect when `size > 1`.
 * - Short-circuit (return `null`) for `size <= 1` so no postprocessing is
 *   attached to the scene.
 *
 * Typical usage:
 * - Wrap your main scene in `<PixelateNearestFX size={...} />` to toggle and
 *   tune the pixelation strength.
 */
export function PixelateNearestFX({ size = 6 }: { size?: number }) {
    if (size <= 1) return null
    return (
        <EffectComposer multisampling={0} enableNormalPass={false}>
            <NearestPixelate size={size} />
        </EffectComposer>
    )
}