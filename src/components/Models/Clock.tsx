'use client'
import React, { memo, useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

export type ClockProps = Inherited & {
    radius?: number
    depth?: number
    glassT?: number
    faceT?: number
    backT?: number
    frameSteps?: [width: number, height: number][]

    minuteAngle?: number
    hourAngle?: number

    running?: boolean
    realTime?: boolean
    speed?: number

    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const Clock = memo(function Clock({
                                             radius = 0.22,
                                             depth = 0.065,
                                             glassT = 0.003,
                                             faceT = 0.006,
                                             backT = 0.010,
                                             frameSteps = [
                                                 [0.035, 0.020],
                                                 [0.020, 0.015],
                                                 [0.012, 0.011],
                                             ],
                                             minuteAngle = THREE.MathUtils.degToRad(60),
                                             hourAngle = THREE.MathUtils.degToRad(305),
                                             running = true,
                                             realTime = true,
                                             speed = 1,
                                             color = '#111111',
                                             outlineColor = '#ffffff',
                                             hoverColor = '#ff3b30',
                                             outlineScale = 1.02,
                                             initialRotation = [0, 0, 0] as Vec3,
                                             materialsById,
                                             ...rest
                                         }: ClockProps) {
    const R = radius
    const safeDepth = Math.max(depth, glassT + faceT + backT + 0.005)

    // Build static parts (frame/face/glass)
    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []
        let zCursor = -safeDepth / 2

        // back plate
        p.push({
            id: 'backPlate',
            geometry: <cylinderGeometry args={[R, R, backT, 64, 1, false]} />,
            rotation: [Math.PI / 2, 0, 0],
            position: [0, 0, zCursor + backT / 2],
            color, outlineColor, roughness: 0.7, metalness: 0.0,
        })
        zCursor += backT

        // stepped frame
        let innerR = R
        frameSteps.forEach(([w, h], i) => {
            const outerR = innerR
            const frameR = Math.max(0.02, outerR - w)
            p.push({
                id: `frame_${i}`,
                geometry: <cylinderGeometry args={[outerR, outerR, h, 96, 1, true]} />,
                rotation: [Math.PI / 2, 0, 0],
                position: [0, 0, zCursor + h / 2],
                color, outlineColor, roughness: 0.6, metalness: 0.0,
            })
            p.push({
                id: `frame_fill_${i}`,
                geometry: <cylinderGeometry args={[frameR, frameR, h, 64, 1, false]} />,
                rotation: [Math.PI / 2, 0, 0],
                position: [0, 0, zCursor + h / 2],
                color, outlineColor, roughness: 0.6, metalness: 0.0,
            })
            zCursor += h
            innerR = frameR
        })

        const faceR = Math.max(0.05, innerR - 0.004)

        // face
        p.push({
            id: 'face',
            geometry: <cylinderGeometry args={[faceR, faceR, faceT, 96, 1, false]} />,
            rotation: [Math.PI / 2, 0, 0],
            position: [0, 0, zCursor + faceT / 2],
            color: '#f4f2ea',
            outlineColor, roughness: 0.95, metalness: 0.0,
        })
        zCursor += faceT

        // glass
        p.push({
            id: 'glass',
            geometry: <cylinderGeometry args={[faceR + 0.001, faceR + 0.001, glassT, 64]} />,
            rotation: [Math.PI / 2, 0, 0],
            position: [0, 0, zCursor + glassT / 2],
            color: '#ffffff',
            outlineColor,
            roughness: 0.0, metalness: 0.0,
            transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide,
        })

        return p
    }, [R, safeDepth, glassT, faceT, backT, frameSteps, color, outlineColor])

    const framesTotalH = frameSteps.reduce((sum, [, h]) => sum + h, 0)
    const handZ = (-safeDepth / 2) + backT + framesTotalH + faceT - 0.0006

    const innerR = frameSteps.reduce((r, [w]) => Math.max(0.02, r - w), R)
    const faceR = Math.max(0.05, innerR - 0.004)
    const minuteLen = faceR * 0.90
    const hourLen = faceR * 0.65
    const handT = 0.004

    const secondRef = useRef<THREE.Mesh>(null!)
    const minuteRef = useRef<THREE.Mesh>(null!)
    const hourRef = useRef<THREE.Mesh>(null!)

    const secondLen = faceR * 0.95
    const secondT = 0.0025
    const secondZ = handZ + 0.00025

    const minuteGeom = useMemo(() => {
        const g = new THREE.BoxGeometry(minuteLen, handT, handT)
        g.translate(minuteLen / 2, 0, 0)
        return g
    }, [minuteLen, handT])

    const hourGeom = useMemo(() => {
        const g = new THREE.BoxGeometry(hourLen, handT, handT)
        g.translate(hourLen / 2, 0, 0)
        return g
    }, [hourLen, handT])

    const secondGeom = useMemo(() => {
        const g = new THREE.BoxGeometry(secondLen, secondT, secondT)
        g.translate(secondLen / 2, 0, 0)
        return g
    }, [secondLen, secondT])

    useEffect(() => {
        if (minuteRef.current) minuteRef.current.rotation.z = minuteAngle
        if (hourRef.current) hourRef.current.rotation.z = hourAngle
    }, [minuteAngle, hourAngle])

    // animate
    useFrame(({ clock }) => {
        if (!running) return

        let mAngle: number
        let hAngle: number
        let sAngle: number

        if (realTime) {
            const now = new Date()
            const secFloat = now.getSeconds() + now.getMilliseconds() / 1000
            const sec = Math.floor(secFloat)
            const min = now.getMinutes() + secFloat / 60
            const hr  = (now.getHours() % 12) + min / 60

            mAngle = -((min / 60) * Math.PI * 2) + Math.PI / 2
            hAngle = -((hr  / 12) * Math.PI * 2) + Math.PI / 2
            sAngle = -((sec / 60) * Math.PI * 2) + Math.PI / 2
        } else {
            const t = clock.getElapsedTime() * speed
            const sec = Math.floor(t % 60)
            const min = t / 60
            const hr  = min / 60 / 12

            mAngle = -((min % 60) / 60 * Math.PI * 2) + Math.PI / 2
            hAngle = -((hr % 1) * Math.PI * 2) + Math.PI / 2
            sAngle = -((sec / 60) * Math.PI * 2) + Math.PI / 2
        }

        if (minuteRef.current) minuteRef.current.rotation.z = mAngle
        if (hourRef.current)   hourRef.current.rotation.z   = hAngle
        if (secondRef.current) secondRef.current.rotation.z = sAngle
    })

    const mm = (materialsById as any) ?? {}
    const handMinuteMat = mm.handMinute ?? {}
    const handHourMat   = mm.handHour ?? {}
    const capMat        = mm.centerCap ?? {}

    const handMinuteColor = handMinuteMat.color ?? '#111111'
    const handHourColor   = handHourMat.color ?? '#111111'
    const capColor        = capMat.color ?? '#d2b886'
    const handRough       = handMinuteMat.roughness ?? 0.6
    const handMetal       = handMinuteMat.metalness ?? 0.0

    const secMat         = mm.handSecond ?? {}
    const handSecondColor = secMat.color ?? '#d82424'
    const handSecondRough = secMat.roughness ?? 0.55
    const handSecondMetal = secMat.metalness ?? 0.0

    const hitbox: { size: Vec3; center: Vec3 } = {
        size: [R * 2, R * 2, depth] as Vec3,
        center: [0, 0, 0],
    }

    const {
        position, rotation, scale, ...restGroup
    } = rest as any

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

            <group position={[0, 0, handZ]}>
                <mesh ref={minuteRef} geometry={minuteGeom}>
                    <meshStandardMaterial color={handMinuteColor} roughness={handRough} metalness={handMetal}/>
                </mesh>

                <mesh ref={hourRef} position={[0, 0, -0.001]} geometry={hourGeom}>
                    <meshStandardMaterial color={handHourColor} roughness={handRough} metalness={handMetal}/>
                </mesh>

                <mesh position={[0, 0, 0.0015]}>
                    <cylinderGeometry args={[0.008, 0.008, 0.006, 24]}/>
                    <meshStandardMaterial color={capColor} roughness={0.4} metalness={0.2}/>
                </mesh>

                <mesh ref={secondRef} position={[0, 0, secondZ - handZ]} geometry={secondGeom}>
                    <meshStandardMaterial color={handSecondColor} roughness={handSecondRough}
                                          metalness={handSecondMetal}/>
                </mesh>
            </group>
        </group>
    )
})
