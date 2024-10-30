import * as THREE from 'three';
import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { GLTFLoader } from "three-stdlib";

interface StaticModelProps {
    path: string; // Path to the model file
    position?: THREE.Vector3;
    scale?: [number, number, number]; // Scale if you need to resize
    isFalling: boolean
}

export const StaticModel: React.FC<StaticModelProps> = ({ position, path, scale = [1, 1, 1], isFalling }) => {
    const gltf = useLoader(GLTFLoader, path);
    const branchRef = useRef<THREE.Group | null>(null); // Reference for the branch model

    useFrame(() => {
        if (isFalling === true && branchRef.current) {
            branchRef.current.position.y -= 0.1; // Adjust fall speed as needed
            if (branchRef.current.position.y <= -5) { // Stop falling when below a certain point
                branchRef.current.position.y = -5; // Prevent falling below this point
            }
        }
    });
    return <primitive ref={branchRef} object={gltf.scene} position={position} scale={scale} />;
};