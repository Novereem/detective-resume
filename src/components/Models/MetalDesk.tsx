'use client'
import React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
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
  openDistance?: number
  materials?: {
    top?: Mats
    cabinet?: Mats
    drawer?: Mats
  }
  drawerChildren?: React.ReactNode
  drawerContentOffset?: Vec3
}

export function MetalDesk({
                            position = [0,0,0],
                            rotation = [0,0,0],
                            topSize = [1.60, 0.04, 0.70],
                            cabinetSize = [0.44, 0.70, 0.60],
                            wall = 0.018,
                            back = 0.012,
                            sideInset = 0.10,
                            faceGap = 0.006,
                            drawerCount = 3,
                            drawerFacing = +1,
                            drawerFrontThickness = 0.018,
                            handleOffset,
                            openDistance = 0.25,
                            materials = {},
                            drawerChildren,
                            drawerContentOffset,
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

  const { invalidate } = useThree()
  const tRef = React.useRef(0)
  const targetRef = React.useRef(0)
  const animRef = React.useRef(false)
  const leftTopRef = React.useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (!animRef.current && tRef.current === targetRef.current) return
    tRef.current = THREE.MathUtils.damp(tRef.current, targetRef.current, 8, dt)
    const dz = drawerFacing * openDistance * tRef.current
    if (leftTopRef.current) leftTopRef.current.position.z = dz
    if (Math.abs(tRef.current - targetRef.current) < 0.001) {
      tRef.current = targetRef.current
      animRef.current = false
    }
    invalidate()
  })

  const handleToggle = (e: any) => {
    if (e.button !== 0) return
    e.stopPropagation()
    if (animRef.current) return
    targetRef.current = targetRef.current === 1 ? 0 : 1
    animRef.current = true
    invalidate()
  }

  return (
      <group position={position} rotation={rotation}>
        <MetalCabinet position={[-x, 0, 0]} materialsById={materials.cabinet} disableOutline inspectDisableOutline />
        <MetalCabinet position={[ x, 0, 0]} materialsById={materials.cabinet} disableOutline inspectDisableOutline />
        <MetalDeskTop position={[0, ch, 0]} size={topSize} materialsById={materials.top} disableOutline inspectDisableOutline />
        <group position={[-x, 0, 0]}>
          {Array.from({ length: drawerCount }).map((_, i) =>
              i === 0 ? (
                  <group key={i} ref={leftTopRef}>
                    <MetalDrawer
                        facing={drawerFacing}
                        size={[drawerW, drawerH, drawerD]}
                        position={[0, wall + i * slotH, drawerZ]}
                        handle={{ offset: ho }}
                        hitboxMode="handle"
                        onPointerDown={handleToggle}
                        materialsById={materials.drawer}
                        inspectDisableOutline
                        outlineScale={1.2}
                        visualizeHitbox={false}
                        contentOffset={drawerContentOffset}
                    />
                      {drawerChildren}
                  </group>
              ) : (
                  <MetalDrawer
                      key={i}
                      facing={drawerFacing}
                      size={[drawerW, drawerH, drawerD]}
                      position={[0, wall + i * slotH, drawerZ]}
                      handle={{ offset: ho }}
                      hitboxMode="drawer"
                      materialsById={materials.drawer}
                      disableOutline
                      inspectDisableOutline
                      visualizeHitbox={false}
                  />
              )
          )}
        </group>
        <group position={[ x, 0, 0]}>
          {Array.from({ length: drawerCount }).map((_, i) => (
              <MetalDrawer
                  key={i}
                  facing={drawerFacing}
                  size={[drawerW, drawerH, drawerD]}
                  position={[0, wall + i * slotH, drawerZ]}
                  handle={{ offset: ho }}
                  hitboxMode="drawer"
                  materialsById={materials.drawer}
                  disableOutline
                  inspectDisableOutline
                  visualizeHitbox={false}
              />
          ))}
        </group>
      </group>
  )
}
