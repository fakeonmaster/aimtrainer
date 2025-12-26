// Army Heavy Soldier with GLB model, physics and proper positioning
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { DifficultyLevel } from '../../hooks/useGameState';
import { getDifficultyConfig } from '../../utils/difficultyConfig';

interface SoldierProps {
  position?: [number, number, number];
  scale?: number;
  playerPosition?: THREE.Vector3;
  onShoot?: (direction: THREE.Vector3, startPosition: THREE.Vector3) => void;
  health?: number;
  maxHealth?: number;
  onDeath?: () => void;
  difficulty?: DifficultyLevel;
  coverPositions?: THREE.Vector3[];
}

type AIState = 'patrolling' | 'seeking' | 'shooting' | 'taking_cover' | 'flanking' | 'dead';

export function Soldier({ 
  position = [0, 0, -5], 
  scale = 1, 
  playerPosition,
  onShoot,
  health = 150,
  maxHealth = 150,
  onDeath,
  difficulty = 'normal',
  coverPositions = []
}: SoldierProps) {
  const groupRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Mesh>(null);
  const weaponTipRef = useRef<THREE.Mesh>(null);
  
  // Load the GLB model
  const gltf = useGLTF('/model/soldier.glb');
  const { actions, mixer } = useAnimations(gltf.animations, groupRef);
  
  const [aiState, setAiState] = useState<AIState>('seeking'); // Start in seeking mode
  const [lastShotTime, setLastShotTime] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(new THREE.Vector3(...position));
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3(...position));
  const [lookDirection, setLookDirection] = useState(new THREE.Vector3(0, 0, 1));
  const [flankDirection, setFlankDirection] = useState(1);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const config = getDifficultyConfig(difficulty);

  // Setup animations
  useEffect(() => {
    console.log('Available animations:', Object.keys(actions));
    
    // Play idle animation by default
    const idleAction = actions['Idle'] || actions['idle'] || actions['T-Pose'] || Object.values(actions)[0];
    if (idleAction) {
      idleAction.reset().play();
      setCurrentAction('idle');
    }
    
    return () => {
      // Cleanup animations
      Object.values(actions).forEach(action => action?.stop());
    };
  }, [actions]);

  // Animation helper function
  const playAnimation = (animationName: string, loop = true) => {
    if (currentAction === animationName) return;
    
    // Stop current animation
    if (currentAction && actions[currentAction]) {
      actions[currentAction].fadeOut(0.2);
    }
    
    // Find and play new animation
    const newAction = actions[animationName] || 
                     actions[animationName.toLowerCase()] || 
                     actions[animationName.charAt(0).toUpperCase() + animationName.slice(1)];
    
    if (newAction) {
      newAction.reset().fadeIn(0.2);
      newAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      newAction.play();
      setCurrentAction(animationName);
    }
  };

  // Ground collision detection with proper cover box collision
  const checkGroundCollision = (pos: THREE.Vector3): { y: number, blocked: boolean } => {
    // Arena floor is at y = 0, but model needs to be slightly above ground
    const groundY = 0.1; // Slightly above ground to prevent clipping
    
    // Check if position is inside arena bounds
    const arenaSize = 25; // Arena is 50x50, so half is 25
    if (Math.abs(pos.x) > arenaSize || Math.abs(pos.z) > arenaSize) {
      return { y: groundY, blocked: true }; // Outside arena, blocked
    }
    
    // Check collision with cover boxes
    for (const cover of coverPositions) {
      const distance = Math.sqrt(
        Math.pow(pos.x - cover.x, 2) + Math.pow(pos.z - cover.z, 2)
      );
      
      // If close to a cover box
      if (distance < 1.5) { // Cover box collision radius
        if (pos.y > cover.y + 1.8) { // If above the box
          return { y: cover.y + 2, blocked: false }; // Stand on top of box
        } else {
          return { y: groundY, blocked: true }; // Blocked by box
        }
      }
    }
    
    return { y: groundY, blocked: false }; // Default ground level, not blocked
  };

  // Find nearest cover
  const findNearestCover = (fromPos: THREE.Vector3): THREE.Vector3 | null => {
    if (coverPositions.length === 0) return null;
    
    let nearest = coverPositions[0];
    let minDistance = fromPos.distanceTo(nearest);
    
    for (const cover of coverPositions) {
      const distance = fromPos.distanceTo(cover);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = cover;
      }
    }
    
    return nearest.clone();
  };

  // Get weapon tip position for bullet spawning
  const getWeaponTipPosition = (): THREE.Vector3 => {
    if (groupRef.current) {
      // Calculate weapon tip position based on soldier's position and rotation
      const soldierPos = groupRef.current.position.clone();
      const soldierRotation = groupRef.current.rotation.y;
      
      // Weapon is roughly at chest height and extends forward from right hand
      const weaponOffset = new THREE.Vector3(
        Math.sin(soldierRotation) * 1.2, // Forward direction (increased distance)
        1.2, // Chest/shoulder height (adjusted for model scale)
        Math.cos(soldierRotation) * 1.2
      );
      
      return soldierPos.add(weaponOffset);
    }
    
    return currentPosition.clone().add(new THREE.Vector3(0, 1.2, 1.2));
  };

  // AI behavior with physics
  useFrame((state, delta) => {
    if (health <= 0) {
      setAiState('dead');
      return;
    }

    const time = state.clock.elapsedTime;
    
    // Update mixer for animations
    if (mixer) {
      mixer.update(delta);
    }
    
    // Apply gravity and ground collision
    const collision = checkGroundCollision(currentPosition);
    
    // Smooth position interpolation with physics
    const targetPos = targetPosition.clone();
    const targetCollision = checkGroundCollision(targetPos);
    
    // If target position is not blocked, move there
    if (!targetCollision.blocked) {
      currentPosition.lerp(targetPos, delta * 2.0 * config.moveSpeed); // Increased movement speed
    }
    
    // Apply ground collision
    currentPosition.y = collision.y;
    
    // Update group position
    if (groupRef.current) {
      groupRef.current.position.copy(currentPosition);
    }

    const distanceToPlayer = playerPosition ? currentPosition.distanceTo(playerPosition) : 100;
    const timeSinceLastShot = time - lastShotTime;
    const timeSinceLastHit = time - lastHitTime;
    
    // Hide muzzle flash by default
    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.visible = false;
    }

    const isMoving = currentPosition.distanceTo(targetPosition) > 0.1;

    switch (aiState) {
      case 'patrolling':
        // Play walking or idle animation
        if (isMoving) {
          playAnimation('Walking');
        } else {
          playAnimation('Idle');
        }
        
        // Slower patrol movement with ground constraints
        if (Math.random() < 0.005) {
          const newX = position[0] + (Math.random() - 0.5) * 8;
          const newZ = position[2] + (Math.random() - 0.5) * 8;
          const collision = checkGroundCollision(new THREE.Vector3(newX, 0, newZ));
          if (!collision.blocked) {
            setTargetPosition(new THREE.Vector3(newX, collision.y, newZ));
          }
        }
        
        if (distanceToPlayer < config.detectionRange) {
          setAiState('seeking');
        }
        break;

      case 'seeking':
        // Play walking animation
        if (isMoving) {
          playAnimation('Walking');
        } else {
          playAnimation('Idle');
        }
        
        if (playerPosition) {
          const direction = new THREE.Vector3().subVectors(playerPosition, currentPosition).normalize();
          setLookDirection(direction);
          
          // Flanking for higher difficulties
          if (Math.random() < config.flankingChance * 0.01 && timeSinceLastHit < 3) {
            setAiState('flanking');
            setFlankDirection(Math.random() > 0.5 ? 1 : -1);
            break;
          }
          
          // Move towards player but maintain distance
          if (distanceToPlayer > config.shootingRange + 2) {
            const newPos = currentPosition.clone().add(direction.multiplyScalar(2.0)); // Increased movement
            const collision = checkGroundCollision(newPos);
            if (!collision.blocked) {
              newPos.y = collision.y;
              setTargetPosition(newPos);
            }
          } else if (distanceToPlayer < config.shootingRange - 2) {
            // Back away if too close
            const newPos = currentPosition.clone().sub(direction.multiplyScalar(1.5));
            const collision = checkGroundCollision(newPos);
            if (!collision.blocked) {
              newPos.y = collision.y;
              setTargetPosition(newPos);
            }
          }
          
          // Switch to shooting
          if (distanceToPlayer < config.shootingRange && timeSinceLastShot > config.reactionTime) {
            setAiState('shooting');
          }
          
          // Seek cover if hit recently
          if (timeSinceLastHit < 2 && Math.random() < config.coverSeekingChance * 0.1) {
            setAiState('taking_cover');
          }
        }
        break;

      case 'flanking':
        // Play running animation
        playAnimation('Running');
        
        if (playerPosition) {
          const toPlayer = new THREE.Vector3().subVectors(playerPosition, currentPosition);
          const right = new THREE.Vector3().crossVectors(toPlayer, new THREE.Vector3(0, 1, 0)).normalize();
          const flankPos = currentPosition.clone().add(right.multiplyScalar(flankDirection * 3));
          const flankCollision = checkGroundCollision(flankPos);
          if (!flankCollision.blocked) {
            flankPos.y = flankCollision.y;
            setTargetPosition(flankPos);
          }
          setLookDirection(toPlayer.normalize());
          
          // Return to seeking after flanking
          setTimeout(() => setAiState('seeking'), 3000);
        }
        break;

      case 'shooting':
        // Play shooting animation
        playAnimation('Shooting', false);
        
        if (playerPosition && onShoot && timeSinceLastShot > config.reactionTime) {
          let shootDirection = new THREE.Vector3().subVectors(playerPosition, currentPosition).normalize();
          
          // Predictive aiming
          if (config.predictiveAiming) {
            const timeToHit = currentPosition.distanceTo(playerPosition) / 50;
            const predictedPos = playerPosition.clone();
            shootDirection = new THREE.Vector3().subVectors(predictedPos, currentPosition).normalize();
          }
          
          // Accuracy spread
          const spread = (1 - config.accuracy) * 0.2;
          shootDirection.x += (Math.random() - 0.5) * spread;
          shootDirection.y += (Math.random() - 0.5) * spread;
          shootDirection.z += (Math.random() - 0.5) * spread;
          shootDirection.normalize();
          
          setLookDirection(shootDirection);
          
          // Show muzzle flash
          if (muzzleFlashRef.current) {
            muzzleFlashRef.current.visible = true;
          }
          
          // Get proper weapon tip position for bullet spawn
          const weaponTipPos = getWeaponTipPosition();
          
          onShoot(shootDirection, weaponTipPos);
          setLastShotTime(time);
          
          // Return to seeking after shot
          setTimeout(() => {
            setAiState('seeking');
          }, 500);
        }
        break;

      case 'taking_cover':
        // Play crouching animation
        playAnimation('Crouching');
        
        const nearestCover = findNearestCover(currentPosition);
        if (nearestCover) {
          const coverCollision = checkGroundCollision(nearestCover);
          if (!coverCollision.blocked) {
            nearestCover.y = coverCollision.y;
            setTargetPosition(nearestCover);
          }
          if (currentPosition.distanceTo(nearestCover) < 2) {
            setTimeout(() => setAiState('seeking'), 2000);
          }
        } else {
          setAiState('seeking');
        }
        break;

      case 'dead':
        // Play death animation
        playAnimation('Death', false);
        
        if (onDeath) onDeath();
        break;
    }

    // Smooth look at target
    if (groupRef.current && (aiState === 'seeking' || aiState === 'shooting' || aiState === 'flanking')) {
      const lookAt = new THREE.Vector3().addVectors(currentPosition, lookDirection);
      const currentLookAt = new THREE.Vector3();
      groupRef.current.getWorldDirection(currentLookAt);
      const targetLookAt = lookAt.clone().sub(currentPosition).normalize();
      
      // Smooth rotation
      const euler = new THREE.Euler();
      euler.setFromQuaternion(groupRef.current.quaternion);
      const targetEuler = new THREE.Euler(0, Math.atan2(targetLookAt.x, targetLookAt.z), 0);
      
      euler.y = THREE.MathUtils.lerp(euler.y, targetEuler.y, delta * 3);
      groupRef.current.setRotationFromEuler(euler);
    }
  });

  // Track damage
  useEffect(() => {
    setLastHitTime(Date.now() / 1000);
  }, [health]);

  const healthPercentage = (health / maxHealth) * 100;
  const healthColor = healthPercentage > 60 ? '#00ff00' : healthPercentage > 30 ? '#ffff00' : '#ff0000';

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Health bar - positioned above the soldier */}
      <group position={[0, 2.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.0, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[-(1.0 - (healthPercentage/100 * 1.0))/2, 0, 0.001]}>
          <planeGeometry args={[healthPercentage/100 * 1.0, 0.08]} />
          <meshBasicMaterial color={healthColor} />
        </mesh>
      </group>

      {/* Difficulty indicator */}
      <mesh position={[0, 2.3, 0]}>
        <planeGeometry args={[0.8, 0.08]} />
        <meshBasicMaterial color={config.color} />
      </mesh>

      {/* AI State indicator */}
      <mesh position={[0, 2.15, 0]}>
        <planeGeometry args={[0.6, 0.06]} />
        <meshBasicMaterial color={
          aiState === 'dead' ? '#000000' :
          aiState === 'shooting' ? '#ff0000' :
          aiState === 'taking_cover' ? '#0000ff' :
          aiState === 'flanking' ? '#ff00ff' :
          aiState === 'seeking' ? '#ffff00' : '#00ff00'
        } />
      </mesh>

      {/* GLB Model with proper hitboxes */}
      <group position={[0, 0.1, 0]}>
        <primitive 
          object={gltf.scene} 
          scale={[0.3, 0.3, 0.3]}
          position={[0, 0, 0]}
        />
        
        {/* Invisible hitboxes for shooting */}
        {/* Head hitbox */}
        <mesh 
          position={[0, 1.6, 0]} 
          visible={false}
          userData={{ hitType: 'head', damage: 50 }}
        >
          <sphereGeometry args={[0.15]} />
        </mesh>
        
        {/* Body hitbox */}
        <mesh 
          position={[0, 1.0, 0]} 
          visible={false}
          userData={{ hitType: 'body', damage: 25 }}
        >
          <boxGeometry args={[0.4, 0.8, 0.3]} />
        </mesh>
        
        {/* Legs hitbox */}
        <mesh 
          position={[0, 0.4, 0]} 
          visible={false}
          userData={{ hitType: 'legs', damage: 15 }}
        >
          <boxGeometry args={[0.3, 0.6, 0.25]} />
        </mesh>
      </group>
      
      {/* Weapon tip marker (invisible, for bullet spawn) */}
      <mesh ref={weaponTipRef} position={[0.4, 1.2, 0.6]} visible={false}>
        <sphereGeometry args={[0.01]} />
      </mesh>
      
      {/* Muzzle flash effect */}
      <mesh ref={muzzleFlashRef} position={[0.4, 1.1, 0.6]} visible={false}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Preload the model
useGLTF.preload('/model/soldier.glb');
