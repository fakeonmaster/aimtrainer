// Game HUD displaying score, accuracy, and time
import { useEffect, useState } from 'react';

interface HUDProps {
  score: number;
  accuracy: number;
  timeRemaining: number;
  headshots: number;
  isPlaying: boolean;
}

export function HUD({ score, accuracy, timeRemaining, headshots, isPlaying }: HUDProps) {
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [prevScore, setPrevScore] = useState(score);

  // Animate score on change
  useEffect(() => {
    if (score !== prevScore) {
      setScoreAnimation(true);
      setPrevScore(score);
      const timer = setTimeout(() => setScoreAnimation(false), 300);
      return () => clearTimeout(timer);
    }
  }, [score, prevScore]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Time warning colors
  const timeColor = timeRemaining <= 5 
    ? 'text-destructive' 
    : timeRemaining <= 10 
      ? 'text-accent' 
      : 'text-primary';

  if (!isPlaying) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 p-6">
      {/* Top bar */}
      <div className="flex justify-between items-start">
        {/* Score panel */}
        <div className="hud-panel px-6 py-4">
          <div className="stat-label mb-1">Score</div>
          <div className={`stat-value ${scoreAnimation ? 'animate-score-pop' : ''}`}>
            {score.toLocaleString()}
          </div>
          {headshots > 0 && (
            <div className="text-xs text-accent mt-1">
              {headshots} headshot{headshots !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="hud-panel px-8 py-4 text-center">
          <div className="stat-label mb-1">Time</div>
          <div className={`stat-value ${timeColor} ${timeRemaining <= 5 ? 'animate-pulse' : ''}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Accuracy panel */}
        <div className="hud-panel px-6 py-4 text-right">
          <div className="stat-label mb-1">Accuracy</div>
          <div className="stat-value">
            {accuracy}%
          </div>
        </div>
      </div>

      {/* Bottom center - instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="hud-panel px-4 py-2 text-xs text-muted-foreground text-center">
          <span className="text-primary">WASD</span> Move • 
          <span className="text-primary ml-2">Mouse</span> Aim • 
          <span className="text-primary ml-2">Click</span> Shoot • 
          <span className="text-primary ml-2">ESC</span> Pause
        </div>
      </div>
    </div>
  );
}
