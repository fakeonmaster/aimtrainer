// Settings panel component
import { Slider } from '@/components/ui/slider';
import type { GameSettings } from '@/hooks/useGameState';

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onStartGame: () => void;
}

export function SettingsPanel({ settings, onUpdateSettings, onStartGame }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 z-50 animate-fade-in">
      <div className="max-w-md w-full mx-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary text-glow-primary mb-2">
            AIM TRAINER
          </h1>
          <p className="text-muted-foreground text-sm">
            Precision training for tactical shooters
          </p>
        </div>

        {/* Settings card */}
        <div className="hud-panel p-6 mb-6">
          <h2 className="text-lg font-display text-foreground mb-6 uppercase tracking-wider">
            Settings
          </h2>

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

          {/* Target Speed */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="stat-label">Target Speed</label>
              <span className="text-primary font-mono text-sm">
                {settings.targetSpeed.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.targetSpeed]}
              onValueChange={([value]) => onUpdateSettings({ targetSpeed: value })}
              min={1}
              max={8}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Target Size */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="stat-label">Target Size</label>
              <span className="text-primary font-mono text-sm">
                {settings.targetSize.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[settings.targetSize]}
              onValueChange={([value]) => onUpdateSettings({ targetSize: value })}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Small</span>
              <span>Large</span>
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
              min={15}
              max={120}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>15s</span>
              <span>120s</span>
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStartGame}
          className="btn-tactical w-full text-lg py-4"
        >
          START TRAINING
        </button>

        {/* Instructions */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p className="mb-1">Click to lock mouse • Hit targets to score</p>
          <p>Headshots = 150 pts • Body shots = 100 pts</p>
        </div>
      </div>
    </div>
  );
}
