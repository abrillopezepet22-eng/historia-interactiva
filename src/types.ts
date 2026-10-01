export type GenreType = 'Misterio' | 'Policial / Noir' | 'Ciencia Ficción' | 'Fantasía';

export interface DiceRollResult {
  roll: number;
  type: 'critical_success' | 'success' | 'partial' | 'failure';
  label: string;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  narrative: string;
  options: string[];
  chosenAction?: string;
  diceRoll?: DiceRollResult;
  timestamp: number;
}

export interface PlayerStats {
  hp: number;
  tension: 'Calma' | 'Suspenso' | 'Peligro' | 'Clímax';
  inventory: string[];
}
