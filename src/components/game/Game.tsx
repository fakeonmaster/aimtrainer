// Main game component that orchestrates all game systems
import { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { Arena } from './Arena';
import { Target } from './Target';
import { FirstPersonControls } from './FirstPersonControls';
import { Crosshair } from './Crosshair';
import { HUD } from './HUD';
import { SettingsPanel } from './SettingsPanel';
import { GameOver } from './GameOver';

import { useGameState } from '@/hooks/useGameState';
import { useTargets } from '@/hooks/useTargets';
import { useGameAudio } from '@/hooks/useGameAudio';

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

  const { target, spawnTarget, destroyTarget, resetTargets } = useTargets({
    targetSize: settings.targetSize,
    targetSpeed: settings.targetSpeed,
    isPlaying: gameState.isPlaying,
  });

  const { playShootSound, playHitSound, initAudio } = useGameAudio();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [isRecoiling, setIsRecoiling] = useState(false);

  // Handle game start
  const handleStartGame = useCallback(() => {
    initAudio();
    startGame();
    resetTargets();
    setTimeout(() => spawnTarget(), 500);
  }, [initAudio, startGame, resetTargets, spawnTarget]);

  // Handle shooting
  const handleShoot = useCallback((raycaster: THREE.Raycaster) => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    playShootSound();
    recordShot();

    // Recoil effect
    setIsRecoiling(true);
    setTimeout(() => setIsRecoiling(false), 80);

    // Check for hit
    if (sceneRef.current && target) {
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      
      for (const intersect of intersects) {
        const hitType = intersect.object.userData?.hitType;
        
        if (hitType === 'head' || hitType === 'body') {
          const isHeadshot = hitType === 'head';
          
          playHitSound(isHeadshot);
          recordHit(isHeadshot);
          destroyTarget();
          break;
        }
      }
    }
  }, [gameState.isPlaying, gameState.isPaused, target, playShootSound, recordShot, playHitSound, recordHit, destroyTarget]);

  // Game timer
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && gameState.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        updateTime(gameState.timeRemaining - 1);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.timeRemaining, updateTime]);

  // End game when time runs out
  useEffect(() => {
    if (gameState.isPlaying && gameState.timeRemaining <= 0) {
      endGame();
    }
  }, [gameState.isPlaying, gameState.timeRemaining, endGame]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && gameState.isPlaying) {
        togglePause();
        document.exitPointerLock();
      }
      
      if (event.code === 'Enter' && !gameState.isPlaying && gameState.shots > 0) {
        handleStartGame();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, gameState.shots, togglePause, handleStartGame]);

  // Determine which screen to show
  const showSettings = !gameState.isPlaying && gameState.shots === 0;
  const showGameOver = !gameState.isPlaying && gameState.shots > 0;
  const showGame = gameState.isPlaying;

  return (
    <div className={`game-container no-select ${isRecoiling ? 'recoil' : ''}`}>
      {/* 3D Canvas - always rendered */}
      <Canvas
        camera={{ fov: 90, near: 0.1, far: 1000, position: [0, 1.7, 0] }}
        onCreated={({ scene }) => {
          sceneRef.current = scene;
        }}
        style={{ background: '#0a0f14' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 10]} intensity={0.5} />
        <fog attach="fog" args={['#0a0f14', 20, 60]} />

        {/* Arena */}
        <Arena />

        {/* Target */}
        {target && showGame && (
          <Target
            target={target}
            onHit={(isHeadshot) => {
              recordHit(isHeadshot);
              playHitSound(isHeadshot);
              destroyTarget();
            }}
          />
        )}

        {/* First-person controls */}
        <FirstPersonControls
          sensitivity={settings.sensitivity}
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
          onShoot={handleShoot}
        />
      </Canvas>

      {/* UI Overlays */}
      {showGame && (
        <>
          <Crosshair
            showHitMarker={gameState.showHitMarker}
            isHeadshot={gameState.isHeadshot}
          />
          <HUD
            score={gameState.score}
            accuracy={accuracy}
            timeRemaining={gameState.timeRemaining}
            headshots={gameState.headshots}
            isPlaying={gameState.isPlaying}
          />
        </>
      )}

      {/* Pause overlay */}
      {gameState.isPaused && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-center">
            <h2 className="text-3xl font-display text-primary text-glow-primary mb-4">
              PAUSED
            </h2>
            <p className="text-muted-foreground mb-6">
              Click anywhere to resume
            </p>
            <button
              onClick={togglePause}
              className="btn-tactical"
            >
              RESUME
            </button>
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdateSettings={updateSettings}
          onStartGame={handleStartGame}
        />
      )}

      {/* Game over screen */}
      {showGameOver && (
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
