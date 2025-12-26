// Full Combat Game with AI and Player Systems
import { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { Arena } from './Arena';
import { Soldier } from './Soldier';
import { CoverBoxes } from './CoverBox';
import { Bullet } from './Bullet';
import { FirstPersonControls } from './FirstPersonControls';
import { Crosshair } from './Crosshair';
import { HUD } from './HUD';
import { SettingsPanel } from './SettingsPanel';
import { GameOver } from './GameOver';

import { useGameState } from '../../hooks/useGameState';
import { useGameAudio } from '../../hooks/useGameAudio';
import { useHealthSystem } from '../../hooks/useHealthSystem';
import { getDifficultyConfig } from '../../utils/difficultyConfig';

interface BulletData {
  id: number;
  startPosition: THREE.Vector3;
  direction: THREE.Vector3;
  isPlayerBullet: boolean;
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
  
  // Player health system
  const playerHealth = useHealthSystem(150);
  
  // Enemy health system
  const [enemyHealth, setEnemyHealth] = useState(150);
  const [enemyPosition, setEnemyPosition] = useState(new THREE.Vector3(0, 0, -10));
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1.7, 5));
  
  // Get difficulty config
  const difficultyConfig = getDifficultyConfig(settings.difficulty);
  
  // Cover positions for AI
  const coverPositions = [
    new THREE.Vector3(-10, 1, -10),
    new THREE.Vector3(10, 1, -10),
    new THREE.Vector3(-15, 1, 0),
    new THREE.Vector3(15, 1, 0),
    new THREE.Vector3(0, 1, -20),
    new THREE.Vector3(-8, 1, 8),
    new THREE.Vector3(8, 1, 8),
    new THREE.Vector3(0, 1, 15),
  ];
  
  // Bullet system
  const [bullets, setBullets] = useState<BulletData[]>([]);
  const [nextBulletId, setNextBulletId] = useState(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const [isRecoiling, setIsRecoiling] = useState(false);

  // Handle player death
  useEffect(() => {
    if (!playerHealth.isAlive) {
      setTimeout(() => {
        playerHealth.respawn();
        console.log('Player respawned after 3 seconds');
      }, 3000);
    }
  }, [playerHealth.isAlive, playerHealth.respawn]);

  // Handle enemy death
  useEffect(() => {
    if (enemyHealth <= 0) {
      setTimeout(() => {
        setEnemyHealth(difficultyConfig.enemyHealth);
        // Respawn enemy at random position
        const newX = (Math.random() - 0.5) * 20;
        const newZ = (Math.random() - 0.5) * 20;
        setEnemyPosition(new THREE.Vector3(newX, 0, newZ));
        console.log('Enemy respawned after 3 seconds');
      }, 3000);
    }
  }, [enemyHealth, difficultyConfig.enemyHealth]);

  // Create bullet
  const createBullet = useCallback((startPos: THREE.Vector3, direction: THREE.Vector3, isPlayer: boolean) => {
    const newBullet: BulletData = {
      id: nextBulletId,
      startPosition: startPos.clone(),
      direction: direction.normalize(),
      isPlayerBullet: isPlayer,
    };
    
    setBullets(prev => [...prev, newBullet]);
    setNextBulletId(prev => prev + 1);
  }, [nextBulletId]);

  // Remove bullet
  const removeBullet = useCallback((id: number) => {
    setBullets(prev => prev.filter(bullet => bullet.id !== id));
  }, []);

  // Handle bullet hits
  const handleBulletHit = useCallback((bullet: BulletData, target: THREE.Object3D, damage: number) => {
    if (bullet.isPlayerBullet) {
      // Player hit enemy
      setEnemyHealth(prev => Math.max(0, prev - damage));
      const isHeadshot = target.userData?.hitType === 'head';
      playHitSound(isHeadshot);
      recordHit(isHeadshot);
      console.log(`Enemy hit for ${damage} damage, health: ${enemyHealth - damage}`);
    } else {
      // Enemy hit player
      playerHealth.takeDamage(damage);
      console.log(`Player took ${damage} damage, health: ${playerHealth.health}`);
    }
  }, [playHitSound, recordHit, playerHealth, enemyHealth]);

  // Enemy AI shooting with proper bullet spawn position and rate limiting
  const handleEnemyShoot = useCallback((direction: THREE.Vector3, startPosition: THREE.Vector3) => {
    // Rate limiting: prevent too many bullets
    const now = Date.now();
    const timeSinceLastBullet = now - (handleEnemyShoot as any).lastBulletTime || 0;
    
    if (timeSinceLastBullet < 400) { // Reduced to 400ms between bullets
      return;
    }
    
    (handleEnemyShoot as any).lastBulletTime = now;
    
    createBullet(startPosition, direction, false);
    console.log('Enemy fired from position:', startPosition);
  }, [createBullet]);

  // Start game
  const handleStartGame = useCallback(() => {
    initAudio();
    startGame();
    playerHealth.respawn();
    setEnemyHealth(difficultyConfig.enemyHealth);
  }, [initAudio, startGame, playerHealth, difficultyConfig.enemyHealth]);

  // Handle player shooting
  const handleShoot = useCallback(
    (raycaster: THREE.Raycaster) => {
      if (!gameState.isPlaying || gameState.isPaused) return;

      playShootSound();
      recordShot();

      setIsRecoiling(true);
      setTimeout(() => setIsRecoiling(false), 80);

      // Create player bullet
      const direction = raycaster.ray.direction.clone();
      const startPos = raycaster.ray.origin.clone();
      createBullet(startPos, direction, true);
    },
    [gameState.isPlaying, gameState.isPaused, playShootSound, recordShot, createBullet]
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
      {!gameState.isPlaying && gameState.shots === 0 && (
        <SettingsPanel 
          settings={settings} 
          onUpdateSettings={updateSettings} 
          onStartGame={handleStartGame} 
        />
      )}
      
      {gameState.isPlaying && (
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
          <CoverBoxes />

          {/* Enemy soldier */}
          {enemyHealth > 0 && (
            <Soldier
              position={[enemyPosition.x, enemyPosition.y, enemyPosition.z]}
              playerPosition={playerPosition}
              onShoot={handleEnemyShoot}
              health={enemyHealth}
              maxHealth={difficultyConfig.enemyHealth}
              onDeath={() => console.log('Enemy died!')}
              difficulty={settings.difficulty}
              coverPositions={coverPositions}
            />
          )}

          {/* Bullets */}
          {bullets.map((bullet) => (
            <Bullet
              key={bullet.id}
              startPosition={bullet.startPosition}
              direction={bullet.direction}
              isPlayerBullet={bullet.isPlayerBullet}
              onHit={(target, damage) => handleBulletHit(bullet, target, damage)}
              onExpire={() => removeBullet(bullet.id)}
              damage={bullet.isPlayerBullet ? 25 : difficultyConfig.enemyDamage}
            />
          ))}

          <FirstPersonControls
            sensitivity={settings.sensitivity}
            isPlaying={gameState.isPlaying}
            isPaused={gameState.isPaused}
            onShoot={handleShoot}
            onPositionChange={setPlayerPosition}
          />
        </Canvas>
      )}

      {/* Player health bar */}
      {gameState.isPlaying && (
        <div className="fixed top-4 left-4 z-50">
          <div className="bg-black/50 p-2 rounded">
            <div className="text-white text-sm mb-1">Health: {playerHealth.health}/150</div>
            <div className="w-32 h-3 bg-gray-700 rounded">
              <div 
                className={`h-full rounded transition-all duration-300 ${
                  playerHealth.getHealthPercentage() > 60 ? 'bg-green-500' :
                  playerHealth.getHealthPercentage() > 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${playerHealth.getHealthPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Death screen */}
      {!playerHealth.isAlive && (
        <div className="fixed inset-0 flex items-center justify-center bg-red-900/80 z-50">
          <div className="text-center">
            <h2 className="text-4xl font-display text-white mb-4">YOU DIED</h2>
            <p className="text-white">Respawning in 3 seconds...</p>
          </div>
        </div>
      )}

      {/* UI overlays */}
      {gameState.isPlaying && playerHealth.isAlive && (
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
