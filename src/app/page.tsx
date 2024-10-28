"use client"; // Declare this component as a Client Component

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

const HEAD_INITIAL_POSITION = new THREE.Vector3(0, 0, 0);
const BRANCH_INITIAL_POSITION = new THREE.Vector3(0, 0, 0);

interface StaticModelProps {
  path: string; // Path to the model file
  position?: THREE.Vector3;
  scale?: [number, number, number]; // Scale if you need to resize
  isFalling: boolean
}

const StaticModel: React.FC<StaticModelProps> = ({ position, path, scale = [1, 1, 1], isFalling }) => {
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

interface FroggoModelProps {
  position: THREE.Vector3;
  scale?: [number, number, number];
  isFalling: boolean
}

const FroggoModel: React.FC<FroggoModelProps> = ({ position, scale = [1, 1, 1], isFalling }) => {
  const gltf = useLoader(GLTFLoader, '/models/froggo.glb');
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

const Page = () => {
  const [dogPosition, setDogPosition] = useState(HEAD_INITIAL_POSITION.clone());
  const [branchPosition, setBranchPosition] = useState(BRANCH_INITIAL_POSITION.clone());
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [selectedChoice, setSelectedChoice] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [isFalling, setIsFalling] = useState(false);


  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(new Audio('/music/goof.mp3'))
  const branchBreakSound = React.useRef<HTMLAudioElement>(new Audio('/music/fall.ogg')); // Load your sound file

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Adjust volume as needed
      audioRef.current.play(); // Start playing music on load
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeRemaining > 0 && !gameOver) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setGameOver(true);
      setGameStarted(false);
      setIsFalling(true); // Trigger falling animation
      branchBreakSound.current.play(); // Play the branch break sound
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeRemaining, gameOver]);

  const handleStart = () => {
    setGameStarted(true);
    setTimeRemaining(10);
    setGameOver(false);
    setDogPosition(HEAD_INITIAL_POSITION.clone());
    setBranchPosition(BRANCH_INITIAL_POSITION.clone())
  };

  const playAnimationLeft = () => {
    setSelectedChoice(choice1);
    setGameOver(true);
  };

  const playAnimationRight = () => {
    setSelectedChoice(choice2);
    setGameOver(true);
  };

  const restartGame = () => {
    setChoice1('');
    setChoice2('');
    setSelectedChoice('');
    setGameStarted(false);
    setDogPosition(HEAD_INITIAL_POSITION.clone());
    setBranchPosition(BRANCH_INITIAL_POSITION.clone())
    setTimeRemaining(10);
    setGameOver(false);
    setIsFalling(false)
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };
  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', margin: 0 }}>
      <audio ref={audioRef} src="music/goof.mp3" loop/>
      <Canvas
        style={{ height: '100%', width: '100%' }}
        camera={{
          position: [-1.61, -1.74, 2.63],
          fov: 60,
        }}
      >
        <ambientLight color={"white"} intensity={1.2} />
        <directionalLight intensity={1.3} />
        <FroggoModel position={dogPosition} isFalling={isFalling} />
        <StaticModel path="/models/tree.glb" position={branchPosition} scale={[1, 1, 1]} isFalling={false}/>
        <StaticModel path="/models/treebranch.glb" position={branchPosition} scale={[1, 1, 1]} isFalling={isFalling}/>

        {/* UI Overlay */}
        <Html fullscreen>
  <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between', 
      height: '100%', 
      textAlign: 'center'
    }}>
    
    <h1>SAVE FROGGO</h1>
    
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'column', 
        marginBottom: '50px' // Adjust as needed for spacing
      }}>
      
      {!gameStarted && !gameOver ? (
        <div>
          <input
            type="text"
            placeholder="Choice 1"
            value={choice1}
            onChange={(e) => setChoice1(e.target.value)}
          />
          <input
            type="text"
            placeholder="Choice 2"
            value={choice2}
            onChange={(e) => setChoice2(e.target.value)}
          />
          <div>
            <button onClick={handleStart} disabled={!choice1 || !choice2 || choice1 === choice2}>
              Start
            </button>
          </div>
        </div>
      ) : (
        <div>
          {!gameOver ? (
            <>
              <button onClick={playAnimationLeft}>{choice1}</button>
              <button onClick={playAnimationRight}>{choice2}</button>
              <p>Time Remaining: {timeRemaining} seconds</p>
            </>
          ) : (
            <h1>{selectedChoice ? 'Well played!' : 'Game Over!'}</h1>
          )}
        </div>
      )}
      {selectedChoice && <p>You selected: {selectedChoice}</p>}
      {gameOver && <button onClick={restartGame}>Restart</button>}
      <p>Help making decisions with gamification (and to save Froggo).</p>
          {/* Music Button */}
    <div style={{ 
        position: 'absolute', 
        bottom: '20px', // Distance from the bottom of the screen
        left: '20px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
      }}>
      <div onClick={toggleMusic} style={{cursor: 'pointer'}}>
        {!isMusicPlaying ? "🔇" : "🔊"} {/* Toggle icon based on mute state */}
      </div>
    </div>
    </div>



  </div>
</Html>

      </Canvas>
    </div>
  );
};

export default Page;
