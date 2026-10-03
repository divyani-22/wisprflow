import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typing for the (still prefixed in Chromium/Safari) Web Speech API
interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

const getRecognition = (): RecognitionCtor | undefined => {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

interface UseSpeechOptions {
  onFinal: (text: string) => void;
  /** Receives the microphone level (0-1) every animation frame while listening */
  levelRef: React.RefObject<number>;
}

/**
 * Browser speech recognition with a live mic level meter. This is the
 * fallback path: when Wispr Flow is running it types straight into the
 * focused text field, so no browser API is involved at all.
 */
export function useSpeech({ onFinal, levelRef }: UseSpeechOptions) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const frameRef = useRef(0);
  const onFinalRef = useRef(onFinal);
  const lastInterimRef = useRef('');

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const supported = typeof window !== 'undefined' && !!getRecognition();

  const stopMeter = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioRef.current?.close().catch(() => {});
    audioRef.current = null;
  }, []);

  const startMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audio = new AudioContext();
      audioRef.current = audio;
      const analyser = audio.createAnalyser();
      analyser.fftSize = 512;
      audio.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += ((v - 128) / 128) ** 2;
        levelRef.current = Math.min(1, Math.sqrt(sum / buf.length) * 5);
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // The meter is cosmetic; recognition can still work without it
    }
  }, [levelRef]);

  const stop = useCallback(() => {
    if (lastInterimRef.current) {
      onFinalRef.current(lastInterimRef.current);
      lastInterimRef.current = '';
    }
    setInterim('');
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognition();
    if (!Ctor || recRef.current) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || 'en-US';

    rec.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const finalChunk = r[0].transcript.trim();
          if (finalChunk) {
            lastInterimRef.current = '';
            onFinalRef.current(finalChunk);
          }
        } else {
          live += r[0].transcript;
        }
      }
      lastInterimRef.current = live.trim();
      setInterim(live);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') setError('Microphone access was blocked.');
      else if (e.error !== 'no-speech' && e.error !== 'aborted') setError('Speech recognition stopped unexpectedly.');
    };

    rec.onend = () => {
      if (lastInterimRef.current) {
        onFinalRef.current(lastInterimRef.current);
        lastInterimRef.current = '';
      }
      recRef.current = null;
      setListening(false);
      setInterim('');
      stopMeter();
    };

    setError(null);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      startMeter();
    } catch {
      recRef.current = null;
    }
  }, [startMeter, stopMeter]);

  useEffect(
    () => () => {
      if (lastInterimRef.current) {
        onFinalRef.current(lastInterimRef.current);
        lastInterimRef.current = '';
      }
      recRef.current?.stop();
      stopMeter();
    },
    [stopMeter],
  );

  return { supported, listening, interim, error, start, stop };
}
