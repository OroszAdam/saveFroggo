import * as THREE from 'three';
import { useFrame, useLoader } from "@react-three/fiber";
import React, { useEffect, useState } from "react";
import { GLTFLoader } from "three-stdlib";

interface FroggoModelProps {
  path: string;
  position: THREE.Vector3;
  scale?: [number, number, number];
  isFalling: boolean
}

export const FroggoModel: React.FC<FroggoModelProps> = ({ path, position, scale = [1, 1, 1], isFalling }) => {
  const gltf = useLoader(GLTFLoader, path);
  const dogRef = React.useRef<THREE.Group | null>(null);

  const [headBone, setHeadBone] = useState<THREE.Bone | null>(null);

  useEffect(() => {
    if (gltf && gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child.name === 'HEAD' && child instanceof THREE.Bone) {
          setHeadBone(child as THREE.Bone);
        }
      });
      dogRef.current = gltf.scene;
    }
  }, [gltf]);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(({ camera }) => {
    if (headBone) {
      const vector = new THREE.Vector3(mouse.x, mouse.y, 0.9).unproject(camera);
      headBone.lookAt(vector);
      headBone.rotation.x += +Math.PI / 3;
      headBone.rotation.y += +Math.PI / 10;
    }
  });
  useFrame(() => {
    if (isFalling === true && dogRef.current) {
      dogRef.current.position.y -= 0.1; // Adjust fall speed as needed
      if (dogRef.current.position.y <= -5) { // Stop falling when below a certain point
        dogRef.current.position.y = -5; // Prevent falling below this point
      }
    }
  });

  return <primitive ref={dogRef} object={gltf.scene} position={position} scale={scale} />;
};