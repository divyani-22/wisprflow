import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ChevronLeft, Eraser, Mic, Square } from 'lucide-react';
import { Flo, type FloMood } from './Flo';
import { VoiceOrb } from './VoiceOrb';
import { useSpeech } from '../lib/useSpeech';

interface VoiceSessionProps {
  onClose: () => void;
  onSubmit: (text: string, source: 'voice' | 'text') => void;
}

const EXAMPLES = [
  'Open the door, switch on the light, sit on the sofa, and then switch on the TV',
  'User signs up, verifies email, completes onboarding, lands on dashboard',
  'Product page, add to cart, checkout, payment, confirmation email',
];

export function VoiceSession({ onClose, onSubmit }: VoiceSessionProps) {
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const levelRef = useRef(0);
  const usedMicRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const appendFinal = useCallback((chunk: string) => {
    if (!chunk) return;
    usedMicRef.current = true;
    setText((prev) => (prev ? `${prev.replace(/\s+$/, '')} ${chunk}` : chunk));
  }, []);

  const speech = useSpeech({ onFinal: appendFinal, levelRef });

  // Auto-start microphone when opening voice session if supported
  useEffect(() => {
    textareaRef.current?.focus();
    if (speech.supported && !speech.listening) {
      speech.start();
    }
  }, []);

  // Let the orb settle back down after a burst of typed / dictated text
  useEffect(() => {
    let frame = 0;
    const decay = () => {
      if (!speech.listening) levelRef.current *= 0.95;
      frame = requestAnimationFrame(decay);
    };
    frame = requestAnimationFrame(decay);
    return () => cancelAnimationFrame(frame);
  }, [speech.listening]);

  const interimClean = speech.interim.trim();
  const currentValue = (text ? `${text.trim()} ${interimClean}` : interimClean).trim();
  const hasContent = !!currentValue;

  const submit = useCallback(() => {
    const value = (text ? `${text.trim()} ${speech.interim.trim()}` : speech.interim.trim()).trim();
    if (!value || thinking) return;
    speech.stop();
    setThinking(true);
    // Short beat so the transition from "listening" to "drawing" is smooth
    window.setTimeout(() => onSubmit(value, usedMicRef.current || speech.listening ? 'voice' : 'text'), 400);
  }, [text, speech, thinking, onSubmit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Keep the dictation box sized to its content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [text, speech.interim]);

  const mood: FloMood = thinking ? 'thinking' : speech.listening ? 'listening' : hasContent ? 'happy' : 'idle';
  const status = thinking
    ? 'Drawing your flowchart…'
    : speech.listening
      ? (hasContent ? 'Listening… tap the arrow or press Enter to draw' : 'Go ahead, speak your flow out loud…')
      : (hasContent ? 'Tap the arrow or press Enter to draw' : 'Tap mic to speak, or type your steps');

  const display = speech.interim ? `${text}${text ? ' ' : ''}${speech.interim}` : text;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-md animate-fade"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Voice session"
    >
      <div className="relative flex w-full max-w-[480px] flex-col items-center overflow-hidden rounded-[32px] border border-white/10 bg-ink-900/90 px-6 pb-6 pt-5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] animate-rise">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(113,88,232,0.25),transparent)]" />

        <header className="relative flex w-full items-center justify-between">
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-ink-200 transition-colors hover:bg-white/5" aria-label="Close">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-ink-100">Talk to Flo</span>
          <div className="w-10">
            <Flo mood={mood} size={34} followPointer={false} />
          </div>
        </header>

        <p className="relative mt-4 h-5 text-xs font-medium text-ink-400" aria-live="polite">
          {status}
        </p>

        <div className="relative -my-4">
          <VoiceOrb levelRef={levelRef} size={280} />
        </div>

        <label htmlFor="voice-transcript" className="sr-only">
          Describe your flow
        </label>
        <textarea
          id="voice-transcript"
          ref={textareaRef}
          rows={2}
          value={display}
          onChange={(e) => {
            setText(e.target.value);
            levelRef.current = 0.9;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="e.g. Open the door, switch on the light, sit on the sofa, switch on the TV…"
          className="relative w-full resize-none bg-transparent text-center text-lg font-semibold leading-snug text-ink-100 placeholder-ink-500 focus:outline-none"
        />

        {!hasContent && !speech.listening && (
          <div className="relative mt-3 flex flex-col gap-1.5">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => setText(ex)} className="rounded-full px-3 py-1 text-[11px] text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-200">
                “{ex}”
              </button>
            ))}
          </div>
        )}

        {speech.error && <p className="relative mt-2 text-xs text-rose-300">{speech.error}</p>}

        <div className="relative mt-6 flex w-full items-center justify-between">
          <button
            onClick={() => {
              setText('');
              usedMicRef.current = false;
              textareaRef.current?.focus();
            }}
            disabled={!hasContent}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-ink-300 transition-colors hover:bg-white/5 disabled:opacity-30"
            aria-label="Clear text"
            title="Clear"
          >
            <Eraser className="h-4 w-4" />
          </button>

          <div className="relative grid place-items-center">
            {speech.listening && (
              <>
                <span className="absolute h-16 w-16 rounded-full border border-accent-400/50 animate-ripple" />
                <span className="absolute h-16 w-16 rounded-full border border-accent-400/50 animate-ripple [animation-delay:0.6s]" />
              </>
            )}
            <button
              onClick={() => (speech.listening ? speech.stop() : speech.start())}
              disabled={!speech.supported || thinking}
              className={`relative grid h-16 w-16 place-items-center rounded-full border-2 transition-all ${
                speech.listening
                  ? 'border-accent-300 bg-accent-500 text-white shadow-[0_0_40px_rgba(139,116,248,0.6)]'
                  : 'border-accent-500/60 bg-ink-850 text-accent-300 hover:border-accent-400 hover:text-accent-200'
              } disabled:opacity-40`}
              aria-label={speech.listening ? 'Stop listening' : 'Use browser microphone'}
              title={speech.supported ? (speech.listening ? 'Stop' : 'Use browser microphone') : 'Browser speech recognition is not available — use Wispr Flow'}
            >
              {speech.listening ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-6 w-6" />}
            </button>
          </div>

          <button
            onClick={submit}
            disabled={!hasContent || thinking}
            className="grid h-11 w-11 place-items-center rounded-full bg-accent-500 text-white transition-colors hover:bg-accent-400 disabled:bg-white/5 disabled:text-ink-500"
            aria-label="Build flowchart"
            title="Build flowchart (Enter)"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>

        <p className="relative mt-4 text-center text-[11px] leading-relaxed text-ink-500">
          Wispr Flow types straight into this box. You can also talk directly into the mic!
        </p>
      </div>
    </div>
  );
}
