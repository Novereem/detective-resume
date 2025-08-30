import React, { memo, useMemo } from 'react'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import { Vec3 } from '@/shaders/inspectTypes'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts'>

type MugProps = Inherited & {
    radius?: number
    height?: number
    thickness?: number
    segments?: number
}

export const Mug = memo(function Mug({
                                         radius = 0.12,
                                         height = 0.16,
                                         thickness = 0.01,
                                         segments = 32,
                                         initialRotation = [0.15, 0.6, 0] as Vec3,
                                         hitbox,
                                         ...rest
                                     }: MugProps) {
    const rBody   = Math.hypot(radius, height / 2)
    const rHandle = (radius * 0.7) + (thickness * 0.7)

    const parts = useMemo<PartSpec[]>(() => [
        {
            id: 'body',
            geometry: <cylinderGeometry args={[radius, radius, height, segments]} />,
            position: [0, height / 2, 0] as Vec3,
            boundingRadius: rBody,
        },
        {
            id: 'handle',
            geometry: <torusGeometry args={[radius * 0.7, thickness * 0.7, 16, Math.max(24, segments)]} />,
            position: [radius * 0.9, height / 2, 0] as Vec3,
            rotation: [Math.PI / 2, 0, 0] as Vec3,
            boundingRadius: rHandle,
        },
    ], [radius, height, thickness, segments, rBody, rHandle])

    const defaultHitbox = hitbox ?? {
        size: [radius * 3, height + 0.06, radius * 3] as Vec3,
        center: [0, height / 2, 0] as Vec3,
    }

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={rest.materialsById}
            hitbox={defaultHitbox}
            initialRotation={initialRotation}
        />
    )
})