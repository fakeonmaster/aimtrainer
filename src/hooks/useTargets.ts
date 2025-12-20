// Target data management
import { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';

export interface Target {
  id: string;
  position: THREE.Vector3;
  isMoving: boolean;
  moveDirection: number; // 1 or -1
  moveSpeed: number;
  size: number;
}

interface UseTargetsProps {
  targetSize: number;
  targetSpeed: number;
  isPlaying: boolean;
}

// Arena boundaries
const ARENA_WIDTH = 20;
const ARENA_DEPTH = 30;
const MIN_DISTANCE = 8;
const MAX_DISTANCE = 25;

export function useTargets({ targetSize, targetSpeed, isPlaying }: UseTargetsProps) {
  const [target, setTarget] = useState<Target | null>(null);
  const targetIdRef = useRef(0);

  // Generate a random spawn position
  const generateSpawnPosition = useCallback(() => {
    const x = (Math.random() - 0.5) * ARENA_WIDTH;
    const y = 1 + Math.random() * 3; // Height between 1 and 4 units
    const z = -(MIN_DISTANCE + Math.random() * (MAX_DISTANCE - MIN_DISTANCE));
    return new THREE.Vector3(x, y, z);
  }, []);

  // Spawn a new target
  const spawnTarget = useCallback(() => {
    if (!isPlaying) return;

    targetIdRef.current += 1;
    const isMoving = Math.random() > 0.4; // 60% chance of moving target
    
    const newTarget: Target = {
      id: `target-${targetIdRef.current}`,
      position: generateSpawnPosition(),
      isMoving,
      moveDirection: Math.random() > 0.5 ? 1 : -1,
      moveSpeed: isMoving ? targetSpeed * (0.5 + Math.random() * 0.5) : 0,
      size: targetSize,
    };

    setTarget(newTarget);
    return newTarget;
  }, [isPlaying, targetSize, targetSpeed, generateSpawnPosition]);

  // Remove current target and spawn a new one
  const destroyTarget = useCallback(() => {
    setTarget(null);
    // Small delay before spawning new target
    setTimeout(() => {
      spawnTarget();
    }, 200);
  }, [spawnTarget]);

  // Update target position (for moving targets)
  const updateTargetPosition = useCallback((delta: number) => {
    if (!target || !target.isMoving) return;

    setTarget(prev => {
      if (!prev) return null;

      const newX = prev.position.x + prev.moveDirection * prev.moveSpeed * delta;
      
      // Reverse direction at boundaries
      let newDirection = prev.moveDirection;
      if (Math.abs(newX) > ARENA_WIDTH / 2 - 1) {
        newDirection *= -1;
      }

      return {
        ...prev,
        position: new THREE.Vector3(
          Math.max(-ARENA_WIDTH / 2 + 1, Math.min(ARENA_WIDTH / 2 - 1, newX)),
          prev.position.y,
          prev.position.z
        ),
        moveDirection: newDirection,
      };
    });
  }, [target]);

  // Reset targets
  const resetTargets = useCallback(() => {
    setTarget(null);
    targetIdRef.current = 0;
  }, []);

  return {
    target,
    spawnTarget,
    destroyTarget,
    updateTargetPosition,
    resetTargets,
  };
}
