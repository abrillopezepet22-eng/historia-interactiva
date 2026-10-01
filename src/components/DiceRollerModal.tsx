import React, { useState } from 'react';
import { DiceRollResult } from '../types';
import { sound } from '../utils/soundEngine';
import { Dices, X, Sparkles, AlertTriangle, Trophy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyResult: (result: DiceRollResult) => void;
}

export const DiceRollerModal: React.FC<Props> = ({ isOpen, onClose, onApplyResult }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [rollResult, setRollResult] = useState<DiceRollResult | null>(null);

  if (!isOpen) return null;

  const rollDice = () => {
    setIsRolling(true);
    setRollResult(null);
    sound.playDiceRoll();

    let count = 0;
    const interval = window.setInterval(() => {
      setCurrentNumber(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count > 16) {
        window.clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 20) + 1;
        setCurrentNumber(finalRoll);

        let type: DiceRollResult['type'] = 'partial';
        let label = '';

        if (finalRoll === 20) {
          type = 'critical_success';
          label = '¡Éxito Crítico Legendario!';
          sound.playDiceResult(true);
        } else if (finalRoll >= 15) {
          type = 'success';
          label = 'Éxito Notable';
          sound.playDiceResult(true);
        } else if (finalRoll >= 10) {
          type = 'partial';
          label = 'Éxito Parcial con Complicación';
          sound.playDiceResult(true);
        } else if (finalRoll >= 2) {
          type = 'failure';
          label = 'Desafío Fallido';
          sound.playDiceResult(false);
        } else {
          type = 'failure';
          label = '¡Pifia Crítica Desastrosa!';
          sound.playDiceResult(false);
        }

        const result: DiceRollResult = { roll: finalRoll, type, label };
        setRollResult(result);
        setIsRolling(false);
      }
    }, 70);
  };

  const handleApply = () => {
    if (!rollResult) return;
    sound.playClick();
    onApplyResult(rollResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-center space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-1">
            <Dices className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display-title text-slate-100">
            Prueba de Fortuna (D20)
          </h3>
          <p className="text-xs text-slate-400 font-serif-story text-sm">
            Lanza el dado de 20 caras para determinar la efectividad de tu siguiente decisión ante el destino.
          </p>
        </div>

        {/* Die Face Visual */}
        <div className="flex justify-center my-4">
          <div
            className={`relative w-28 h-28 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
              isRolling
                ? 'animate-bounce border-purple-500 bg-purple-950/60 shadow-[0_0_30px_rgba(168,85,247,0.5)]'
                : rollResult?.type === 'critical_success'
                ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                : rollResult?.type === 'success'
                ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                : rollResult?.type === 'failure' && currentNumber === 1
                ? 'border-red-500 bg-red-950/60 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                : 'border-slate-700 bg-slate-950 shadow-inner'
            }`}
          >
            <span
              className={`text-4xl font-extrabold font-tech-mono ${
                isRolling
                  ? 'text-purple-300'
                  : rollResult?.type === 'critical_success'
                  ? 'text-amber-300'
                  : rollResult?.type === 'success'
                  ? 'text-emerald-300'
                  : rollResult?.type === 'failure' && currentNumber === 1
                  ? 'text-red-400'
                  : 'text-slate-100'
              }`}
            >
              {currentNumber !== null ? currentNumber : '20'}
            </span>
          </div>
        </div>

        {/* Outcome Details */}
        {rollResult && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              {rollResult.type === 'critical_success' ? (
                <Trophy className="w-4 h-4 text-amber-400" />
              ) : rollResult.type === 'failure' ? (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-sm font-bold text-slate-100">
                {rollResult.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {rollResult.roll === 20
                ? '¡Circunstancias sumamente favorables a tu favor!'
                : rollResult.roll === 1
                ? 'Un giro del destino totalmente impredecible y adverso.'
                : rollResult.roll >= 15
                ? 'Tu acción se desempeñará con destreza.'
                : rollResult.roll >= 10
                ? 'Conseguirás avanzar, pero con un precio o riesgo.'
                : 'Encontrarás resistencia o contratiempos.'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!rollResult ? (
            <button
              onClick={rollDice}
              disabled={isRolling}
              className="w-full py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {isRolling ? 'Lanzando el dado...' : 'Lanzar Dado'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={rollDice}
                disabled={isRolling}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                Volver a tirar
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar a la acción</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
