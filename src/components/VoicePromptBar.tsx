import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles, AudioWaveform } from 'lucide-react';

interface VoicePromptBarProps {
  onExecuteCommand: (command: string) => void;
  statusMessage: string;
}

export const VoicePromptBar: React.FC<VoicePromptBarProps> = ({
  onExecuteCommand,
  statusMessage,
}) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<unknown>(null);

  useEffect(() => {
    // Optional Web Speech API fallback for direct in-browser testing
    const SpeechRec = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
                      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (SpeechRec) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recog = new (SpeechRec as any)();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recog.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        onExecuteCommand(text);
        setIsListening(false);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [onExecuteCommand]);

  const toggleMic = () => {
    if (!recognition) {
      // If Web Speech isn't available, focus the input for Wispr Flow dictation
      const inputEl = document.getElementById('voice-input-field');
      inputEl?.focus();
      return;
    }

    if (isListening) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognition as any).stop();
      setIsListening(false);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognition as any).start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      onExecuteCommand(transcript);
      setTranscript('');
    }
  };

  const handleChipClick = (sample: string) => {
    setTranscript(sample);
    onExecuteCommand(sample);
  };

  const sampleChips = [
    'Landing page, user login, cart, stripe payment, and database',
    'Customer inquiry, AI chatbot, ticket triage, and admin panel',
    'User signup, email verification, onboarding survey, and dashboard',
    'Add an email receipt sender',
  ];

  return (
    <div className="bg-slate-950/90 border-b border-slate-800/80 px-6 py-3.5 backdrop-blur-md z-10 shrink-0">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
        {/* Voice Dictation Button */}
        <button
          type="button"
          onClick={toggleMic}
          className={`relative p-3 rounded-xl border flex items-center justify-center transition-all ${
            isListening
              ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
              : 'bg-violet-600/20 border-violet-500/40 text-violet-300 hover:bg-violet-600 hover:text-white shadow-sm'
          }`}
          title="Dictate with Wispr Flow or toggle microphone"
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white animate-bounce" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          )}
        </button>

        {/* Input box */}
        <div className="relative flex-1">
          <input
            id="voice-input-field"
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Tell me what you need (e.g. 'I need a landing page, user login, cart, stripe payment, and database')..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            <kbd className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
              Wispr Hotkey
            </kbd>
          </div>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!transcript.trim()}
          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white font-medium text-xs transition-all shadow-md flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Suggestion Chips & Status message */}
      <div className="max-w-4xl mx-auto mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Try speaking:
          </span>
          {sampleChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-violet-500/40 transition-all font-mono"
            >
              {chip}
            </button>
          ))}
        </div>

        {statusMessage && (
          <div className="flex items-center gap-1.5 text-violet-300 font-mono text-[11px] bg-violet-950/40 border border-violet-800/40 px-2.5 py-0.5 rounded-full animate-fade-in">
            <AudioWaveform className="w-3 h-3 text-violet-400 animate-pulse" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
