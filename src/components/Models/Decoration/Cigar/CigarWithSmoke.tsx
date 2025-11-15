'use client'
import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import Cigar, { type CigarProps } from './Cigar'
import CigarSmokeFlat from "@/components/Effects/CigarSmoke";

type Props = Omit<CigarProps, 'children'> & {
    lit?: boolean
    footOutset?: number
    smokeProps?: Partial<React.ComponentProps<typeof CigarSmokeFlat>>
}

export default function CigarWithSmoke({
                                           size = [0.0105, 0.145],
                                           lit = false,
                                           footOutset = 0.001,
                                           smokeProps,
                                           ...rest
                                       }: Props) {
    const [, L] = size
    const footAnchor = React.useRef<THREE.Group>(null)
    const upright = React.useRef<THREE.Group>(null)

    const qWorld = new THREE.Quaternion()
    const qInv = new THREE.Quaternion()
    useFrame(() => {
        const a = footAnchor.current
        const u = upright.current
        if (!a || !u) return
        a.getWorldQuaternion(qWorld)
        qInv.copy(qWorld).invert()
        u.quaternion.copy(qInv)
    })

    return (
        <group>
            <Cigar {...rest} size={size} lit={lit} disableOutline={true} />
            <group ref={footAnchor} position={[0, -L / 2 - footOutset, 0]}>
                <group ref={upright}>
                    <CigarSmokeFlat
                        visible={!!lit}
                        upAxis="y"
                        position={[0, 0, 0]}
                        height={0.42}
                        baseHalfWidth={0.008}
                        topWidthMult={20}
                        {...smokeProps}
                    />
                </group>
            </group>
        </group>
    )
}
