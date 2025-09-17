'use client'
import React from 'react'
import { MetalCabinet } from '@/components/Models/MetalCabinet'
import { MetalDeskTop } from '@/components/Models/MetalDeskTop'
import { MetalDrawer } from '@/components/Models/MetalDrawer'

type Vec3 = [number, number, number]
type Mats = Record<string, any>

type Props = {
  position?: Vec3
  rotation?: Vec3
  topSize?: [number, number, number]
  cabinetSize?: [number, number, number]
  wall?: number
  back?: number
  sideInset?: number
  faceGap?: number
  drawerCount?: number
  drawerFacing?: 1 | -1
  drawerFrontThickness?: number
  handleOffset?: number
  materials?: {
    top?: Mats
    cabinet?: Mats
    drawer?: Mats
  }
}

export function MetalDesk({
  position = [0,0,0],
  rotation = [0,0,0],
  topSize = [1.60, 0.04, 0.70],
  cabinetSize = [0.44, 0.70, 0.60],
  wall = 0.018,
  back = 0.012,
  sideInset = 0,
  faceGap = 0.006,
  drawerCount = 3,
  drawerFacing = +1,
  drawerFrontThickness = 0.018,
  handleOffset,
  materials = {},
}: Props) {
  const [tw, , td] = topSize
  const [cw, ch, cd] = cabinetSize
  const x = (tw / 2) - sideInset - (cw / 2)
  const planeZ = cd / 2 - faceGap
  const drawerZ = planeZ - drawerFacing * drawerFrontThickness
  const innerH = ch - 2 * wall
  const slotH = innerH / drawerCount
  const drawerW = cw - 2 * wall
  const drawerH = slotH - 0.02
  const drawerD = cd - back
  const ho = handleOffset ?? (2 * wall)

  return (
    <group position={position} rotation={rotation}>
      <MetalCabinet position={[-x, 0, 0]} materialsById={materials.cabinet} disableOutline inspectDisableOutline />
      <MetalCabinet position={[ x, 0, 0]} materialsById={materials.cabinet} disableOutline inspectDisableOutline />
      <MetalDeskTop position={[0, ch, 0]} size={topSize} materialsById={materials.top} disableOutline inspectDisableOutline />
      {[-x, x].map((cx) => (
        <group key={cx} position={[cx, 0, 0]}>
          {Array.from({ length: drawerCount }).map((_, i) => (
            <MetalDrawer
              key={i}
              facing={drawerFacing}
              size={[drawerW, drawerH, drawerD]}
              position={[0, wall + i * slotH, drawerZ]}
              handle={{ offset: ho }}
              materialsById={materials.drawer}
              disableOutline
              inspectDisableOutline
            />
          ))}
        </group>
      ))}
    </group>
  )
}
