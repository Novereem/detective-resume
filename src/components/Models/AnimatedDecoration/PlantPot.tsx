'use client'
import React, {memo, useMemo, useRef, useEffect, JSX} from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'
import {useManagedTexture} from "@/components/Textures/useManagedTexture";
import {useQuality} from "@/components/Settings/QualityContext";

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type PlantBambooProps = Inherited & {
    // Pot
    radiusTop?: number; radiusBottom?: number; height?: number
    wall?: number; lipH?: number; lipOverhang?: number
    soilInset?: number; soilT?: number

    // Culms
    stalkCount?: number
    stalkHeight?: [number, number]
    stalkRadius?: [number, number]
    stalkTaper?: number
    nodeEvery?: number
    nodeJitter?: number
    nodeThick?: number

    // Branches
    branchesPerNode?: [number, number]
    branchLen?: [number, number]
    branchRadius?: [number, number]
    branchUpTiltDeg?: [number, number]
    branchSpreadDeg?: number

    // Leaves
    leavesPerBranch?: [number, number]
    leafLen?: [number, number]
    leafWidth?: [number, number]
    leafTiltDeg?: [number, number]
    leafColor?: string
    leafTextureUrl?: string
    leafAlphaUrl?: string
    leafAlphaTest?: number

    // Motion
    sway?: boolean
    swayAmpDeg?: number
    swaySpeed?: number

    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const PlantBamboo = memo(function PlantBamboo({
                                                         // pot
                                                         radiusTop = 0.09, radiusBottom = 0.06, height = 0.12,
                                                         wall = 0.006, lipH = 0.012, lipOverhang = 0.008,
                                                         soilInset = 0.008, soilT = 0.02,

                                                         // culms
                                                         stalkCount = 5,
                                                         stalkHeight = [0.45, 0.65],
                                                         stalkRadius = [0.007, 0.011],
                                                         stalkTaper = 0.78,
                                                         nodeEvery = 0.08,
                                                         nodeJitter = 0.25,
                                                         nodeThick = 0.006,

                                                         // branches
                                                         branchesPerNode = [1, 2],
                                                         branchLen = [0.10, 0.18],
                                                         branchRadius = [0.002, 0.0035],
                                                         branchUpTiltDeg = [12, 28],
                                                         branchSpreadDeg = 35,

                                                         // leaves
                                                         leavesPerBranch = [1, 2],
                                                         leafLen = [0.08, 0.14],
                                                         leafWidth = [0.018, 0.028],
                                                         leafTiltDeg = [5, 22],
                                                         leafColor = '#2f5f3b',
                                                         leafTextureUrl,
                                                         leafAlphaUrl = '#ffffff',
                                                         leafAlphaTest = 0.8,

                                                         // motion
                                                         sway = true,
                                                         swayAmpDeg = 4,
                                                         swaySpeed = 0.5,

                                                         color = '#ffffff',
                                                         outlineColor = '#ffffff',
                                                         hoverColor = '#ff3b30',
                                                         outlineScale = 1.03,
                                                         initialRotation = [0, 0, 0] as Vec3,
                                                         materialsById,
                                                         ...rest
                                                     }: PlantBambooProps) {
    const quality = useQuality()
    const showBranchesAndLeaves = quality === 'high'
    const showNodes = quality !== 'low'

    const innerTopR = Math.max(0.02, radiusTop - wall)

    const lipGeom = React.useMemo(() => {
        const R_OUT = radiusTop + lipOverhang
        const R_IN  = Math.max(0.01, (radiusTop - wall))

        // 2D ring with a hole
        const outer = new THREE.Shape()
        outer.absarc(0, 0, R_OUT, 0, Math.PI * 2, false)
        const hole = new THREE.Path()
        hole.absarc(0, 0, R_IN, 0, Math.PI * 2, true)
        outer.holes.push(hole)

        const g = new THREE.ExtrudeGeometry(outer, {
            depth: lipH,
            bevelEnabled: false,
            curveSegments: 64,
        })
        g.translate(0, 0, -lipH / 2)
        g.rotateX(Math.PI / 2)
        g.computeVertexNormals()
        return g
    }, [radiusTop, wall, lipOverhang, lipH])

    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []

        // Outer pot shell
        p.push({
            id: 'potBody',
            geometry: <cylinderGeometry args={[radiusTop, radiusBottom, height - lipH, 64, 1, true]} />,
            position: [0, (-(height) / 2) + (height - lipH) / 2, 0],
            color, outlineColor, roughness: 0.85, metalness: 0.05,
        })

        // Top lip
        p.push({
            id: 'potLipOuter',
            geometry: <primitive object={lipGeom} />,
            position: [0, +height / 2 - lipH / 2, 0],
            color, outlineColor, roughness: 0.85, metalness: 0.05,
        })
        const sleeveH = Math.min(0.035, height - lipH - 0.005)
        p.push({
            id: 'potInnerSleeve',
            geometry: <cylinderGeometry args={[innerTopR, Math.max(0.01, radiusBottom - wall), sleeveH, 48, 1, true]} />,
            position: [0, +height / 2 - lipH - sleeveH / 2, 0],
            color, outlineColor, roughness: 0.85, metalness: 0.05,
        })

        // Soil disc
        const soilR = Math.max(0.02, innerTopR - soilInset + 0.012)
        p.push({
            id: 'soil',
            geometry: <cylinderGeometry args={[soilR, soilR-0.01, soilT, 48]} />,
            position: [0, +height / 2 - lipH - soilT / 2 - 0.002, 0],
            color: '#3b2f28',
            outlineColor, roughness: 1.0, metalness: 0.0,
        })

        // Bottom base/cap
        p.push({
            id: 'potBase',
            geometry: <cylinderGeometry args={[radiusBottom + 0.006, radiusBottom + 0.006, 0.008, 32]} />,
            position: [0, -height / 2 - 0.004, 0],
            color, outlineColor, roughness: 0.85, metalness: 0.05,
        })

        return p
    }, [radiusTop, radiusBottom, height, lipH, lipOverhang, innerTopR, soilInset, soilT, color, outlineColor])


    const hitbox: { size: Vec3; center: Vec3 } = {
        size: [radiusTop * 2, height, radiusTop * 2] as Vec3,
        center: [0, 0, 0],
    }

    function rng(seed: number) {
        return () => {
            seed |= 0; seed = (seed + 0x6D2B79F5) | 0
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
            t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296
        }
    }

    // Soil plane (Y)
    const ySoil = +height / 2 - lipH - soilT

    // CULMS + NODES (with jitter)
    const culms = useMemo(() => {
        const rand = rng(4)
        const rMax = Math.max(0.02, innerTopR - soilInset * 0.5)
        const rMin = 0.01
        const out: {
            base: THREE.Vector3; H: number; Rb: number; Rt: number; nodes: number[]
        }[] = []

        for (let s = 0; s < stalkCount; s++) {
            const ang = rand() * Math.PI * 2
            const rad = THREE.MathUtils.lerp(rMin, rMax, Math.sqrt(rand()))
            const base = new THREE.Vector3(Math.cos(ang) * rad, ySoil, Math.sin(ang) * rad)
            const H = THREE.MathUtils.lerp(stalkHeight[0], stalkHeight[1], rand())
            const Rb = THREE.MathUtils.lerp(stalkRadius[0], stalkRadius[1], rand())
            const Rt = Rb * THREE.MathUtils.clamp(stalkTaper, 0.5, 0.98)

            // irregular node spacing
            const nodes: number[] = []
            let y = ySoil + THREE.MathUtils.lerp(nodeEvery * (1 - nodeJitter), nodeEvery * (1 + nodeJitter), rand())
            while (y < ySoil + H - nodeEvery * 0.6) {
                nodes.push(y)
                y += THREE.MathUtils.lerp(nodeEvery * (1 - nodeJitter), nodeEvery * (1 + nodeJitter), rand())
            }

            out.push({ base, H, Rb, Rt, nodes })
        }
        return out
    }, [stalkCount, innerTopR, soilInset, ySoil, stalkHeight, stalkRadius, stalkTaper, nodeEvery, nodeJitter])

    const culmOv = (materialsById as any)?.culm ?? {}
    const culmMap        = useManagedTexture(culmOv.textureUrl)
    const culmNormalMap  = useManagedTexture(culmOv.normalUrl)
    const culmRoughMap   = useManagedTexture(culmOv.roughnessUrl)

    const culmMat = React.useMemo(() => {
        const m = new THREE.MeshStandardMaterial({
            color: new THREE.Color(culmOv.color ?? '#2e6b3a'),
            roughness: culmOv.roughness ?? 0.7,
            metalness: culmOv.metalness ?? 0.0,
        })
        if (culmMap) {
            m.map = culmMap
            culmMap.wrapS = THREE.RepeatWrapping
            culmMap.wrapT = THREE.RepeatWrapping
            culmMap.anisotropy = 4
            culmMap.repeat.set(1, culmOv.repeatV ?? 3)
            culmMap.needsUpdate = true
        }
        if (culmNormalMap) {
            m.normalMap = culmNormalMap
            culmNormalMap.wrapS = THREE.RepeatWrapping
            culmNormalMap.wrapT = THREE.RepeatWrapping
        }
        if (culmRoughMap) {
            m.roughnessMap = culmRoughMap
            culmRoughMap.wrapS = THREE.RepeatWrapping
            culmRoughMap.wrapT = THREE.RepeatWrapping
        }
        m.needsUpdate = true
        return m
    }, [culmMap, culmNormalMap, culmRoughMap, culmOv.color, culmOv.roughness, culmOv.metalness, culmOv.repeatV])

    const StalksAndNodes = useMemo(() => {
        const items: JSX.Element[] = []
        const rand = rng(999)

        const ringColors = ['#235723', '#2f6b39']

        culms.forEach((c, idx) => {
            items.push(
                <mesh key={`culm_${idx}`} position={[c.base.x, c.base.y + c.H / 2, c.base.z]} material={culmMat} castShadow receiveShadow={false}>
                    <cylinderGeometry args={[c.Rt, c.Rb, c.H, 12]}/>
                </mesh>
            )
            if (showNodes) {
                c.nodes.forEach((ny, i) => {
                    const col = ringColors[Math.floor(rand() * ringColors.length)]
                    const rMul = THREE.MathUtils.lerp(1.0, 1.08, rand())
                    items.push(
                        <mesh key={`node_${idx}_${i}`} position={[c.base.x, ny, c.base.z]} castShadow receiveShadow={false}>
                            <cylinderGeometry args={[c.Rb * rMul, c.Rb * rMul, nodeThick, 12]} />
                            <meshStandardMaterial color={col} roughness={0.6} metalness={0.05} />
                        </mesh>
                    )
                })
            }
        })
        return <group>{items}</group>
    }, [culms, nodeThick, culmMat, showNodes])

    // YELLOW TWIGS
    type Branch = { pos: THREE.Vector3; quat: THREE.Quaternion; len: number; rad: number; phase: number }
    const branches = useMemo<Branch[]>(() => {
        if (!showBranchesAndLeaves) return []
        const rand = rng(5678)
        const arr: Branch[] = []

        culms.forEach((c) => {
            const normal = new THREE.Vector2(c.base.x, c.base.z).normalize()
            c.nodes.forEach((ny) => {
                const count = Math.floor(THREE.MathUtils.lerp(branchesPerNode[0], branchesPerNode[1], rand()))
                for (let k = 0; k < count; k++) {
                    const yaw = rand() * Math.PI * 2
                    const upTilt = THREE.MathUtils.degToRad(
                        THREE.MathUtils.lerp(branchUpTiltDeg[0], branchUpTiltDeg[1], rand())
                    )

                    const dir = new THREE.Vector3(
                        Math.cos(yaw) * Math.cos(upTilt),
                        Math.sin(upTilt),
                        Math.sin(yaw) * Math.cos(upTilt)
                    ).normalize()
                    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)

                    const len = THREE.MathUtils.lerp(branchLen[0], branchLen[1], rand())
                    const rad = THREE.MathUtils.lerp(branchRadius[0], branchRadius[1], rand())

                    const radial = new THREE.Vector2(Math.cos(yaw), Math.sin(yaw))
                    const base = new THREE.Vector3(
                        c.base.x + radial.x * (c.Rb * 1.02),
                        ny,
                        c.base.z + radial.y * (c.Rb * 1.02)
                    )

                    arr.push({ pos: base, quat: q, len, rad, phase: rand() * Math.PI * 2 })
                }
            })
        })
        return arr
    }, [culms, branchesPerNode, branchLen, branchRadius, branchUpTiltDeg, branchSpreadDeg, showBranchesAndLeaves])

    const BranchMeshes = useMemo(() => {
        return (
            <group>
                {branches.map((b, i) => {
                    const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(b.quat)
                    const pos = b.pos.clone().addScaledVector(dir, b.len / 2)
                    return (
                        <mesh key={`branch_${i}`} position={pos.toArray()} quaternion={b.quat} castShadow receiveShadow={false}>
                            <cylinderGeometry args={[b.rad, b.rad, b.len, 8]} />
                            <meshStandardMaterial color="#d0b85a" roughness={0.6} metalness={0.05} />
                        </mesh>
                    )
                })}
            </group>
        )
    }, [branches])

    const leafGeom = useMemo(() => {
        const s = new THREE.Shape()

        s.moveTo(0, -0.5)
        s.lineTo(0,  0.5)

        s.quadraticCurveTo(0.95,  0.50,  0.98,  0.00)
        s.quadraticCurveTo(0.95, -0.50,  0.00, -0.50)

        const g = new THREE.ShapeGeometry(s, 24)

        g.computeBoundingBox()
        const bb = g.boundingBox!
        const sizeX = bb.max.x - bb.min.x
        const sizeY = bb.max.y - bb.min.y
        const pos = g.attributes.position as THREE.BufferAttribute
        const uv: number[] = []
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), y = pos.getY(i)
            uv.push((x - bb.min.x) / sizeX, (y - bb.min.y) / sizeY)
        }
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
        g.computeVertexNormals()
        return g
    }, [])

    const leafMatOverride = (materialsById as any)?.leaf ?? {}
    const leafColorFinal   = leafMatOverride.color ?? leafColor
    const leafRough        = leafMatOverride.roughness ?? 0.7
    const leafMetal        = leafMatOverride.metalness ?? 0.0
    const leafAlphaTestVal = leafMatOverride.alphaTest ?? 0.3

    const leafMap   = useManagedTexture(leafMatOverride.textureUrl)
    const leafAlpha = useManagedTexture(leafMatOverride.alphaUrl)

    const leafMat = React.useMemo(() => {
        const m = new THREE.MeshStandardMaterial({
            color: new THREE.Color(leafColorFinal),
            roughness: leafRough,
            metalness: leafMetal,
            side: THREE.DoubleSide,
            transparent: !!leafAlpha || !!leafMatOverride.alphaUrl,
            alphaTest: !!leafAlpha || !!leafMatOverride.alphaUrl ? leafAlphaTestVal : 0.0,
            polygonOffset: true,
            polygonOffsetFactor: -1,
        })
        if (leafMap)   m.map = leafMap
        if (leafAlpha) m.alphaMap = leafAlpha
        m.needsUpdate = true
        return m
    }, [leafColorFinal, leafRough, leafMetal, leafAlphaTestVal, leafMap, leafAlpha, leafMatOverride.alphaUrl])

    type LeafAnchor = { pos: THREE.Vector3; quat: THREE.Quaternion; len: number; wid: number; phase: number }
    const leafAnchors = useMemo<LeafAnchor[]>(() => {
        if (!showBranchesAndLeaves) return []
        const rand = rng(91011)
        const arr: LeafAnchor[] = []

        branches.forEach((b) => {
            const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(b.quat)
            const tip = b.pos.clone().addScaledVector(dir, b.len)

            const total = Math.max(1, Math.floor(THREE.MathUtils.lerp(leavesPerBranch[0], leavesPerBranch[1], rand())))
            const sideCount = Math.max(0, total - 1)

            // 1) TIP LEAF
            {
                const len = THREE.MathUtils.lerp(leafLen[0],  leafLen[1],  rand())
                const wid = THREE.MathUtils.lerp(leafWidth[0], leafWidth[1], rand())

                const dirBranch = new THREE.Vector3(0, 1, 0).applyQuaternion(b.quat)
                const outwardXZ = new THREE.Vector3(dirBranch.x, 0, dirBranch.z)
                if (outwardXZ.lengthSq() < 1e-6) outwardXZ.set(1, 0, 0)
                outwardXZ.normalize()

                const up = new THREE.Vector3(0, 1, 0)
                const side = new THREE.Vector3().crossVectors(up, outwardXZ).normalize()
                const basis = new THREE.Matrix4().makeBasis(outwardXZ, side, up) // (X,Y,Z)
                const q = new THREE.Quaternion().setFromRotationMatrix(basis)

                const downPitch = THREE.MathUtils.degToRad(8)
                q.multiply(new THREE.Quaternion().setFromAxisAngle(side, -downPitch))

                arr.push({ pos: tip, quat: q, len, wid, phase: b.phase + rand() * Math.PI * 2 })
            }

            // 2) SIDE LEAVES
            for (let i = 0; i < sideCount; i++) {
                const tBase = (i + 1) / (sideCount + 1)
                const t = THREE.MathUtils.clamp(
                    THREE.MathUtils.lerp(0.2, 0.85, tBase) + (rand() * 0.12 - 0.06),
                    0.15, 0.9
                )
                const base = b.pos.clone().addScaledVector(dir, b.len * t)

                const sideSign = i % 2 === 0 ? 1 : -1
                const around = sideSign * (Math.PI / 2 + (rand() * 0.4 - 0.2))

                const tiltDeg = THREE.MathUtils.lerp(leafTiltDeg[0], leafTiltDeg[1], rand())
                const tilt = THREE.MathUtils.degToRad(tiltDeg) * (rand() < 0.5 ? 1 : -1)

                const q = b.quat.clone()
                    .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), around))
                    .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, 0)))

                const len = THREE.MathUtils.lerp(leafLen[0],  leafLen[1],  rand())
                const wid = THREE.MathUtils.lerp(leafWidth[0], leafWidth[1], rand())

                arr.push({ pos: base, quat: q, len, wid, phase: b.phase + rand() * Math.PI * 2 })
            }
        })

        return arr
    }, [branches, leavesPerBranch, leafLen, leafWidth, leafTiltDeg, showBranchesAndLeaves])

    const leafRef = useRef<THREE.InstancedMesh>(null)

    useEffect(() => {
        if (!leafRef.current) return
        const dummy = new THREE.Object3D()
        for (let i = 0; i < leafAnchors.length; i++) {
            const a = leafAnchors[i]
            dummy.position.copy(a.pos)
            dummy.quaternion.copy(a.quat)
            dummy.scale.set(a.len, a.wid, 1)
            dummy.updateMatrix()
            leafRef.current.setMatrixAt(i, dummy.matrix)
        }
        leafRef.current.instanceMatrix.needsUpdate = true
    }, [leafAnchors])

    useFrame(({ clock }) => {
        if (!sway || !leafRef.current || !showBranchesAndLeaves || leafAnchors.length === 0) return
        const t = clock.getElapsedTime() * swaySpeed * Math.PI * 0.5
        const amp = THREE.MathUtils.degToRad(swayAmpDeg)
        const dummy = new THREE.Object3D()
        for (let i = 0; i < leafAnchors.length; i++) {
            const a = leafAnchors[i]
            const extra = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.sin(t + a.phase) * amp, 0))
            dummy.position.copy(a.pos)
            dummy.quaternion.copy(a.quat).multiply(extra)
            dummy.scale.set(a.len, a.wid, 1)
            dummy.updateMatrix()
            leafRef.current.setMatrixAt(i, dummy.matrix)
        }
        leafRef.current.instanceMatrix.needsUpdate = true
    })

    const { position, rotation, scale, ...restGroup } = rest as any

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <ModelGroup
                {...restGroup}
                parts={parts}
                materialsById={materialsById}
                hitbox={hitbox}
                color={color}
                outlineColor={outlineColor}
                hoverColor={hoverColor}
                initialRotation={initialRotation}
                outlineScale={outlineScale}
            />

            {/* Culms + irregular rings */}
            {StalksAndNodes}

            {/* Yellow twigs */}
            {showBranchesAndLeaves && BranchMeshes}

            {/* Reversed leaves at twig tips */}
            {showBranchesAndLeaves && leafAnchors.length > 0 && (
                <instancedMesh
                    key={`leaves-${leafAnchors.length}`}
                    ref={leafRef}
                    args={[leafGeom, leafMat, leafAnchors.length]}
                    castShadow
                />
            )}

        </group>
    )
})
