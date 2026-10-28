import { useEffect, useState, type CSSProperties } from 'react';
import { Button } from '../../../components/ui/Button';
import { clockTime } from './model';
/** Silent timeline simulation, deliberately does not claim to play a recorded file. */
export function AudioPreview({ duration, position, onPositionChange }: { duration: number; position: number; onPositionChange: (value: number) => void }) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const total = Math.max(1, duration);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => { if (position >= total) setPlaying(false); else onPositionChange(Math.min(total, position + speed)); }, 1000);
    return () => clearInterval(timer);
  }, [playing, speed, position, total, onPositionChange]);
  return <div className="ai-player"><div className="ai-player-controls">
    <Button shape="round" icon={playing ? 'pause-mini-fill' : 'play-large-fill'} iconOnly aria-label={playing ? '暂停回放' : '播放录音'} onClick={() => { if (position >= total) onPositionChange(0); setPlaying(!playing); }} />
    <div className="ai-player-track" style={{ '--ai-playback-progress': `${Math.min(100, position / total * 100)}%` } as CSSProperties}><input type="range" aria-label="录音进度" min="0" max={total} value={position} onChange={event => onPositionChange(Number(event.target.value))} /><div><span>{clockTime(position)}</span><span>{clockTime(duration)}</span></div></div>
    <Button variant="text" aria-label={`播放速度 ${speed} 倍`} onClick={() => setSpeed(speed === 2 ? 1 : speed + .5)}>{speed}×</Button>
  </div></div>;
}
