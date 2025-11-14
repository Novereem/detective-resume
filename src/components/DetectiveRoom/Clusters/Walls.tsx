import React from 'react'
import { FramedPlane } from '@/components/Primitives/FramedPlane'
import {wallCutoutMaterials} from "@/components/Materials/detectiveRoomMats";
import WallWithCutouts, {apertureFromWindow} from "@/components/Models/WallWithCutouts";

export function WallsCluster() {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2.5]} raycast={() => null}>
                <FramedPlane
                    width={5}
                    height={5}
                    textureUrl="/textures/dark_planks.jpg"
                    textureFit="contain"
                    border={0}
                    color="#777"
                    hoverColor="#ff3b30"
                    canInteract={false}
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            </mesh>

            <mesh rotation={[-Math.PI / 2, Math.PI, Math.PI]} position={[0, 2.5, 2.5]} raycast={() => null}>
                <FramedPlane
                    width={5}
                    height={5}
                    textureUrl="/textures/light_concrete.jpg"
                    textureFit="stretch"
                    border={0}
                    color="#777"
                    hoverColor="#ff3b30"
                    canInteract={false}
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            </mesh>

            <mesh position={[0, 2.5, 5]} rotation={[-Math.PI, 0, 0]} raycast={() => null}>
                <FramedPlane
                    width={5}
                    height={5}
                    textureUrl="/textures/felt_beige.jpg"
                    textureFit="stretch"
                    border={0}
                    color="#777"
                    canInteract={false}
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            </mesh>

            <mesh position={[0, 2.5, 1]} rotation={[0, 0, Math.PI]} raycast={() => null}>
                <FramedPlane
                    width={5}
                    height={5}
                    textureUrl="/textures/wallpaper_red.jpg"
                    textureRepeat={[4, 3]}
                    border={0}
                    color="#777"
                    canInteract={false}
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            </mesh>

            <mesh position={[-1.7, 1.5, 2.5]} rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
                <FramedPlane
                    width={3}
                    height={2.5}
                    textureUrl="/textures/cityscape.jpg"
                    textureFit="stretch"
                    border={0}
                    color="#000000"
                    canInteract={false}
                    lit={false}
                    roughness={1}
                    metalness={0}
                    receiveShadow={false}
                />
            </mesh>

            <mesh
                position={[2.5, 2.5, 2.5]}
                rotation={[-Math.PI, Math.PI + Math.PI / 2, 0]}
                raycast={() => null}
            >
                <FramedPlane
                    width={5}
                    height={5}
                    textureUrl="/textures/wallpaper_red.jpg"
                    textureRepeat={[4, 3]}
                    border={0}
                    color="#777"
                    canInteract={false}
                    lit
                    roughness={1}
                    metalness={0}
                    receiveShadow
                />
            </mesh>

            <WallWithCutouts
                position={[-1.5, 2.5, 2.5]}
                rotation={[-Math.PI, Math.PI / 2, 0]}
                size={[5, 5]}
                textureRepeat={[1, 1]}
                materialsById={wallCutoutMaterials}
                holes={[
                    {
                        ...apertureFromWindow({size: [0.85, 1.5, 0.05], surroundBorder: 0.07, clearance: 0.006}),
                        center: [-0.2, 1.2]
                    },
                    {
                        ...apertureFromWindow({size: [0.85, 1.5, 0.05], surroundBorder: 0.07, clearance: 0.006}),
                        center: [0.8, 1.2]
                    },
                ]}
            />
        </group>
    )
}
