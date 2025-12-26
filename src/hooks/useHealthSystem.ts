// src/hooks/useHealthSystem.ts
import { useState, useCallback } from 'react';

interface HealthState {
  health: number;
  maxHealth: number;
  isAlive: boolean;
  lastDamageTime: number;
}

export function useHealthSystem(initialHealth: number = 150) {
  const [healthState, setHealthState] = useState<HealthState>({
    health: initialHealth,
    maxHealth: initialHealth,
    isAlive: true,
    lastDamageTime: 0,
  });

  const takeDamage = useCallback((damage: number) => {
    setHealthState(prev => {
      const newHealth = Math.max(0, prev.health - damage);
      return {
        ...prev,
        health: newHealth,
        isAlive: newHealth > 0,
        lastDamageTime: Date.now(),
      };
    });
  }, []);

  const heal = useCallback((amount: number) => {
    setHealthState(prev => ({
      ...prev,
      health: Math.min(prev.maxHealth, prev.health + amount),
    }));
  }, []);

  const respawn = useCallback(() => {
    setHealthState(prev => ({
      ...prev,
      health: prev.maxHealth,
      isAlive: true,
    }));
  }, []);

  const getHealthPercentage = useCallback(() => {
    return (healthState.health / healthState.maxHealth) * 100;
  }, [healthState.health, healthState.maxHealth]);

  return {
    ...healthState,
    takeDamage,
    heal,
    respawn,
    getHealthPercentage,
  };
}