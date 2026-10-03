import { useEffect, useId, useRef } from 'react';

export type FloMood = 'idle' | 'listening' | 'thinking' | 'happy';

interface FloProps {
  mood?: FloMood;
  size?: number;
  /** Eyes follow the cursor around the page */
  followPointer?: boolean;
  className?: string;
}

/**
 * Flo, the VoiceArchitect mascot. Pure SVG so it stays crisp at any size
 * and can react to state without loading image assets.
 */
export function Flo({ mood = 'idle', size = 120, followPointer = true, className = '' }: FloProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    if (!followPointer) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const svg = svgRef.current;
        const eyes = eyesRef.current;
        if (!svg || !eyes) return;
        const box = svg.getBoundingClientRect();
        const dx = e.clientX - (box.left + box.width / 2);
        const dy = e.clientY - (box.top + box.height * 0.38);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 400);
        eyes.setAttribute('transform', `translate(${((dx / dist) * 4 * reach).toFixed(2)} ${((dy / dist) * 3 * reach).toFixed(2)})`);
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [followPointer]);

  const shell = `flo-shell-${uid}`;
  const visor = `flo-visor-${uid}`;
  const glow = `flo-glow-${uid}`;

  const eyeColor = mood === 'listening' ? '#7ee7ff' : '#c4b8ff';

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      className={`flo ${mood === 'listening' ? 'flo-listening' : ''} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={shell} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9d3f7" />
        </linearGradient>
        <linearGradient id={visor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#221d3d" />
          <stop offset="1" stopColor="#0f0c1d" />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="60" cy="134" rx="26" ry="3.5" fill="#000" opacity="0.35" />

      {/* antennas */}
      <g stroke="#cfc8f2" strokeWidth="3" strokeLinecap="round">
        <line x1="42" y1="24" x2="37" y2="10" />
        <line x1="78" y1="24" x2="83" y2="10" />
      </g>
      <g className="flo-antenna" filter={`url(#${glow})`} fill={eyeColor}>
        <circle cx="37" cy="9" r="4" />
        <circle cx="83" cy="9" r="4" />
      </g>

      {/* arms */}
      <rect x="21" y="94" width="11" height="25" rx="5.5" fill={`url(#${shell})`} transform="rotate(12 26 96)" />
      <g className="flo-arm-wave">
        <rect x="88" y="94" width="11" height="25" rx="5.5" fill={`url(#${shell})`} transform="rotate(-12 94 96)" />
      </g>

      {/* body */}
      <rect x="33" y="86" width="54" height="40" rx="18" fill={`url(#${shell})`} />
      <rect x="44" y="98" width="32" height="14" rx="7" fill="#e6e1fb" />
      <circle cx="60" cy="105" r="3.5" fill={eyeColor} filter={`url(#${glow})`} className="flo-antenna" />

      {/* ears */}
      <rect x="10" y="42" width="12" height="26" rx="6" fill="#c9c0f2" />
      <rect x="98" y="42" width="12" height="26" rx="6" fill="#c9c0f2" />
      <rect x="13" y="49" width="6" height="12" rx="3" fill={eyeColor} opacity="0.85" />
      <rect x="101" y="49" width="6" height="12" rx="3" fill={eyeColor} opacity="0.85" />

      {/* head */}
      <rect x="18" y="20" width="84" height="66" rx="28" fill={`url(#${shell})`} />
      <rect x="27" y="31" width="66" height="44" rx="19" fill={`url(#${visor})`} />
      <rect x="27.5" y="31.5" width="65" height="43" rx="18.5" fill="none" stroke={eyeColor} strokeOpacity="0.25" />

      {/* face */}
      <g ref={eyesRef}>
        <g filter={`url(#${glow})`}>
          {mood === 'happy' ? (
            <g fill="none" stroke={eyeColor} strokeWidth="3.5" strokeLinecap="round">
              <path d="M40 55 q7 -9 14 0" />
              <path d="M66 55 q7 -9 14 0" />
            </g>
          ) : mood === 'thinking' ? (
            <g fill={eyeColor}>
              <rect x="40" y="49" width="14" height="5" rx="2.5" />
              <rect x="66" y="49" width="14" height="5" rx="2.5" />
            </g>
          ) : (
            <g className="flo-eyes" fill={eyeColor}>
              <rect x="41" y="44" width="12" height={mood === 'listening' ? 16 : 14} rx="6" />
              <rect x="67" y="44" width="12" height={mood === 'listening' ? 16 : 14} rx="6" />
            </g>
          )}
        </g>
        {mood === 'listening' ? (
          <ellipse cx="60" cy="66" rx="4" ry="3" fill={eyeColor} opacity="0.9" />
        ) : (
          <path d="M55 64 q5 4 10 0" fill="none" stroke={eyeColor} strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
        )}
      </g>

      {/* highlight */}
      <path d="M30 32 q8 -9 22 -10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
