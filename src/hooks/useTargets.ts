import { useState, useCallback } from 'react';

interface TargetType {
  position: { x: number; y: number; z: number };
}

interface UseTargetsProps {
  targetSize: number;
  targetSpeed: number;
  isPlaying: boolean;
}

export function useTargets({ targetSize, targetSpeed, isPlaying }: UseTargetsProps) {
  const [target, setTarget] = useState<TargetType | null>(null);

  const getRandomPosition = () => {
    const arenaSize = 10;
    const x = (Math.random() - 0.5) * (arenaSize - 2);
    const y = 1.5; // target height
    const z = -4; // directly in front of player
    return { x, y, z };
  };

  const spawnTarget = useCallback(() => {
    setTarget({ position: getRandomPosition() });
  }, []);

  const destroyTarget = useCallback(() => {
    setTarget(null);
    setTimeout(() => spawnTarget(), 1000); // respawn after 1s
  }, [spawnTarget]);

  const resetTargets = useCallback(() => {
    spawnTarget();
  }, [spawnTarget]);

  return {
    target,
    spawnTarget,
    destroyTarget,
    resetTargets,
  };
}
