import React, { useState, useEffect, useRef } from 'react';
import { Chapter, GenreType, DiceRollResult } from '../types';
import { sound } from '../utils/soundEngine';
import { 
  Volume2, 
  VolumeX, 
  Dices, 
  Send, 
  FastForward, 
  Sparkles, 
  Compass, 
  Bookmark,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface Props {
  currentChapter: Chapter;
  genre: GenreType;
  isLoading: boolean;
  onChooseOption: (optionText: string, diceResult?: DiceRollResult) => void;
  onOpenDiceModal: () => void;
  pendingDiceResult: DiceRollResult | null;
  onClearPendingDice: () => void;
}

export const StoryView: React.FC<Props> = ({
  currentChapter,
  genre,
  isLoading,
  onChooseOption,
  onOpenDiceModal,
  pendingDiceResult,
  onClearPendingDice,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customAction, setCustomAction] = useState('');
  const typewriterTimerRef = useRef<number | null>(null);

  // Typewriter effect when chapter narrative updates
  useEffect(() => {
    sound.playChapterChime();
    const fullText = currentChapter.narrative;
    setDisplayedText('');
    setIsTyping(true);
    sound.stopSpeech();
    setIsSpeaking(false);

    let charIndex = 0;
    // Speed: ~12ms per character for swift, engaging flow
    const interval = window.setInterval(() => {
      charIndex += 2; // advance 2 chars for brisk pacing
      if (charIndex >= fullText.length) {
        setDisplayedText(fullText);
        setIsTyping(false);
        window.clearInterval(interval);
      } else {
        setDisplayedText(fullText.slice(0, charIndex));
      }
    }, 14);

    typewriterTimerRef.current = interval;

    return () => {
      if (typewriterTimerRef.current) {
        window.clearInterval(typewriterTimerRef.current);
      }
    };
  }, [currentChapter.id]);

  // Keyboard shortcut listener for options [1], [2], [3]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (isLoading) return;

      if (e.key === '1' && currentChapter.options[0]) {
        handleSelect(currentChapter.options[0]);
      } else if (e.key === '2' && currentChapter.options[1]) {
        handleSelect(currentChapter.options[1]);
      } else if (e.key === '3' && currentChapter.options[2]) {
        handleSelect(currentChapter.options[2]);
      } else if (e.key === ' ' && isTyping) {
        skipTypewriter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapter.options, isTyping, isLoading, pendingDiceResult]);

  const skipTypewriter = () => {
    if (typewriterTimerRef.current) {
      window.clearInterval(typewriterTimerRef.current);
    }
    setDisplayedText(currentChapter.narrative);
    setIsTyping(false);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      sound.stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      sound.speakText(currentChapter.narrative, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleSelect = (optionText: string) => {
    if (isLoading) return;
    sound.playSelectOption();
    sound.stopSpeech();
    setIsSpeaking(false);
    onChooseOption(optionText, pendingDiceResult || undefined);
    onClearPendingDice();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim() || isLoading) return;
    const actionText = customAction.trim();
    setCustomAction('');
    handleSelect(actionText);
  };

  // Word count calculation
  const wordCount = currentChapter.narrative.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Chapter header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-display-title font-bold text-amber-300 text-lg shadow-inner">
            {currentChapter.chapterNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display-title font-bold text-slate-100">
                Capítulo {currentChapter.chapterNumber}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {wordCount} palabras
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Género: <strong className="text-slate-200">{genre}</strong></span>
            </p>
          </div>
        </div>

        {/* Reading audio controls */}
        <div className="flex items-center gap-2">
          {isTyping && (
            <button
              onClick={skipTypewriter}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-600 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              <span>Mostrar todo</span>
            </button>
          )}

          <button
            onClick={toggleSpeech}
            className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-600 text-slate-300'
            }`}
            title="Narración por voz en español"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-300" />
                <span>Silenciar voz</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Escuchar narrador</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Narrative Parchment / Display Box */}
      <div className="relative rounded-2xl p-6 md:p-8 bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-2xl overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="font-serif-story text-slate-200 text-lg md:text-xl leading-relaxed whitespace-pre-wrap select-text selection:bg-amber-500/30">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-2 h-5 bg-amber-400 ml-1 translate-y-0.5 animate-cursor" />
            )}
          </div>
        </div>
      </div>

      {/* Pending Dice Roll Alert if present */}
      {pendingDiceResult && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 font-bold">
              d20: {pendingDiceResult.roll}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Resultado de la Tirada: {pendingDiceResult.label}
              </p>
              <p className="text-xs text-slate-300">
                Este resultado afectará tu siguiente acción seleccionada.
              </p>
            </div>
          </div>
          <button
            onClick={onClearPendingDice}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            Descartar
          </button>
        </div>
      )}

      {/* Options Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display-title">
              ¿Qué decides hacer?
            </h3>
          </div>

          {/* D20 Dice button */}
          <button
            onClick={onOpenDiceModal}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 text-purple-200 border border-purple-500/40 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            title="Lanza un dado de 20 caras para evaluar la dificultad de tu próxima acción"
          >
            <Dices className="w-3.5 h-3.5 text-purple-300" />
            <span>Tirar Dado d20</span>
          </button>
        </div>

        {/* 3 Clickable Decision Cards */}
        <div className="grid grid-cols-1 gap-3">
          {currentChapter.options.map((opt, idx) => {
            const num = idx + 1;
            // Clean option prefix if it starts with "Opción 1:"
            const cleanText = opt.replace(/^Opci[oó]n\s*\d+\s*:\s*/i, '');

            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={isLoading}
                className="group relative flex items-start gap-4 p-4 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700 hover:border-amber-400/80 transition-all duration-200 text-left shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {/* Keyboard shortcut badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-amber-400 group-hover:bg-amber-400 group-hover:text-black flex items-center justify-center font-tech-mono font-bold text-slate-300 text-sm transition-colors">
                  {num}
                </div>

                <div className="flex-1 pr-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                    Opción {num}
                  </div>
                  <p className="text-sm md:text-base font-medium text-slate-100 group-hover:text-amber-100 leading-snug">
                    {cleanText}
                  </p>
                </div>

                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity text-amber-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Player Action */}
        <form onSubmit={handleCustomSubmit} className="pt-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              placeholder="O escribe una acción personalizada alternativa..."
              disabled={isLoading}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
            <button
              type="submit"
              disabled={!customAction.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Ejecutar acción personalizada"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 text-amber-300 text-sm">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-serif-story text-base italic">
            El Game Master sopesa las consecuencias de tu decisión...
          </span>
        </div>
      )}
    </div>
  );
};
