import React, { useState, useEffect } from 'react';
import { GenreType, Chapter, DiceRollResult, PlayerStats } from './types';
import { TopBar } from './components/TopBar';
import { GenreSelector } from './components/GenreSelector';
import { StoryView } from './components/StoryView';
import { DiceRollerModal } from './components/DiceRollerModal';
import { ChronicleModal } from './components/ChronicleModal';
import { sound } from './utils/soundEngine';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [genre, setGenre] = useState<GenreType | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sound & Modals
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState<boolean>(false);
  const [isChronicleOpen, setIsChronicleOpen] = useState<boolean>(false);
  const [pendingDiceResult, setPendingDiceResult] = useState<DiceRollResult | null>(null);

  // Player Stats
  const [stats, setStats] = useState<PlayerStats>({
    hp: 100,
    tension: 'Calma',
    inventory: [],
  });

  // History tracking for AI model
  const [conversationHistory, setConversationHistory] = useState<
    { role: 'user' | 'model'; content: string }[]
  >([]);

  // Toggle ambient soundtrack
  const handleToggleAmbient = () => {
    if (!genre) return;
    const isNowPlaying = sound.toggleAmbient(genre);
    setIsAmbientPlaying(isNowPlaying);
  };

  // Inspect narrative for potential inventory items or tension shifts
  const updateStatsFromNarrative = (text: string) => {
    const lower = text.toLowerCase();

    // Tension detection
    let nextTension: PlayerStats['tension'] = stats.tension;
    if (lower.includes('inminente') || lower.includes('peligro') || lower.includes('acecha') || lower.includes('mortal')) {
      nextTension = 'Peligro';
    } else if (lower.includes('clímax') || lower.includes('enfrentamiento') || lower.includes('último aliento') || lower.includes('desenlace')) {
      nextTension = 'Clímax';
    } else if (lower.includes('tensión') || lower.includes('sombra') || lower.includes('susurro') || lower.includes('alerta')) {
      nextTension = 'Suspenso';
    } else {
      nextTension = 'Calma';
    }

    // Auto-detect common adventure items
    const possibleItems = [
      { trigger: 'linterna', name: 'Linterna potente' },
      { trigger: 'ganzúa', name: 'Ganzúa de cerrajero' },
      { trigger: 'diario', name: 'Diario misterioso' },
      { trigger: 'llave', name: 'Llave antigua' },
      { trigger: 'revólver', name: 'Revólver calibre 38' },
      { trigger: 'daga', name: 'Daga ceremonial' },
      { trigger: 'amuleto', name: 'Amuleto rúnico' },
      { trigger: 'tarjeta de acceso', name: 'Tarjeta de acceso cuántica' },
      { trigger: 'comunicador', name: 'Transmisor cifrado' },
      { trigger: 'poción', name: 'Frasco de elixir' },
      { trigger: 'mapa', name: 'Mapa desgastado' },
    ];

    const newInventory = [...stats.inventory];
    for (const item of possibleItems) {
      if (lower.includes(item.trigger) && !newInventory.includes(item.name)) {
        newInventory.push(item.name);
      }
    }

    setStats((prev) => ({
      ...prev,
      tension: nextTension,
      inventory: newInventory,
    }));
  };

  // Start adventure with selected genre
  const handleSelectGenre = async (selectedGenre: GenreType, customPremise?: string) => {
    setIsLoading(true);
    setError(null);
    setGenre(selectedGenre);

    // Initialise audio ambiance
    try {
      sound.startAmbient(selectedGenre);
      setIsAmbientPlaying(true);
    } catch {}

    const promptAction = customPremise
      ? `Elijo la temática: ${selectedGenre}. Premisa especial: ${customPremise}. Comienza la aventura en el primer capítulo inmersivo.`
      : `Elijo la temática: ${selectedGenre}. Comienza la aventura con un primer capítulo inmersivo y atmosférico.`;

    try {
      const res = await fetch('/api/adventure/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: selectedGenre,
          action: promptAction,
          history: [],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al comunicarse con el Game Master.');
      }

      const data = await res.json();
      const firstChapter: Chapter = {
        id: `ch-1-${Date.now()}`,
        chapterNumber: 1,
        narrative: data.narrative,
        options: data.options,
        timestamp: Date.now(),
      };

      setChapters([firstChapter]);
      setCurrentChapter(firstChapter);
      setConversationHistory([
        { role: 'user', content: promptAction },
        { role: 'model', content: data.rawText },
      ]);
      updateStatsFromNarrative(data.narrative);
    } catch (err: any) {
      console.error('Failed to init adventure:', err);
      setError(err?.message || 'No se pudo conectar con el Game Master.');
      setGenre(null);
      sound.stopAmbient();
      setIsAmbientPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Choose an option or custom action for the next turn
  const handleChooseOption = async (optionText: string, diceResult?: DiceRollResult) => {
    if (!currentChapter || !genre || isLoading) return;

    setIsLoading(true);
    setError(null);

    // Record chosen action in current chapter
    const updatedChapter: Chapter = {
      ...currentChapter,
      chosenAction: optionText,
      diceRoll: diceResult,
    };

    setChapters((prev) =>
      prev.map((ch) => (ch.id === currentChapter.id ? updatedChapter : ch))
    );

    let promptWithDice = optionText;
    if (diceResult) {
      promptWithDice = `[Tirada de Fortuna D20: Obtuve un ${diceResult.roll} (${diceResult.label})]. Mi decisión es: ${optionText}`;
    }

    const nextHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: promptWithDice },
    ];

    try {
      const res = await fetch('/api/adventure/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          action: promptWithDice,
          history: conversationHistory,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al conectar con el Game Master.');
      }

      const data = await res.json();
      const nextNum = chapters.length + 1;

      const newChapter: Chapter = {
        id: `ch-${nextNum}-${Date.now()}`,
        chapterNumber: nextNum,
        narrative: data.narrative,
        options: data.options,
        timestamp: Date.now(),
      };

      setChapters((prev) => [...prev, newChapter]);
      setCurrentChapter(newChapter);
      setConversationHistory([
        ...nextHistory,
        { role: 'model', content: data.rawText },
      ]);
      updateStatsFromNarrative(data.narrative);
    } catch (err: any) {
      console.error('Turn error:', err);
      setError(err?.message || 'Error al avanzar la historia.');
    } finally {
      setIsLoading(false);
    }
  };

  // Restart / Reset
  const handleRestart = () => {
    if (window.confirm('¿Seguro que deseas reiniciar tu aventura y regresar a la selección de género?')) {
      sound.stopAmbient();
      sound.stopSpeech();
      setIsAmbientPlaying(false);
      setGenre(null);
      setChapters([]);
      setCurrentChapter(null);
      setConversationHistory([]);
      setPendingDiceResult(null);
      setStats({
        hp: 100,
        tension: 'Calma',
        inventory: [],
      });
      setError(null);
    }
  };

  // Get background overlay class per genre
  const getAtmosphereClass = () => {
    if (!genre) return 'noir-grain';
    switch (genre) {
      case 'Policial / Noir':
        return 'noir-grain';
      case 'Ciencia Ficción':
        return 'scifi-grid';
      case 'Fantasía':
        return 'fantasy-parchment';
      case 'Misterio':
        return 'mystery-mist';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#08090d] text-slate-100 ${getAtmosphereClass()}`}>
      <TopBar
        genre={genre}
        chapterCount={chapters.length}
        stats={stats}
        isAmbientPlaying={isAmbientPlaying}
        onToggleAmbient={handleToggleAmbient}
        onOpenChronicle={() => setIsChronicleOpen(true)}
        onRestart={handleRestart}
      />

      <main className="flex-1 flex flex-col justify-center">
        {/* Error notification */}
        {error && (
          <div className="max-w-2xl mx-auto px-4 mt-6">
            <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-sm flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Aviso del Game Master</p>
                <p className="text-xs text-red-300 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-900 text-red-100 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* View switching: Genre Selection or Active Story */}
        {!genre || !currentChapter ? (
          <GenreSelector onSelectGenre={handleSelectGenre} isLoading={isLoading} />
        ) : (
          <StoryView
            currentChapter={currentChapter}
            genre={genre}
            isLoading={isLoading}
            onChooseOption={handleChooseOption}
            onOpenDiceModal={() => setIsDiceModalOpen(true)}
            pendingDiceResult={pendingDiceResult}
            onClearPendingDice={() => setPendingDiceResult(null)}
          />
        )}
      </main>

      {/* D20 Dice Roller Modal */}
      <DiceRollerModal
        isOpen={isDiceModalOpen}
        onClose={() => setIsDiceModalOpen(false)}
        onApplyResult={(res) => setPendingDiceResult(res)}
      />

      {/* Chronicle / Journal Modal */}
      {genre && (
        <ChronicleModal
          isOpen={isChronicleOpen}
          onClose={() => setIsChronicleOpen(false)}
          chapters={chapters}
          genre={genre}
        />
      )}

      {/* Atmospheric Footer */}
      <footer className="py-4 border-t border-white/5 text-center text-xs text-slate-500 font-serif-story">
        <p>
          Aventura interactiva narrada por IA • Estructura de ficción interactiva con opciones lógicas en JSON
        </p>
      </footer>
    </div>
  );
}
