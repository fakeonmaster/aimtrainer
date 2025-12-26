// src/utils/difficultyConfig.ts
import { DifficultyLevel } from '../hooks/useGameState';

export interface DifficultyConfig {
  // AI Behavior
  detectionRange: number;      // How far AI can detect player
  shootingRange: number;       // Range at which AI starts shooting
  reactionTime: number;        // Time between shots (seconds)
  accuracy: number;           // AI shooting accuracy (0-1)
  moveSpeed: number;          // AI movement speed multiplier
  
  // AI Intelligence
  coverSeekingChance: number; // Probability of seeking cover when hit
  flankingChance: number;     // Probability of trying to flank player
  predictiveAiming: boolean;  // Whether AI predicts player movement
  
  // Health & Damage
  enemyHealth: number;        // Enemy starting health
  enemyDamage: number;        // Damage enemy deals
  
  // Visual indicators
  color: string;              // Difficulty color
  description: string;        // Difficulty description
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    detectionRange: 12,
    shootingRange: 10,
    reactionTime: 4.0,
    accuracy: 0.2,
    moveSpeed: 0.5,
    coverSeekingChance: 0.1,
    flankingChance: 0.0,
    predictiveAiming: false,
    enemyHealth: 100,
    enemyDamage: 15,
    color: '#00ff00',
    description: 'Slow reactions, poor aim, low health'
  },
  
  normal: {
    detectionRange: 15,
    shootingRange: 12,
    reactionTime: 3.0,
    accuracy: 0.4,
    moveSpeed: 0.7,
    coverSeekingChance: 0.2,
    flankingChance: 0.1,
    predictiveAiming: false,
    enemyHealth: 150,
    enemyDamage: 25,
    color: '#ffff00',
    description: 'Balanced AI with moderate skills'
  },
  
  hard: {
    detectionRange: 18,
    shootingRange: 15,
    reactionTime: 2.0,
    accuracy: 0.6,
    moveSpeed: 0.9,
    coverSeekingChance: 0.4,
    flankingChance: 0.3,
    predictiveAiming: true,
    enemyHealth: 200,
    enemyDamage: 35,
    color: '#ff6600',
    description: 'Fast, accurate, tactical AI'
  },
  
  immortal: {
    detectionRange: 22,
    shootingRange: 18,
    reactionTime: 1.5,
    accuracy: 0.8,
    moveSpeed: 1.1,
    coverSeekingChance: 0.6,
    flankingChance: 0.5,
    predictiveAiming: true,
    enemyHealth: 300,
    enemyDamage: 50,
    color: '#ff0000',
    description: 'Extremely intelligent, deadly accurate'
  }
};

export function getDifficultyConfig(difficulty: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIGS[difficulty];
}