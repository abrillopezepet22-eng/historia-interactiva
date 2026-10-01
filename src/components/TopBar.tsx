import React, { useState } from 'react';
import { GenreType, PlayerStats } from '../types';
import { sound } from '../utils/soundEngine';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  BookMarked, 
  RotateCcw, 
  Shield, 
  Activity, 
  Package,
  ChevronDown
} from 'lucide-react';

interface Props {
  genre: GenreType | null;
  chapterCount: number;
  stats: PlayerStats;
  isAmbientPlaying: boolean;
  onToggleAmbient: () => void;
  onOpenChronicle: () => void;
  onRestart: () => void;
}

export const TopBar: React.FC<Props> = ({
  genre,
  chapterCount,
  stats,
  isAmbientPlaying,
  onToggleAmbient,
  onOpenChronicle,
  onRestart,
}) => {
  const [showInventory, setShowInventory] = useState(false);
  const [volume, setVolume] = useState(0.3);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sound.setAmbientVolume(val);
  };

  const getTensionBadge = () => {
    switch (stats.tension) {
      case 'Clímax':
        return 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
      case 'Peligro':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Suspenso':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getAmbientDescription = () => {
    if (!genre) return 'Banda Sonora';
    switch (genre) {
      case 'Policial / Noir':
        return 'Lluvia & Acorde Noir';
      case 'Ciencia Ficción':
        return 'Pulso de Vacío & Radar';
      case 'Fantasía':
        return 'Dron Místico & Campanas';
      case 'Misterio':
        return 'Suspenso & Reloj';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand & Active Genre */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold shadow-md">
            GM
          </div>
          <div>
            <h1 className="font-display-title font-bold text-slate-100 text-sm md:text-base leading-none tracking-wide">
              Crónicas Interactivas
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {genre ? (
                <span className="text-amber-400 font-medium">Aventura: {genre}</span>
              ) : (
                'Elige tu propia aventura'
              )}
            </p>
          </div>
        </div>

        {/* Center / Stats (Only in-game) */}
        {genre && (
          <div className="hidden lg:flex items-center gap-3">
            {/* Tension status */}
            <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${getTensionBadge()}`}>
              <Activity className="w-3.5 h-3.5" />
              <span>Tensión: {stats.tension}</span>
            </div>

            {/* Inventory Popover trigger */}
            <div className="relative">
              <button
                onClick={() => setShowInventory(!showInventory)}
                className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer transition"
              >
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Mochila ({stats.inventory.length})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showInventory && (
                <div className="absolute right-0 mt-2 w-56 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 text-xs">
                  <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
                    <span>Objetos en Posesión</span>
                    <span className="text-[10px] text-slate-400">{stats.inventory.length} items</span>
                  </div>
                  {stats.inventory.length === 0 ? (
                    <p className="text-slate-500 italic py-1">Sin objetos recolectados aún.</p>
                  ) : (
                    <ul className="space-y-1">
                      {stats.inventory.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-300 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Ambient audio toggle */}
          {genre && (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <button
                onClick={onToggleAmbient}
                className={`p-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                  isAmbientPlaying
                    ? 'text-amber-300 bg-amber-400/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Activar/Desactivar música de ambiente adaptativa"
              >
                {isAmbientPlaying ? (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="hidden sm:inline text-[11px]">{getAmbientDescription()}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <span className="hidden sm:inline text-[11px]">Música</span>
                  </>
                )}
              </button>

              {isAmbientPlaying && (
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-14 accent-amber-400 hidden md:block cursor-pointer"
                  title="Volumen de ambiente"
                />
              )}
            </div>
          )}

          {/* Chronicle / Journal button */}
          {chapterCount > 0 && (
            <button
              onClick={onOpenChronicle}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Abrir bitácora completa de la aventura"
            >
              <BookMarked className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Bitácora</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {chapterCount}
              </span>
            </button>
          )}

          {/* Restart adventure */}
          {genre && (
            <button
              onClick={onRestart}
              className="p-2 rounded-xl text-slate-400 hover:text-red-300 hover:bg-red-950/30 transition border border-transparent hover:border-red-900/40 cursor-pointer"
              title="Reiniciar aventura / Elegir otro género"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
