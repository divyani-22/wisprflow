import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Flo } from './Flo';

interface WelcomeProps {
  onStart: () => void;
}

const KNOB = 48;
const PAD = 6;

/** Slide-to-start control: drag the knob to the end, or just click it. */
function SlideToStart({ onComplete }: { onComplete: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const origin = useRef<{ pointer: number; moved: boolean } | null>(null);

  const max = () => (trackRef.current?.clientWidth ?? 0) - KNOB - PAD * 2;

  const finish = () => {
    setX(max());
    window.setTimeout(onComplete, 180);
  };

  return (
    <div
      ref={trackRef}
      className="relative h-[60px] w-full max-w-[320px] select-none rounded-full border border-white/15 bg-white/[0.04]"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-accent-500/15"
        style={{ width: x + KNOB + PAD * 2, transition: dragging ? 'none' : 'width 0.25s' }}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 pl-10 text-sm font-semibold text-ink-100">
        Get started
        <span className="flex text-ink-400" aria-hidden="true">
          <ChevronRight className="-mr-2 h-4 w-4 opacity-40" />
          <ChevronRight className="-mr-2 h-4 w-4 opacity-70" />
          <ChevronRight className="h-4 w-4" />
        </span>
      </span>
      <button
        className="absolute top-[5px] grid touch-none place-items-center rounded-full bg-accent-500 text-white shadow-[0_6px_20px_-4px_rgba(139,116,248,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        style={{ width: KNOB, height: KNOB, left: PAD, transform: `translateX(${x}px)`, transition: dragging ? 'none' : 'transform 0.25s cubic-bezier(0.2,0.8,0.2,1)' }}
        aria-label="Get started"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          origin.current = { pointer: e.clientX - x, moved: false };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!origin.current) return;
          const next = Math.max(0, Math.min(max(), e.clientX - origin.current.pointer));
          if (Math.abs(next - x) > 2) origin.current.moved = true;
          setX(next);
        }}
        onPointerUp={() => {
          const moved = origin.current?.moved;
          origin.current = null;
          setDragging(false);
          if (!moved || x > max() * 0.6) finish();
          else setX(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            finish();
          }
        }}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export function Welcome({ onStart }: WelcomeProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onStart();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart]);

  return (
    <div
      className={`ambient fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-6 transition-opacity duration-300 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="grid w-full max-w-4xl items-center gap-10 md:grid-cols-[1.1fr_1fr]">
        <div className="order-2 flex flex-col items-center text-center md:order-1 md:items-start md:text-left animate-rise">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-ink-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Works with Wispr Flow
          </p>
          <h1 className="text-5xl font-medium leading-[1.05] tracking-tight text-ink-100 sm:text-6xl">
            Meet <span className="font-extrabold text-accent-400">Flo.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-300">
            Talk through any process — a signup, a checkout, a release — and Flo draws it as a flowchart you can rearrange and edit.
          </p>
          <ol className="mt-6 space-y-2 text-sm text-ink-400">
            {['Click Flo or press the mic', 'Say your steps in order', 'Drag, rename and export'].map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/10 font-mono text-[11px] text-ink-300">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <div className="mt-9 w-full max-w-[320px]">
            <SlideToStart
              onComplete={() => {
                setLeaving(true);
                window.setTimeout(onStart, 280);
              }}
            />
          </div>
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <div className="relative">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-600/25 blur-3xl" />
            <div className="absolute -left-6 top-4 z-10 rounded-3xl rounded-br-md border border-white/10 bg-ink-850/90 px-4 py-2.5 text-sm font-medium text-ink-100 shadow-xl backdrop-blur animate-rise [animation-delay:0.4s] sm:-left-20">
              Need a flowchart?
            </div>
            <div className="relative animate-float">
              <Flo size={220} mood={leaving ? 'happy' : 'idle'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
