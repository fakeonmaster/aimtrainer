// Game state management hook
import { useState, useCallback, useRef } from 'react';

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'immortal';

export interface GameSettings {
  sensitivity: number;
  targetSpeed: number;
  targetSize: number;
  sessionDuration: number;
  difficulty: DifficultyLevel;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  headshots: number;
  shots: number;
  hits: number;
  timeRemaining: number;
  showHitMarker: boolean;
  isHeadshot: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  sensitivity: 0.002,
  targetSpeed: 3,
  targetSize: 1,
  sessionDuration: 30,
  difficulty: 'normal',
};

const INITIAL_STATE: GameState = {
  isPlaying: false,
  isPaused: false,
  score: 0,
  headshots: 0,
  shots: 0,
  hits: 0,
  timeRemaining: 30,
  showHitMarker: false,
  isHeadshot: false,
};

export function useGameState() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_STATE,
    timeRemaining: DEFAULT_SETTINGS.sessionDuration,
  });
  
  const hitMarkerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start a new game session
  const startGame = useCallback(() => {
    setGameState({
      ...INITIAL_STATE,
      isPlaying: true,
      timeRemaining: settings.sessionDuration,
    });
  }, [settings.sessionDuration]);

  // End the current game
  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
    }));
  }, []);

  // Pause/unpause the game
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  // Record a shot
  const recordShot = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      shots: prev.shots + 1,
    }));
  }, []);

  // Record a hit
  const recordHit = useCallback((isHeadshot: boolean) => {
    // Clear any existing timeout
    if (hitMarkerTimeoutRef.current) {
      clearTimeout(hitMarkerTimeoutRef.current);
    }

    const points = isHeadshot ? 150 : 100;
    
    setGameState(prev => ({
      ...prev,
      hits: prev.hits + 1,
      score: prev.score + points,
      headshots: isHeadshot ? prev.headshots + 1 : prev.headshots,
      showHitMarker: true,
      isHeadshot,
    }));

    // Hide hit marker after animation
    hitMarkerTimeoutRef.current = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        showHitMarker: false,
        isHeadshot: false,
      }));
    }, 150);
  }, []);

  // Update time remaining
  const updateTime = useCallback((time: number) => {
    setGameState(prev => ({
      ...prev,
      timeRemaining: time,
    }));
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  // Calculate accuracy
  const accuracy = gameState.shots > 0 
    ? Math.round((gameState.hits / gameState.shots) * 100) 
    : 0;

  return {
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
  };
}
