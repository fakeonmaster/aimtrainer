// Settings panel component
import { Slider } from '@/components/ui/slider';
import type { GameSettings, DifficultyLevel } from '../../hooks/useGameState';
import { getDifficultyConfig } from '../../utils/difficultyConfig';

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onStartGame: () => void;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'normal', label: 'Normal' },
  { value: 'hard', label: 'Hard' },
  { value: 'immortal', label: 'Immortal' },
];

export function SettingsPanel({ settings, onUpdateSettings, onStartGame }: SettingsPanelProps) {
  const currentDifficultyConfig = getDifficultyConfig(settings.difficulty);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 z-50 animate-fade-in">
      <div className="max-w-md w-full mx-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary text-glow-primary mb-2">
            COMBAT TRAINER
          </h1>
          <p className="text-muted-foreground text-sm">
            AI Combat Training System
          </p>
        </div>

        {/* Settings card */}
        <div className="hud-panel p-6 mb-6">
          <h2 className="text-lg font-display text-foreground mb-6 uppercase tracking-wider">
            Settings
          </h2>

          {/* Difficulty Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="stat-label">Enemy Difficulty</label>
              <span className="text-primary font-mono text-sm" style={{ color: currentDifficultyConfig.color }}>
                {settings.difficulty.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {DIFFICULTY_OPTIONS.map((option) => {
                const config = getDifficultyConfig(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => onUpdateSettings({ difficulty: option.value })}
                    className={`p-3 rounded border-2 transition-all text-sm font-medium ${
                      settings.difficulty === option.value
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-muted bg-muted/10 text-muted-foreground hover:border-primary/50'
                    }`}
                    style={{
                      borderColor: settings.difficulty === option.value ? config.color : undefined,
                      color: settings.difficulty === option.value ? config.color : undefined,
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {currentDifficultyConfig.description}
            </p>
          </div>

          {/* Sensitivity */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="stat-label">Mouse Sensitivity</label>
              <span className="text-primary font-mono text-sm">
                {(settings.sensitivity * 1000).toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.sensitivity * 1000]}
              onValueChange={([value]) => onUpdateSettings({ sensitivity: value / 1000 })}
              min={0.5}
              max={5}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Session Duration */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="stat-label">Session Duration</label>
              <span className="text-primary font-mono text-sm">
                {settings.sessionDuration}s
              </span>
            </div>
            <Slider
              value={[settings.sessionDuration]}
              onValueChange={([value]) => onUpdateSettings({ sessionDuration: value })}
              min={30}
              max={300}
              step={30}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>30s</span>
              <span>300s</span>
            </div>
          </div>
        </div>

        {/* Difficulty Stats */}
        <div className="hud-panel p-4 mb-6">
          <h3 className="text-sm font-display text-foreground mb-3 uppercase tracking-wider">
            Enemy Stats
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-muted-foreground">Health</div>
              <div className="text-primary font-mono">{currentDifficultyConfig.enemyHealth} HP</div>
            </div>
            <div>
              <div className="text-muted-foreground">Damage</div>
              <div className="text-primary font-mono">{currentDifficultyConfig.enemyDamage} DMG</div>
            </div>
            <div>
              <div className="text-muted-foreground">Accuracy</div>
              <div className="text-primary font-mono">{Math.round(currentDifficultyConfig.accuracy * 100)}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Reaction</div>
              <div className="text-primary font-mono">{currentDifficultyConfig.reactionTime}s</div>
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStartGame}
          className="btn-tactical w-full text-lg py-4"
          style={{ backgroundColor: currentDifficultyConfig.color + '20', borderColor: currentDifficultyConfig.color }}
        >
          START COMBAT
        </button>

        {/* Instructions */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p className="mb-1">WASD to move • Mouse to aim • Click to shoot</p>
          <p>Use cover boxes to avoid enemy fire • Survive and eliminate the AI</p>
        </div>
      </div>
    </div>
  );
}
