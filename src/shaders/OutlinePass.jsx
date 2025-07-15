import React, { useRef, useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass }   from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass }   from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutlineShader } from './OutlineShader'

export function OutlinePass({
                                edgeThickness   = 1.0,
                                depthThreshold  = 0.01,
                                normalThreshold = 0.1,
                                outlineColor    = '#ff0000',
                            }) {
    const { gl, scene, camera, size } = useThree()
    const composer = useRef()

    // RenderTarget for depth + color (composer uses this internally)
    const colorTarget = useRef()
    // RenderTarget for normals
    const normalTarget = useRef()

    // A shared MeshNormalMaterial for the override pass
    const normalMaterial = useMemo(() => new THREE.MeshNormalMaterial(), [])

    useEffect(() => {
        // 1) Color+Depth target
        colorTarget.current = new THREE.WebGLRenderTarget(size.width, size.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
        })
        colorTarget.current.depthTexture = new THREE.DepthTexture(size.width, size.height)
        colorTarget.current.depthTexture.type = THREE.UnsignedShortType

        // 2) Normals target
        normalTarget.current = new THREE.WebGLRenderTarget(size.width, size.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,       // we’ll pack normals into RGB
        })

        // 3) Composer setup
        composer.current = new EffectComposer(gl, colorTarget.current)
        composer.current.setSize(size.width, size.height)

        const renderPass = new RenderPass(scene, camera)
        const outlinePass = new ShaderPass(OutlineShader)

        // hook up our three buffers into the outline shader uniforms
        outlinePass.uniforms.tDepth.value       = colorTarget.current.depthTexture
        outlinePass.uniforms.tNormal.value      = normalTarget.current.texture
        outlinePass.uniforms.resolution.value.set(size.width, size.height)
        outlinePass.uniforms.cameraNear.value   = camera.near
        outlinePass.uniforms.cameraFar.value    = camera.far
        outlinePass.uniforms.edgeThickness.value  = edgeThickness
        outlinePass.uniforms.depthThreshold.value = depthThreshold
        outlinePass.uniforms.normalThreshold.value= normalThreshold
        outlinePass.uniforms.outlineColor.value   = new THREE.Color(outlineColor)

        composer.current.addPass(renderPass)
        composer.current.addPass(outlinePass)

        return () => {
            composer.current.dispose()
            colorTarget.current.dispose()
            normalTarget.current.dispose()
        }
    }, [
        gl, scene, camera, size.width, size.height,
        edgeThickness, depthThreshold, normalThreshold, outlineColor
    ])

    // each frame: first draw normals, then do composer.render()
    useFrame(() => {
        // nothing to do until both targets & composer are created
        if (!normalTarget.current || !composer.current) return

        // 1) render normals
        const old = scene.overrideMaterial
        scene.overrideMaterial = normalMaterial
        gl.setRenderTarget(normalTarget.current)
        gl.clear()
        gl.render(scene, camera)
        scene.overrideMaterial = old

        // 2) run composer
        gl.setRenderTarget(null)
        composer.current.render()
    }, 1)

    return null
}