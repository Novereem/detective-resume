import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { useRef, useMemo } from 'react'
import { OutlineShader } from './OutlineShader'

export function DeferredOutlineComposer() {
    const { gl, scene, camera, size } = useThree()
    const quadRef = useRef<FullScreenQuad | null>(null)

    // 1) allocate three render-targets
    const [colorRT, normalRT, flatRT] = useMemo(() => {
        const opts = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format:    THREE.RGBAFormat
        }
        const A = new THREE.WebGLRenderTarget(size.width, size.height, opts)
        const B = new THREE.WebGLRenderTarget(size.width, size.height, opts)
        const C = new THREE.WebGLRenderTarget(size.width, size.height, opts)
        return [A, B, C] as const
    }, [size.width, size.height])

    // 2) build a RawShaderMaterial from our OutlineShader
    const outlineMat = useMemo(() => {
        return new THREE.RawShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(OutlineShader.uniforms),
            vertexShader:   OutlineShader.vertexShader,
            fragmentShader: OutlineShader.fragmentShader,
        })
    }, [])

    // 3) create the full-screen quad once
    useMemo(() => {
        quadRef.current = new FullScreenQuad(outlineMat)
    }, [outlineMat])

    // 4) on each frame, do the three passes + composite
    useFrame(() => {
        // ——— Pass 1: lit scene ——————————————————————
        gl.setRenderTarget(colorRT)
        gl.clear()
        gl.render(scene, camera)

        // ——— Pass 2: normals ——————————————————————
        scene.overrideMaterial = new THREE.MeshNormalMaterial()
        gl.setRenderTarget(normalRT)
        gl.clear()
        gl.render(scene, camera)
        scene.overrideMaterial = null

        // ——— Pass 3: flat per-object hue —————————————————
        scene.traverse((o) => {
            if ((o as THREE.Mesh).isMesh) {
                const m = o as THREE.Mesh
                m.userData.__oldMat = m.material
                const col = (m.userData.outlineColor as THREE.Color) ?? new THREE.Color(1,1,1)
                m.material = new THREE.MeshBasicMaterial({ color: col })
            }
        })
        gl.setRenderTarget(flatRT)
        gl.clear()
        gl.render(scene, camera)
        // restore originals
        scene.traverse((o) => {
            if ((o as THREE.Mesh).isMesh) {
                const m = o as THREE.Mesh
                m.material = m.userData.__oldMat
                delete m.userData.__oldMat
            }
        })

        // ——— Final composite ————————————————————————
        gl.setRenderTarget(null)
        outlineMat.uniforms.tColor.value         = colorRT.texture
        outlineMat.uniforms.tNormal.value        = normalRT.texture
        outlineMat.uniforms.tOutlineColor.value  = flatRT.texture
        outlineMat.uniforms.resolution.value.set(size.width, size.height)
        quadRef.current!.render(gl)
    }, 1)

    return null
}
