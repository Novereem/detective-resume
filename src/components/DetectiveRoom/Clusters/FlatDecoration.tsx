import React from 'react'
import { FramedPlane } from '@/components/Models/Generic/Outlined/FramedPlane'
import { Pin } from '@/components/Models/Functional/Pin'
import { ANCHOR } from '@/components/Game/anchors'

type RcFocus = (anchor: (typeof ANCHOR)[keyof typeof ANCHOR]) => (e: React.MouseEvent) => void

export function FlatDecorationCluster({ rcFocus }: { rcFocus: RcFocus }) {
    return (
        <>
            <mesh
                onContextMenu={rcFocus(ANCHOR.mapFrame)}
                position={ANCHOR.mapFrame.position}
                rotation={ANCHOR.mapFrame.rotation}
                raycast={() => null}
                userData={{ movable: true, anchorKey: 'mapFrame' }}
            >
                <FramedPlane
                    width={0.4}
                    height={0.2}
                    textureUrl="/textures/scherpenzeel.jpg"
                    textureFit="stretch"
                    border={0}
                    color="#bbbbbb"
                    canInteract={false}
                    lit
                    roughness={10}
                    metalness={0}
                    receiveShadow
                />
            </mesh>

            <group userData={{ movable: true, anchorKey: 'mapFramePin' }}>
                <Pin
                    position={ANCHOR.mapFramePin.position}
                    rotation={ANCHOR.mapFramePin.rotation}
                    inspectDistance={0.2}
                    inspectPixelSize={3}
                    disableOutline
                    inspectDisableOutline
                />
            </group>

            <group userData={{ movable: true, anchorKey: 'calendar2025' }}>
                <mesh
                    onContextMenu={rcFocus(ANCHOR.calendar2025)}
                    position={ANCHOR.calendar2025.position}
                    rotation={ANCHOR.calendar2025.rotation}
                >
                    <FramedPlane
                        width={0.6}
                        height={0.45}
                        textureUrl="/textures/calender2025.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#ffffff"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                        doubleSide={false}
                    />
                </mesh>
            </group>

            <group userData={{ movable: true, anchorKey: 'newspaper1' }}>
                <mesh
                    onContextMenu={rcFocus(ANCHOR.newspaper1)}
                    position={ANCHOR.newspaper1.position}
                    rotation={ANCHOR.newspaper1.rotation}
                >
                    <FramedPlane
                        width={0.6}
                        height={0.45}
                        textureUrl="/textures/newspapers.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#ffffff"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                        doubleSide={false}
                    />
                </mesh>
            </group>

            <group userData={{ movable: true, anchorKey: 'newspaper2' }}>
                <mesh
                    onContextMenu={rcFocus(ANCHOR.newspaper2)}
                    position={ANCHOR.newspaper2.position}
                    rotation={ANCHOR.newspaper2.rotation}
                >
                    <FramedPlane
                        width={0.6}
                        height={0.45}
                        textureUrl="/textures/newspapers.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#ffffff"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                        doubleSide={false}
                    />
                </mesh>
            </group>

            <group userData={{ movable: true, anchorKey: 'newspaper3' }}>
                <mesh
                    onContextMenu={rcFocus(ANCHOR.newspaper3)}
                    position={ANCHOR.newspaper3.position}
                    rotation={ANCHOR.newspaper3.rotation}
                >
                    <FramedPlane
                        width={0.6}
                        height={0.45}
                        textureUrl="/textures/newspapers.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#ffffff"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                        doubleSide={false}
                    />
                </mesh>
            </group>

            <group userData={{ movable: true, anchorKey: 'writtenLetter1' }}>
                <mesh
                    onContextMenu={rcFocus(ANCHOR.writtenLetter1)}
                    position={ANCHOR.writtenLetter1.position}
                    rotation={ANCHOR.writtenLetter1.rotation}
                >
                    <FramedPlane
                        width={0.25}
                        height={0.35}
                        textureUrl="/textures/written_letter.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#ffffff"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                        doubleSide={false}
                    />
                </mesh>
            </group>

            <group userData={{ movable: true, anchorKey: 'writtenLetter2' }}>
                <mesh
                    onContextMenu={rcFocus(ANCHOR.writtenLetter2)}
                    position={ANCHOR.writtenLetter2.position}
                    rotation={ANCHOR.writtenLetter2.rotation}
                >
                    <FramedPlane
                        width={0.25}
                        height={0.35}
                        textureUrl="/textures/written_letter.jpg"
                        textureFit="stretch"
                        border={0}
                        color="#ffffff"
                        canInteract={false}
                        lit
                        roughness={1}
                        metalness={0}
                        receiveShadow
                        doubleSide={false}
                    />
                </mesh>
            </group>
        </>
    )
}