import { useEffect, useRef } from 'react';

interface VoiceOrbProps {
  /** Live input level between 0 and 1, read every frame */
  levelRef: React.RefObject<number>;
  size?: number;
}

const RINGS = 34;
const POINTS = 96;

/**
 * Wireframe "liquid" orb drawn on canvas. Each ring is a closed loop whose
 * radius is perturbed by a few phase-shifted sine waves; the input level
 * scales how far the loops are pushed out.
 */
export function VoiceOrb({ levelRef, size = 300 }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let smooth = 0;
    let frame = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const t = reduceMotion ? 0 : (now - start) / 1000;
      smooth += ((levelRef.current ?? 0) - smooth) * 0.12;
      const energy = 0.25 + smooth * 1.1;

      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = 'lighter';
      const cx = size / 2;
      const cy = size / 2;
      const base = size * 0.24;

      for (let i = 0; i < RINGS; i++) {
        const p = i / RINGS;
        const hue = 255 + Math.sin(p * Math.PI * 2 + t * 0.4) * 55; // violet -> cyan / pink
        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${0.1 + p * 0.12})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let j = 0; j <= POINTS; j++) {
          const a = (j / POINTS) * Math.PI * 2;
          const wobble =
            Math.sin(a * 3 + t * 0.9 + i * 0.16) * 0.55 +
            Math.sin(a * 5 - t * 1.3 + i * 0.09) * 0.3 +
            Math.sin(a * 2 + t * 0.5 - i * 0.2) * 0.4;
          const r = base + i * 1.6 + wobble * size * 0.07 * energy;
          const x = cx + Math.cos(a + t * 0.12) * r;
          const y = cy + Math.sin(a + t * 0.12) * r;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // dark core
      ctx.globalCompositeOperation = 'source-over';
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 1.05);
      core.addColorStop(0, 'rgba(9,8,15,0.95)');
      core.addColorStop(0.7, 'rgba(9,8,15,0.6)');
      core.addColorStop(1, 'rgba(9,8,15,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 1.05, 0, Math.PI * 2);
      ctx.fill();

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [levelRef, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="max-w-full" aria-hidden="true" />;
}
