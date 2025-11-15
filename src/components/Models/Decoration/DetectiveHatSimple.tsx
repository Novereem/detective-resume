'use client'
import React, { memo, useMemo } from 'react'
import * as THREE from 'three'
import { ModelGroup, PartSpec } from '@/components/Models/Generic/ModelGroup'
import type { Vec3 } from '@/components/Types/room'

type Inherited = Omit<React.ComponentProps<typeof ModelGroup>, 'parts' | 'materialsById'>

type Props = Inherited & {
    // Brim
    brimOuter?: number
    brimInner?: number
    brimThickness?: number
    brimSlope?: number
    brimOverlap?: number
    // Crown
    crownRadius?: number        // bottom outer radius
    crownTopRadius?: number     // top outer radius
    crownHeight?: number
    crownWall?: number          // shell thickness
    // Ribbon
    ribbonHeight?: number
    ribbonOffset?: number       // distance ABOVE the brim surface
    // Top lid
    topPlateThickness?: number  // thickness of the top ring/lid
    materialsById: React.ComponentProps<typeof ModelGroup>['materialsById']
}

export const DetectiveHatSimple = memo(function DetectiveHatSimple({
                                                                       // Brim
                                                                       brimOuter = 0.18,
                                                                       brimInner = 0.115,
                                                                       brimThickness = 0.012,
                                                                       brimSlope = 0.006,
                                                                       brimOverlap = 0.003,
                                                                       // Crown
                                                                       crownRadius = 0.105,
                                                                       crownTopRadius = 0.09,
                                                                       crownHeight = 0.11,
                                                                       crownWall = 0.006,
                                                                       // Ribbon
                                                                       ribbonHeight = 0.035,
                                                                       ribbonOffset = 0.025,
                                                                       // Top plate
                                                                       topPlateThickness = 0.004,
                                                                       color = '#d6c8b2',
                                                                       outlineColor = '#fff',
                                                                       hoverColor = '#ff3b30',
                                                                       outlineScale = 1.035,
                                                                       initialRotation = [0, 0, 0] as Vec3,
                                                                       materialsById,
                                                                       ...rest
                                                                   }: Props) {

    const buildSlopedBrim = React.useCallback((
        rInner: number, rOuter: number, thickness: number, slope: number, radialSegments = 128
    ) => {
        const heightTopInner = thickness * 0.5
        const heightTopOuter = heightTopInner - slope
        const heightBot = -thickness * 0.5

        const verts: number[] = [], uvs: number[] = [], indices: number[] = []
        const push = (x:number,y:number,z:number,u:number,v:number)=>{ verts.push(x,y,z); uvs.push(u,v) }
        const segs = radialSegments, d = (Math.PI*2)/segs
        const ti:number[]=[], to:number[]=[], bi:number[]=[], bo:number[]=[]
        for (let i=0;i<=segs;i++){
            const th=i*d, c=Math.cos(th), s=Math.sin(th), v=i/segs
            const xi=rInner*c, zi=rInner*s, xo=rOuter*c, zo=rOuter*s
            push(xi, heightTopInner, zi, 0, v); ti.push(verts.length/3-1)
            push(xo, heightTopOuter, zo, 1, v); to.push(verts.length/3-1)
            push(xi, heightBot,      zi, 0, v); bi.push(verts.length/3-1)
            push(xo, heightBot,      zo, 1, v); bo.push(verts.length/3-1)
        }
        const strip=(a:number[],b:number[],w=1)=>{ for(let i=0;i<a.length-1;i++){ const a0=a[i],a1=a[i+1],b0=b[i],b1=b[i+1]; w>0? indices.push(a0,b0,b1, a0,b1,a1) : indices.push(a0,b1,b0, a0,a1,b1)}}
        strip(ti,to,+1)
        strip(bo,bi,+1)
        strip(to,bo,+1)
        strip(bi,ti,+1)

        const geo=new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts,3))
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2))
        geo.setIndex(indices)
        geo.computeVertexNormals()
        return geo
    }, [])

    const buildCrownShell = React.useCallback((
        rOuterBottom:number, rOuterTop:number, height:number, wall:number, radialSegments=64
    ) => {
        const rInnerBottom = Math.max(0.001, rOuterBottom - wall)
        const rInnerTop    = Math.max(0.001, rOuterTop    - wall)
        const hBot = 0, hTop = height

        const verts:number[]=[], uvs:number[]=[], indices:number[]=[]
        const push=(x:number,y:number,z:number,u:number,v:number)=>{ verts.push(x,y,z); uvs.push(u,v) }

        const segs=radialSegments, d=(Math.PI*2)/segs
        const ob:number[]=[], ot:number[]=[], ib:number[]=[], it:number[]=[]
        for(let i=0;i<=segs;i++){
            const th=i*d, c=Math.cos(th), s=Math.sin(th), v=i/segs
            push(rOuterBottom*c, hBot, rOuterBottom*s, 0, v); ob.push(verts.length/3-1)
            push(rOuterTop*c,    hTop, rOuterTop*s,    1, v); ot.push(verts.length/3-1)
            push(rInnerBottom*c, hBot, rInnerBottom*s, 0, v); ib.push(verts.length/3-1)
            push(rInnerTop*c,    hTop, rInnerTop*s,    1, v); it.push(verts.length/3-1)
        }
        const strip=(a:number[],b:number[],w=1)=>{ for(let i=0;i<a.length-1;i++){ const a0=a[i],a1=a[i+1],b0=b[i],b1=b[i+1]; w>0? indices.push(a0,b0,b1, a0,b1,a1) : indices.push(a0,b1,b0, a0,a1,b1)}}
        strip(ob, ot, +1)
        strip(it, ib, +1)

        const geo=new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts,3))
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2))
        geo.setIndex(indices)
        geo.computeVertexNormals()
        return geo
    }, [])

    const buildRingPlate = React.useCallback((
        rInner:number, rOuter:number, thickness:number, radialSegments=64
    )=>{
        const yTop = thickness*0.5, yBot = -thickness*0.5
        const verts:number[]=[], uvs:number[]=[], indices:number[]=[]
        const push=(x:number,y:number,z:number,u:number,v:number)=>{ verts.push(x,y,z); uvs.push(u,v) }
        const segs=radialSegments, d=(Math.PI*2)/segs
        const ti:number[]=[], to:number[]=[], bi:number[]=[], bo:number[]=[]
        for(let i=0;i<=segs;i++){
            const th=i*d, c=Math.cos(th), s=Math.sin(th), v=i/segs
            const xi=rInner*c, zi=rInner*s, xo=rOuter*c, zo=rOuter*s
            push(xi, yTop, zi, 0, v); ti.push(verts.length/3-1)
            push(xo, yTop, zo, 1, v); to.push(verts.length/3-1)
            push(xi, yBot, zi, 0, v); bi.push(verts.length/3-1)
            push(xo, yBot, zo, 1, v); bo.push(verts.length/3-1)
        }
        const strip=(a:number[],b:number[],w=1)=>{ for(let i=0;i<a.length-1;i++){ const a0=a[i],a1=a[i+1],b0=b[i],b1=b[i+1]; w>0? indices.push(a0,b0,b1, a0,b1,a1) : indices.push(a0,b1,b0, a0,a1,b1)}}
        strip(ti,to,+1)
        strip(bo,bi,+1)
        strip(to,bo,+1)
        strip(bi,ti,+1)
        const geo=new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts,3))
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2))
        geo.setIndex(indices)
        geo.computeVertexNormals()
        return geo
    }, [])

    const brimGeom = useMemo(() => {
        const inner = Math.min(brimInner, crownRadius * 0.985)
        return buildSlopedBrim(inner, brimOuter, brimThickness, brimSlope, 128)
    }, [buildSlopedBrim, brimInner, brimOuter, brimThickness, brimSlope, crownRadius])

    const crownGeom = useMemo(() => {
        const g = buildCrownShell(crownRadius, crownTopRadius, crownHeight, crownWall, 96)
        const baseY = brimThickness * 0.5 - brimOverlap
        g.translate(0, baseY, 0)
        g.computeVertexNormals()
        return g
    }, [buildCrownShell, crownRadius, crownTopRadius, crownHeight, crownWall, brimThickness, brimOverlap])

    const topPlateGeom = useMemo(() => {
        const rInner = Math.max(0.001, crownTopRadius - crownWall)
        const rOuter = crownTopRadius
        const g = buildRingPlate(rInner, rOuter, topPlateThickness, 96)
        const y = (brimThickness * 0.5 - brimOverlap) + crownHeight
        g.translate(0, y, 0)
        g.computeVertexNormals()
        return g
    }, [buildRingPlate, crownTopRadius, crownWall, topPlateThickness, crownHeight, brimThickness, brimOverlap])

    const topDiskGeom = useMemo(() => {
        const rInnerTop = Math.max(0.001, crownTopRadius + 0.0065  - crownWall)
        const h = topPlateThickness

        const g = new THREE.CylinderGeometry(
            rInnerTop - 0.0005,
            rInnerTop - 0.0005,
            h,
            64,
            1,
            false
        )

        const topY = (brimThickness * 0.5 - brimOverlap) + crownHeight + 0.005
        g.translate(0, topY - h * 0.5, 0)
        g.computeVertexNormals()
        return g
    }, [crownTopRadius, crownWall, topPlateThickness, crownHeight, brimThickness, brimOverlap])

    const ribbonGeom = useMemo(() => {
        const t = THREE.MathUtils.clamp(ribbonOffset / Math.max(0.0001, crownHeight), 0, 1)
        const localOuter = THREE.MathUtils.lerp(crownRadius, crownTopRadius, t)
        const r = localOuter + 0.001
        const g = new THREE.CylinderGeometry(r, r, ribbonHeight, 64, 1, true)
        const y = brimThickness * 0.5 + ribbonOffset
        g.translate(0, y, 0)
        g.computeVertexNormals()
        return g
    }, [crownRadius, crownTopRadius, crownHeight, ribbonHeight, ribbonOffset, brimThickness])

    // assemble
    const parts = useMemo<PartSpec[]>(() => {
        const p: PartSpec[] = []
        p.push({ id:'felt',   geometry:<bufferGeometry {...(brimGeom as any)} />,     position:[0,0,0], color, outlineColor, boundingRadius: brimOuter })
        p.push({ id:'felt',   geometry:<bufferGeometry {...(crownGeom as any)} />,    position:[0,0,0], color, outlineColor, boundingRadius: crownRadius + crownHeight })
        p.push({ id:'felt',   geometry:<bufferGeometry {...(topPlateGeom as any)} />, position:[0,0,0], color, outlineColor, boundingRadius: crownTopRadius })
        p.push({ id:'ribbon', geometry:<bufferGeometry {...(ribbonGeom as any)} />,   position:[0,0,0], color, outlineColor, boundingRadius: crownRadius })
        p.push({
            id: 'felt',
            geometry: <bufferGeometry {...(topDiskGeom as any)} />,
            position: [0, 0, 0],
            color,
            outlineColor,
            boundingRadius: crownTopRadius,
        })

        return p
    }, [brimGeom, crownGeom, topPlateGeom, ribbonGeom, color, outlineColor, brimOuter, crownRadius, crownTopRadius, crownHeight])

    const totalH = brimThickness + brimOverlap + crownHeight + topPlateThickness
    const hitboxSize: Vec3 = [brimOuter * 2.1, totalH, brimOuter * 2.1]
    const hitboxCenter: Vec3 = [0, totalH / 2, 0]

    return (
        <ModelGroup
            {...rest}
            parts={parts}
            materialsById={materialsById}
            hitbox={{ size: hitboxSize, center: hitboxCenter }}
            color={color}
            outlineColor={outlineColor}
            hoverColor={hoverColor}
            initialRotation={initialRotation}
            outlineScale={outlineScale}
            disableOutline
            inspectDisableOutline
        />
    )
})
