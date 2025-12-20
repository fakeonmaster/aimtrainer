// Crosshair UI component
interface CrosshairProps {
  showHitMarker: boolean;
  isHeadshot: boolean;
}

export function Crosshair({ showHitMarker, isHeadshot }: CrosshairProps) {
  return (
    <div className="crosshair">
      {/* Crosshair lines */}
      <div className="crosshair-line" style={{ 
        width: '2px', 
        height: '12px', 
        top: '-18px',
        left: '-1px'
      }} />
      <div className="crosshair-line" style={{ 
        width: '2px', 
        height: '12px', 
        bottom: '-18px',
        left: '-1px'
      }} />
      <div className="crosshair-line" style={{ 
        width: '12px', 
        height: '2px', 
        left: '-18px',
        top: '-1px'
      }} />
      <div className="crosshair-line" style={{ 
        width: '12px', 
        height: '2px', 
        right: '-18px',
        top: '-1px'
      }} />
      
      {/* Center dot */}
      <div className="crosshair-dot" />

      {/* Hit marker */}
      {showHitMarker && (
        <div className={`hit-marker ${isHeadshot ? 'headshot-marker' : ''}`}>
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 32 32" 
            fill="none"
            style={{ transform: 'rotate(45deg)' }}
          >
            <line 
              x1="4" y1="16" x2="12" y2="16" 
              stroke={isHeadshot ? "#ffaa00" : "#00ff88"} 
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line 
              x1="20" y1="16" x2="28" y2="16" 
              stroke={isHeadshot ? "#ffaa00" : "#00ff88"} 
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line 
              x1="16" y1="4" x2="16" y2="12" 
              stroke={isHeadshot ? "#ffaa00" : "#00ff88"} 
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line 
              x1="16" y1="20" x2="16" y2="28" 
              stroke={isHeadshot ? "#ffaa00" : "#00ff88"} 
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
