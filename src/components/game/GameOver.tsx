// Game over screen with results
interface GameOverProps {
  score: number;
  accuracy: number;
  headshots: number;
  hits: number;
  shots: number;
  onRestart: () => void;
}

export function GameOver({ score, accuracy, headshots, hits, shots, onRestart }: GameOverProps) {
  // Calculate rating based on accuracy
  const getRating = () => {
    if (accuracy >= 90) return { text: 'LEGENDARY', color: 'text-accent' };
    if (accuracy >= 80) return { text: 'EXCELLENT', color: 'text-success' };
    if (accuracy >= 70) return { text: 'GREAT', color: 'text-primary' };
    if (accuracy >= 50) return { text: 'GOOD', color: 'text-foreground' };
    return { text: 'KEEP PRACTICING', color: 'text-muted-foreground' };
  };

  const rating = getRating();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/98 z-50 animate-fade-in">
      <div className="max-w-md w-full mx-4 text-center">
        {/* Rating */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className={`text-5xl font-display font-bold ${rating.color} text-glow-primary mb-2`}>
            {rating.text}
          </div>
          <div className="text-muted-foreground text-sm uppercase tracking-widest">
            Session Complete
          </div>
        </div>

        {/* Score card */}
        <div className="hud-panel p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Main score */}
          <div className="mb-6 pb-6 border-b border-border">
            <div className="stat-label mb-2">Final Score</div>
            <div className="text-5xl font-display font-bold text-primary text-glow-primary">
              {score.toLocaleString()}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="stat-label mb-1">Accuracy</div>
              <div className="text-2xl font-display font-bold text-foreground">
                {accuracy}%
              </div>
            </div>
            <div>
              <div className="stat-label mb-1">Headshots</div>
              <div className="text-2xl font-display font-bold text-accent">
                {headshots}
              </div>
            </div>
            <div>
              <div className="stat-label mb-1">Hits</div>
              <div className="text-2xl font-display font-bold text-success">
                {hits}
              </div>
            </div>
            <div>
              <div className="stat-label mb-1">Shots Fired</div>
              <div className="text-2xl font-display font-bold text-foreground">
                {shots}
              </div>
            </div>
          </div>
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="btn-tactical w-full text-lg py-4 animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          PLAY AGAIN
        </button>

        {/* Tip */}
        <p className="mt-4 text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: '0.4s' }}>
          Press <span className="text-primary">ENTER</span> to restart quickly
        </p>
      </div>
    </div>
  );
}
