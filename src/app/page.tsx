"use client"; // Declare this component as a Client Component

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { StaticModel } from './StaticModel';
import { FroggoModel } from './FroggoModel';

const HEAD_INITIAL_POSITION = new THREE.Vector3(0, 0, 0);
const BRANCH_INITIAL_POSITION = new THREE.Vector3(0, 0, 0);

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
  const audioRef = React.useRef<HTMLAudioElement>(null)

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

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', margin: 0 }}>
      <audio ref={audioRef} src="music/goofy.mp3" loop />
      <Canvas
        style={{ height: '100%', width: '100%' }}
        camera={{
          position: [-1.61, -1.74, 2.63],
          fov: 60,
        }}
      >
        <ambientLight color={"white"} intensity={1.2} />
        <directionalLight intensity={1.3} />
        <FroggoModel path="/models/froggo.glb" position={dogPosition} isFalling={isFalling} />
        <StaticModel path="/models/tree.glb" position={branchPosition} scale={[1, 1, 1]} isFalling={false} />
        <StaticModel path="/models/treebranch.glb" position={branchPosition} scale={[1, 1, 1]} isFalling={isFalling} />

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
                <div onClick={toggleMusic} style={{ cursor: 'pointer' }}>
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
