import { FramedPlane } from '@/components/Models/Generic/Outlined/FramedPlane'
import { MagnifierSecretPlane } from '@/components/CameraEffects/MagnifierSecretPlane'
import {useTexture} from "@react-three/drei";


export function SecretNoteOnDesk() {

    return (
        <>
            <FramedPlane
                width={0.22}
                height={0.14}
                position={[-0.169, 0.795, 4.408]}
                rotation={[-Math.PI / 2, 0, 0]}
                textureUrl="/textures/paper_collages_whites.jpg"
                textureRepeat={[1, 1]}
                border={0.005}
                color="#222222"
                canInteract={false}
                lit
                roughness={0.9}
                metalness={0}
                receiveShadow
            />

            <MagnifierSecretPlane
                width={0.22}
                height={0.14}
                position={[-0.169, 0.8005, 4.408]}
                rotation={[-Math.PI / 2, 0, 0]}
                textureUrl="/textures/testimage.jpg"
            />

            <mesh position={[-0.169, 0.8005, 4.208]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.22, 0.14]}/>
                <meshBasicMaterial transparent={true}/>
            </mesh>
        </>
    )
}
