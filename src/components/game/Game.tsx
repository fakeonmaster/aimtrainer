import { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { Arena } from './Arena';
import { Soldier } from './soldier';
import { FirstPersonControls } from './FirstPersonControls';
import { Crosshair } from './Crosshair';
import { HUD } from './HUD';
import { SettingsPanel } from './SettingsPanel';
import { GameOver } from './GameOver';

import { useGameState } from '@/hooks/useGameState';
import { useGameAudio } from '@/hooks/useGameAudio';

interface TargetPosition {
  x: number;
  y: number;
  z: number;
}

export function Game() {
  const {
    settings,
    gameState,
    accuracy,
    startGame,
    endGame,
    togglePause,
    recordShot,
    recordHit,
    updateTime,
    updateSettings,
  } = useGameState();

  const { playShootSound, playHitSound, initAudio } = useGameAudio();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const [isRecoiling, setIsRecoiling] = useState(false);
  const [targetPos, setTargetPos] = useState<TargetPosition | null>(null);

  // Spawn target inside arena at random position
  const spawnTarget = useCallback(() => {
    const arenaSize = 50; // same as Arena
    const x = (Math.random() - 0.5) * (arenaSize - 2); // avoid walls
    const y = 0.5; // height above floor
    const z = (Math.random() - 0.5) * (arenaSize - 2);
    setTargetPos({ x, y, z });
  }, []);

  // Start game
  const handleStartGame = useCallback(() => {
    initAudio();
    startGame();
    spawnTarget();
  }, [initAudio, startGame, spawnTarget]);

  // Handle shooting
  const handleShoot = useCallback(
    (raycaster: THREE.Raycaster) => {
      if (!gameState.isPlaying || gameState.isPaused || !targetPos) return;

      playShootSound();
      recordShot();

      setIsRecoiling(true);
      setTimeout(() => setIsRecoiling(false), 80);

      if (sceneRef.current) {
        const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
        for (const intersect of intersects) {
          const hitType = intersect.object.userData?.hitType || 'body'; // default body
          if (hitType === 'head' || hitType === 'body') {
            const isHeadshot = hitType === 'head';
            playHitSound(isHeadshot);
            recordHit(isHeadshot);

            // respawn target at new position
            spawnTarget();
            break;
          }
        }
      }
    },
    [gameState.isPlaying, gameState.isPaused, targetPos, playShootSound, recordShot, playHitSound, recordHit, spawnTarget]
  );

  // Timer countdown
  useEffect(() => {
    if (!gameState.isPlaying) return;
    const interval = setInterval(() => {
      if (!gameState.isPaused) {
        updateTime(gameState.timeRemaining - 1);
        if (gameState.timeRemaining - 1 <= 0) endGame();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.isPaused, gameState.timeRemaining, updateTime, endGame]);

  return (
    <div className={`game-container no-select ${isRecoiling ? 'recoil' : ''}`}>
      <Canvas
        shadows
        camera={{ fov: 90, near: 0.1, far: 1000, position: [0, 1.7, 5] }}
        onCreated={({ scene }) => (sceneRef.current = scene)}
        style={{ background: '#98b9daff', width: '100vw', height: '100vh' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={0.7} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} />
        <pointLight position={[0, 3, 0]} intensity={0.8} distance={15} />

        <Arena />

        {targetPos && (
          <Soldier
            position={[targetPos.x, targetPos.y, targetPos.z]}
          />
        )}

        <FirstPersonControls
          sensitivity={settings.sensitivity}
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
          onShoot={handleShoot}
        />
      </Canvas>

      {/* UI overlays */}
      {gameState.isPlaying && (
        <>
          <Crosshair showHitMarker={gameState.showHitMarker} isHeadshot={gameState.isHeadshot} />
          <HUD
            score={gameState.score}
            accuracy={accuracy}
            timeRemaining={gameState.timeRemaining}
            headshots={gameState.headshots}
            isPlaying={gameState.isPlaying}
          />
        </>
      )}

      {gameState.isPaused && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-center">
            <h2 className="text-3xl font-display text-primary mb-4">PAUSED</h2>
            <button onClick={togglePause} className="btn-tactical">
              RESUME
            </button>
          </div>
        </div>
      )}

      {!gameState.isPlaying && gameState.shots === 0 && (
        <SettingsPanel settings={settings} onUpdateSettings={updateSettings} onStartGame={handleStartGame} />
      )}

      {!gameState.isPlaying && gameState.shots > 0 && (
        <GameOver
          score={gameState.score}
          accuracy={accuracy}
          headshots={gameState.headshots}
          hits={gameState.hits}
          shots={gameState.shots}
          onRestart={handleStartGame}
        />
      )}
    </div>
  );
}
