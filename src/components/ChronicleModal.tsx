import React, { useState } from 'react';
import { Chapter, GenreType } from '../types';
import { sound } from '../utils/soundEngine';
import { 
  X, 
  BookMarked, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  ArrowRight,
  ScrollText
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  genre: GenreType;
}

export const ChronicleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  chapters,
  genre,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalWords = chapters.reduce((sum, ch) => {
    return sum + ch.narrative.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const getFullMarkdown = () => {
    let md = `# Crónica de Aventura: ${genre}\n\n`;
    md += `*Fecha: ${new Date().toLocaleDateString('es-ES')} | Capítulos: ${chapters.length} | Palabras: ${totalWords}*\n\n---\n\n`;

    chapters.forEach((ch) => {
      md += `## Capítulo ${ch.chapterNumber}\n\n`;
      md += `${ch.narrative}\n\n`;
      if (ch.chosenAction) {
        md += `> **Decisión tomada:** ${ch.chosenAction}\n`;
        if (ch.diceRoll) {
          md += `> **Resultado del dado D20:** ${ch.diceRoll.roll} (${ch.diceRoll.label})\n`;
        }
        md += `\n`;
      }
      md += `---\n\n`;
    });

    return md;
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(getFullMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sound.playClick();
    const content = getFullMarkdown();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aventura_${genre.replace(/[^a-zA-Z0-9]/g, '_')}_Capitulos_${chapters.length}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[88vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display-title text-slate-100 flex items-center gap-2">
                <span>Libro de Crónicas</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700 font-sans">
                  {genre}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {chapters.length} {chapters.length === 1 ? 'capítulo' : 'capítulos'} • {totalWords} palabras registradas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Copiar historia en Markdown"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer"
              title="Descargar crónica en formato .md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar .md</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable chapters timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chapters.map((ch, idx) => (
            <div
              key={ch.id || idx}
              className="relative pl-6 pb-6 border-l-2 border-slate-700 last:border-l-transparent last:pb-0"
            >
              {/* Dot indicator */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-display-title font-bold text-amber-300 text-sm">
                    Capítulo {ch.chapterNumber}
                  </span>
                  <span>{new Date(ch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <p className="font-serif-story text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
                  {ch.narrative}
                </p>

                {ch.chosenAction && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 font-semibold">Elección del jugador: </span>
                      <span className="text-amber-200 font-medium">{ch.chosenAction}</span>
                      {ch.diceRoll && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[11px]">
                          🎲 D20: {ch.diceRoll.roll} ({ch.diceRoll.label})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
