import { useEffect, useRef } from 'react';

/** Decorative simulated signal. It never reads microphone input or changes recording time. */
export function RecordingWaveform({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last = 0;
    function draw(time: number) {
      if (!canvas || !context) return;
      const width = canvas.clientWidth, height = canvas.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const style = getComputedStyle(canvas);
      const gradient = context.createLinearGradient(0, 0, Math.max(1, width), 0);
      gradient.addColorStop(0, style.getPropertyValue('--color-ai-action-start').trim());
      gradient.addColorStop(1, style.getPropertyValue('--color-ai-action').trim());
      for (let layer = 0; layer < 3; layer++) {
        context.beginPath();
        context.strokeStyle = gradient;
        context.globalAlpha = layer === 0 ? .95 : .25;
        context.lineWidth = layer === 0 ? 1.5 : 2;
        for (let x = 0; x <= width; x += 2) {
          const progress = x / Math.max(1, width);
          const envelope = Math.sin(progress * Math.PI) ** 2;
          const phase = time / 900 + layer * 1.1;
          const signal = paused || reduced.matches ? 0 : Math.sin(progress * Math.PI * 3 + phase) * Math.sin(phase * .6 + layer);
          const y = height / 2 + signal * (4 + layer * 2) * envelope;
          if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.stroke();
      }
      context.globalAlpha = 1;
    }
    function tick(time: number) {
      if (time - last > 32) { draw(time); last = time; }
      frame = requestAnimationFrame(tick);
    }
    function update() {
      cancelAnimationFrame(frame);
      draw(0);
      if (!paused && !reduced.matches && !document.hidden) frame = requestAnimationFrame(tick);
    }
    const resize = new ResizeObserver(update);
    resize.observe(canvas);
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); reduced.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); };
  }, [paused]);
  return <canvas className="ai-recording-signal" ref={canvasRef} data-paused={paused || undefined} aria-hidden="true" />;
}
