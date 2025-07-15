import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass }   from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass }   from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutlineShader } from '@/shaders/OutlineShader'   // adjust path if needed

export function OutlinePass ({
                                 edgeThickness = 1,         // pixels – 1-2 looks clean
                                 baseThreshold = 0.02,      // adaptive gap in metres
                                 outlineColor  = '#ffffff', // silhouette colour
                             }) {

    /* R3F handles ---------------------------------------------------- */
    const { gl, scene, camera, size } = useThree()

    /* composer + render-target refs ---------------------------------- */
    const composer    = useRef()
    const colorTarget = useRef()

    /* --------------------------------------------------------------- */
    /* setup / dispose whenever size or params change                  */
    /* --------------------------------------------------------------- */
    useEffect(() => {

        /* 1) colour + depth render-target ----------------------------- */
        colorTarget.current = new THREE.WebGLRenderTarget(size.width, size.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format   : THREE.RGBAFormat,
        })
        colorTarget.current.depthTexture = new THREE.DepthTexture(size.width, size.height)
        colorTarget.current.depthTexture.type = THREE.UnsignedShortType

        /* 2) effect composer ------------------------------------------ */
        composer.current = new EffectComposer(gl, colorTarget.current)
        composer.current.setSize(size.width, size.height)

        const renderPass  = new RenderPass(scene, camera)
        const outlinePass = new ShaderPass(OutlineShader)

        /* 3) wire uniforms -------------------------------------------- */
        outlinePass.uniforms.tDepth.value        = colorTarget.current.depthTexture
        outlinePass.uniforms.resolution.value.set(size.width, size.height)
        outlinePass.uniforms.cameraNear.value    = camera.near
        outlinePass.uniforms.cameraFar.value     = camera.far
        outlinePass.uniforms.edgeThickness.value = edgeThickness
        outlinePass.uniforms.baseThreshold.value = baseThreshold
        outlinePass.uniforms.outlineColor.value  = new THREE.Color(outlineColor)

        composer.current.addPass(renderPass)
        composer.current.addPass(outlinePass)

        /* cleanup on unmount / param change --------------------------- */
        return () => {
            composer.current?.dispose()
            colorTarget.current?.dispose()
        }
    }, [gl, scene, camera,
        size.width, size.height,
        edgeThickness, baseThreshold, outlineColor])

    /* --------------------------------------------------------------- */
    /* render once each frame                                          */
    /* --------------------------------------------------------------- */
    useFrame(() => {
        composer.current?.render()
    }, 1)

    return null
}