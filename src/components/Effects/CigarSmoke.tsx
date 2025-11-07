'use client'
import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { JSX } from 'react'

type Props = {
    visible?: boolean
    upAxis?: 'y' | 'z' | 'x'
    height?: number
    baseHalfWidth?: number
    topWidthMult?: number
    widthPow?: number

    swayAmp?: number
    swayFreq?: number
    swayPow?: number

    edgeWaveCycles?: number
    edgeWaveStrength?: number

    breatheAmp?: number
    speed?: number

    opacity?: number
    alphaPow?: number

    tiltBackDeg?: number

    footPinchFactor?: number
    footPinchV?: number
} & Omit<JSX.IntrinsicElements['group'], 'children'>

export default function CigarSmokeFlat({
                                           visible = true,
                                           upAxis = 'y',
                                           height = 0.20,
                                           baseHalfWidth = 0.008,
                                           topWidthMult = 2.0,
                                           widthPow = 0.6,

                                           swayAmp = 0.05,
                                           swayFreq = 0.08,
                                           swayPow = 1.4,

                                           edgeWaveCycles = 3.0,
                                           edgeWaveStrength = 0.18,

                                           breatheAmp = 0.003,
                                           speed = 1.0,

                                           opacity = 0.32,
                                           alphaPow = 1.35,

                                           tiltBackDeg = 0,

                                           footPinchFactor = 0.35,
                                           footPinchV = 0.12,
                                           ...rest
                                       }: Props) {
    const segU = 18, segV = 72
    const geo = React.useMemo(() => new THREE.PlaneGeometry(1, 1, segU, segV), [])
    React.useEffect(() => {
        ;(geo.attributes.position as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage)

        const uvs = new Float32Array((segU + 1) * (segV + 1) * 2)
        let k = 0
        for (let iy = 0; iy <= segV; iy++) {
            const v = iy / segV
            for (let ix = 0; ix <= segU; ix++) {
                const u = ix / segU
                uvs[k++] = u
                uvs[k++] = v
            }
        }
        geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

        return () => geo.dispose()
    }, [geo, segU, segV])

    const mat = React.useMemo(() => {
        const uniforms = {
            uColor: { value: new THREE.Color('#ffffff') },
            uOpacity: { value: opacity },
            uAlphaPow: { value: alphaPow },
        }
        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
            fragmentShader: `
        varying vec2 vUv;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uAlphaPow;
        void main(){
          // vUv.y = 0 at base, 1 at top  → fade out as it rises
          float a = uOpacity * pow(1.0 - clamp(vUv.y, 0.0, 1.0), uAlphaPow);
          if (a <= 0.001) discard;
          gl_FragColor = vec4(uColor, a);
        }`,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
        })
    }, [])
    React.useEffect(() => {
        (mat.uniforms.uOpacity.value as number) = opacity
        ;(mat.uniforms.uAlphaPow.value as number) = alphaPow
        mat.needsUpdate = true
    }, [mat, opacity, alphaPow])
    React.useEffect(() => () => mat.dispose(), [mat])

    const phase0 = React.useRef(Math.random() * Math.PI * 2)

    const setByAxis = React.useMemo(() => {
        if (upAxis === 'y') return (a: THREE.BufferAttribute, i: number, X: number, Y: number) => a.setXYZ(i, X, Y, 0)
        if (upAxis === 'z') return (a: THREE.BufferAttribute, i: number, X: number, Y: number) => a.setXYZ(i, X, 0, Y)
        return (a: THREE.BufferAttribute, i: number, X: number, Y: number) => a.setXYZ(i, Y, X, 0) // x-up
    }, [upAxis])

    const smoothstep = (x: number) => {
        const t = THREE.MathUtils.clamp(x, 0, 1)
        return t * t * (3 - 2 * t)
    }

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * speed
        const pos = geo.attributes.position as THREE.BufferAttribute

        const mix = THREE.MathUtils.lerp
        const ease = (v: number, p = widthPow) => Math.pow(THREE.MathUtils.clamp(v, 0, 1), p)

        const swayFn = (v: number) =>
            Math.sin((phase0.current + t * Math.PI * 2 * swayFreq) + v * 1.7) *
            swayAmp *
            Math.pow(v, swayPow)

        for (let iy = 0; iy <= segV; iy++) {
            const v = iy / segV
            const Y = v * height

            const growHalf = baseHalfWidth * mix(1, topWidthMult, ease(v))

            const pinchT = smoothstep(footPinchV <= 0 ? 1 : Math.min(1, v / footPinchV))
            const pinchMult = THREE.MathUtils.lerp(footPinchFactor, 1, pinchT)

            const breathe = Math.sin(t * 0.9 + v * 2.3) * breatheAmp * v

            const halfW = Math.max(0.001, growHalf * pinchMult + breathe)

            const cx = swayFn(v)

            const edgePhase = (v * edgeWaveCycles + t * 0.12) * Math.PI * 2
            const edgeOffset = Math.sin(edgePhase) * halfW * edgeWaveStrength

            for (let ix = 0; ix <= segU; ix++) {
                const i = iy * (segU + 1) + ix
                const u = (ix / segU) * 2 - 1
                const onEdge = Math.abs(u) > 0.95
                const wav = onEdge ? Math.sign(u) * edgeOffset : 0
                const X = cx + u * halfW + wav
                setByAxis(pos, i, X, Y)
            }
        }
        pos.needsUpdate = true
    })

    return (
        <group visible={visible} rotation={[THREE.MathUtils.degToRad(-tiltBackDeg), 0, 0]} {...rest}>
            <mesh geometry={geo} material={mat} />
        </group>
    )
}
