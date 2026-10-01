import React, { useState } from 'react';
import { GenreType } from '../types';
import { sound } from '../utils/soundEngine';
import { Compass, Eye, ShieldAlert, Sparkles, Terminal, BookOpen, ChevronRight, Wand2 } from 'lucide-react';

interface Props {
  onSelectGenre: (genre: GenreType, customPremise?: string) => void;
  isLoading: boolean;
}

const GENRE_CARDS: {
  id: GenreType;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  gradient: string;
  borderClass: string;
  hoverGlow: string;
}[] = [
  {
    id: 'Misterio',
    title: 'Misterio',
    tagline: 'Sombras, secretos y enigmas ancestrales',
    description: 'Mansiones decrépitas en páramos desolados, desapariciones sin resolver, cartas lacradas y susurros que erizan la piel en la penumbra.',
    icon: <Eye className="w-8 h-8 text-purple-400" />,
    tags: ['Gótico', 'Suspenso', 'Investigación Oculta'],
    gradient: 'from-purple-950/60 via-slate-900 to-black',
    borderClass: 'border-purple-800/40 hover:border-purple-500/80',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]',
  },
  {
    id: 'Policial / Noir',
    title: 'Policial / Noir',
    tagline: 'Calles mojadas, neón y sombras de traición',
    description: 'Años 40. Lluvia incesante sobre el asfalto sucio, el humo de un cigarrillo apagándose, clientes con secretos turbios y un detective cínico.',
    icon: <ShieldAlert className="w-8 h-8 text-amber-400" />,
    tags: ['Hardboiled', 'Crimen', 'Atmósfera Urbana'],
    gradient: 'from-amber-950/50 via-zinc-900 to-black',
    borderClass: 'border-amber-700/40 hover:border-amber-500/80',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]',
  },
  {
    id: 'Ciencia Ficción',
    title: 'Ciencia Ficción',
    tagline: 'Fronteras cuánticas, IAs rebeldes y vacío estelar',
    description: 'Estaciones espaciales a la deriva en la órbita de planetas helados, androides fugitivos, implantes neuronales y paradojas temporales.',
    icon: <Terminal className="w-8 h-8 text-cyan-400" />,
    tags: ['Cyberpunk', 'Space Opera', 'Distopía'],
    gradient: 'from-cyan-950/50 via-slate-900 to-black',
    borderClass: 'border-cyan-800/40 hover:border-cyan-400/80',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]',
  },
  {
    id: 'Fantasía',
    title: 'Fantasía',
    tagline: 'Reliquias arcanas, dragones y reinos perdidos',
    description: 'Catacumbas selladas por sellos rúnicos, bosques encantados donde el tiempo se detiene, gremios de hechiceros y pactos de sangre.',
    icon: <Sparkles className="w-8 h-8 text-emerald-400" />,
    tags: ['Magia Arcana', 'Espada & Hechicería', 'Criaturas Míticas'],
    gradient: 'from-emerald-950/50 via-stone-900 to-black',
    borderClass: 'border-emerald-800/40 hover:border-emerald-500/80',
    hoverGlow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
  },
];

export const GenreSelector: React.FC<Props> = ({ onSelectGenre, isLoading }) => {
  const [selectedGenre, setSelectedGenre] = useState<GenreType | null>(null);
  const [customPremise, setCustomPremise] = useState('');

  const handleSelect = (genre: GenreType) => {
    sound.playSelectOption();
    setSelectedGenre(genre);
  };

  const handleStart = () => {
    if (!selectedGenre) return;
    sound.playChapterChime();
    onSelectGenre(selectedGenre, customPremise.trim() || undefined);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero header */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium tracking-wide uppercase">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          Game Master Interactivo
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display-title font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-slate-100 to-amber-300 drop-shadow-sm tracking-wide">
          Elige Tu Propia Aventura
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-serif-story text-xl italic">
          «Todo camino comienza con una decisión. Elige el género de tu historia y deja que el Game Master teja tu destino a través de la penumbra y lo desconocido.»
        </p>
      </div>

      {/* 4 Genre Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {GENRE_CARDS.map((card) => {
          const isSelected = selectedGenre === card.id;

          return (
            <div
              key={card.id}
              onClick={() => handleSelect(card.id)}
              className={`group relative cursor-pointer rounded-2xl p-6 transition-all duration-300 text-left border bg-gradient-to-b ${card.gradient} ${card.borderClass} ${card.hoverGlow} ${
                isSelected
                  ? 'ring-2 ring-amber-400 shadow-xl scale-[1.01]'
                  : 'opacity-90 hover:opacity-100 hover:-translate-y-1'
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 bg-amber-400 text-black px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1 shadow-md">
                  <span>Seleccionado</span>
                  <Wand2 className="w-3 h-3" />
                </div>
              )}

              <div className="flex items-center gap-3.5 mb-3">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/40 shadow-inner">
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 tracking-wide font-display-title">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{card.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-4 font-serif-story text-base">
                {card.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Premise & Start button panel */}
      {selectedGenre && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-md shadow-2xl transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                Paso 2 / Personalización (Opcional)
              </span>
              <h4 className="text-lg font-bold text-slate-100 mt-0.5">
                ¿Deseas añadir un detalle o premisa inicial a tu historia de {selectedGenre}?
              </h4>
            </div>

            <button
              onClick={handleStart}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.35)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-base tracking-wide"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Conjurando el relato...</span>
                </>
              ) : (
                <>
                  <span>Comenzar Aventura</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={customPremise}
              onChange={(e) => setCustomPremise(e.target.value)}
              placeholder={`Ej: "Empiezo en una biblioteca subterránea olvidada con un diario encriptado en mis manos..."`}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStart();
              }}
            />
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Si lo dejas en blanco, el Game Master iniciará una ambientación clásica y emocionante de {selectedGenre}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
