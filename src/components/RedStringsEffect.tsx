"use client"
import React from "react"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"
import { ANCHOR } from "@/components/Game/anchors"
import { useGameState } from "@/components/Game/state"
import type { PuzzleId } from "@/components/Types/game"
import type { PuzzleConfig } from "@/components/Game/state.data"

const ROPE_TEX_URL = "/textures/basket_weave.jpg"

type Props = {
    zoom?: number
    vRepeat?: number
    contrast?: number
    brightness?: number
    baseUnit?: number
    radius?: number
}

export default function RedStringsEffect({
                                             zoom = 0.35,
                                             vRepeat = 2.0,
                                             contrast = 1.4,
                                             brightness = 0.02,
                                             baseUnit = 0.08,
                                             radius = 0.0035,
                                         }: Props) {
    const { puzzlesConfig, puzzleStatus } = useGameState()
    const { gl } = useThree()
    const maxAniso = gl.capabilities.getMaxAnisotropy()

    const [ropeBaseMap, setRopeBaseMap] = React.useState<THREE.Texture | undefined>(undefined)
    React.useEffect(() => {
        if (typeof window === "undefined") return
        let mounted = true
        const loader = new THREE.TextureLoader()
        loader.load(
            ROPE_TEX_URL,
            (tex) => {
                if (!mounted) return
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping
                setRopeBaseMap(tex)
            },
            undefined,
            () => mounted && setRopeBaseMap(undefined)
        )
        return () => { mounted = false }
    }, [])

    const localPinOffset = React.useCallback((cfg: PuzzleConfig) => {
        const h = cfg.view.height
        const b = cfg.view.border ?? 0.01
        return new THREE.Vector3(0, h / 2 + b * 0.5, 0.015)
    }, [])

    const worldPinPos = React.useCallback((cfg: PuzzleConfig) => {
        const anchor = ANCHOR[cfg.wallAnchorKey]
        const baseRot = (anchor.rotation ?? [0, 0, 0]) as [number, number, number]
        const yFlip   = cfg.view.rotateY180WhenPinned ? Math.PI : 0
        const rot = new THREE.Euler(baseRot[0], baseRot[1] + yFlip, baseRot[2], "XYZ")
        const pos = new THREE.Vector3(...(anchor.position as [number, number, number]))
        const off = localPinOffset(cfg).applyEuler(rot)
        return pos.add(off)
    }, [localPinOffset])

    type Edge = [PuzzleId, PuzzleId]
    const edges = React.useMemo(() => {
        const e: Edge[] = []
        const seen = new Set<string>()
        for (const cfg of Object.values(puzzlesConfig)) {
            const a: PuzzleId = cfg.id
            if (!puzzleStatus[a]?.pinned) continue
            for (const b of (cfg.connectsTo ?? [])) {
                if (!puzzleStatus[b]?.pinned) continue
                const key = a < b ? `${a}|${b}` : `${b}|${a}`
                if (!seen.has(key)) { seen.add(key); e.push(a < b ? [a, b] as Edge : [b, a] as Edge) }
            }
        }
        return e
    }, [puzzlesConfig, puzzleStatus])

    return (
        <group>
            {edges.map(([a, b]) => {
                const A = puzzlesConfig[a]
                const B = puzzlesConfig[b]
                const p1 = worldPinPos(A)
                const p2 = worldPinPos(B)

                const len = p2.distanceTo(p1)
                const sag = Math.min(0.02, len * 0.12)

                const mid = p1.clone().add(p2).multiplyScalar(0.5)
                const ctrl = mid.clone().add(new THREE.Vector3(0, -sag, 0))
                const curve = new THREE.QuadraticBezierCurve3(p1, ctrl, p2)

                const tubularSegments = Math.max(12, Math.floor(len * 80))
                const radialSegments = 12

                const edgeMap = ropeBaseMap ? ropeBaseMap.clone() : undefined
                if (edgeMap) {
                    edgeMap.wrapS = edgeMap.wrapT = THREE.RepeatWrapping

                    const uRepeat = Math.max(0.25, (len / baseUnit) * zoom)
                    edgeMap.repeat.set(uRepeat, vRepeat)

                    edgeMap.anisotropy = Math.min(8, maxAniso)
                    edgeMap.generateMipmaps = true
                    edgeMap.minFilter = THREE.LinearMipmapLinearFilter
                    edgeMap.magFilter = THREE.LinearFilter
                    edgeMap.needsUpdate = true
                }

                return (
                    <mesh key={`${a}->${b}`}>
                        <tubeGeometry args={[curve, tubularSegments, radius, radialSegments, false]} />
                        <RopeMaterial
                            map={edgeMap}
                            color={"#d61326"}
                            contrast={contrast}
                            brightness={brightness}
                        />
                    </mesh>
                )
            })}
        </group>
    )
}

function RopeMaterial({
                          map,
                          color = "#d61326",
                          contrast = 1.0,
                          brightness = 0.0,
                      }: {
    map?: THREE.Texture
    color?: THREE.ColorRepresentation
    contrast?: number
    brightness?: number
}) {
    const matRef = React.useRef<THREE.MeshStandardMaterial>(null)

    React.useEffect(() => {
        const mat = matRef.current
        if (!mat) return

        mat.onBeforeCompile = (shader) => {
            shader.uniforms.uContrast = { value: contrast }
            shader.uniforms.uBrightness = { value: brightness }

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `#include <common>
uniform float uContrast;
uniform float uBrightness;`
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>',
                `
        #ifdef USE_MAP
          vec4 texelColor = texture2D( map, vMapUv );
          // apply contrast/brightness in the same space as diffuseColor (renderer handles color space)
          texelColor.rgb = (texelColor.rgb - 0.5) * uContrast + 0.5 + uBrightness;
          diffuseColor *= texelColor;
        #endif
        `
            )

            ;(mat as any).userData.shader = shader
        }

        mat.needsUpdate = true
    }, [])

    React.useEffect(() => {
        const shader = (matRef.current as any)?.userData?.shader
        if (shader) {
            shader.uniforms.uContrast.value = contrast
            shader.uniforms.uBrightness.value = brightness
        }
    }, [contrast, brightness])

    return (
        <meshStandardMaterial
            ref={matRef}
            color={color}
            map={map}
            metalness={0.1}
            roughness={0.8}
        />
    )
}
