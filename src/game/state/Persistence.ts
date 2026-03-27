import type { GameMode, GradeLevel, CharacterType } from '../../types.ts';

// ── Types ──

export interface GameDeath {
  level: number;
  cause: 'wrong_answer' | 'troggle';
  detail: string;
}

export interface ProblemResult {
  level: number;
  value: string | number;
  rule: string;
  correct: boolean;
}

export interface GameRecord {
  id: string;
  date: string;
  grade: GradeLevel;
  mode: GameMode;
  character: CharacterType;
  levelReached: number;
  starsEarned: number;
  totalAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  deaths: GameDeath[];
  problems: ProblemResult[];
}

export interface UnlockState {
  totalStars: number;
  spentStars: number;
  unlockedCharacters: CharacterType[];
  unlockedThemes: string[];
  unlockedMusic: string[];
}

export type ControlStyle = 'center' | 'two-handed';

export interface GameSettings {
  controlStyle: ControlStyle;
}

export interface PlayerData {
  history: GameRecord[];
  unlocks: UnlockState;
  settings: GameSettings;
}

// ── Constants ──

const STORAGE_KEY = 'numberMunchers_player';

export const DEFAULT_CHARACTER: CharacterType = 'box';

export const CHARACTER_PRICES: Record<CharacterType, number> = {
  box: 0,
  axolotl: 100,
  marshmallow: 250,
  electricmouse: 500,
  robot: 1000,
  mrpickle: 2000,
  nyancat: 3500,
  claude: 5000,
  pusheen: 7500,
};

/** Characters ordered by unlock price for display. */
export const CHARACTER_UNLOCK_ORDER: CharacterType[] = [
  'box', 'axolotl', 'marshmallow', 'electricmouse', 'robot',
  'mrpickle', 'nyancat', 'claude', 'pusheen',
];

// ── Persistence Functions ──

function createDefaultPlayerData(): PlayerData {
  return {
    history: [],
    unlocks: {
      totalStars: 0,
      spentStars: 0,
      unlockedCharacters: [DEFAULT_CHARACTER],
      unlockedThemes: [],
      unlockedMusic: [],
    },
    settings: {
      controlStyle: 'center',
    },
  };
}

export function loadPlayerData(): PlayerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPlayerData();
    const parsed = JSON.parse(raw) as PlayerData;
    // Ensure default character is always unlocked
    if (!parsed.unlocks.unlockedCharacters.includes(DEFAULT_CHARACTER)) {
      parsed.unlocks.unlockedCharacters.unshift(DEFAULT_CHARACTER);
    }
    // Migrate: add settings if missing (existing saves)
    if (!parsed.settings) {
      parsed.settings = { controlStyle: 'center' };
    }
    return parsed;
  } catch {
    return createDefaultPlayerData();
  }
}

export function savePlayerData(data: PlayerData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addGameRecord(record: GameRecord): void {
  const data = loadPlayerData();
  data.history.push(record);
  // Add stars earned to lifetime total
  data.unlocks.totalStars += record.starsEarned;
  savePlayerData(data);
}

export function getRecentGames(count: number): GameRecord[] {
  const data = loadPlayerData();
  return data.history.slice(-count);
}

export function getAvailableStars(): number {
  const data = loadPlayerData();
  return data.unlocks.totalStars - data.unlocks.spentStars;
}

export function getTotalStars(): number {
  const data = loadPlayerData();
  return data.unlocks.totalStars;
}

/** Format a star count with locale separators (e.g., 100,000). */
export function formatStars(n: number): string {
  return n.toLocaleString('en-US');
}

export function isCharacterUnlocked(character: CharacterType): boolean {
  const data = loadPlayerData();
  return data.unlocks.unlockedCharacters.includes(character);
}

export function unlockCharacter(character: CharacterType): boolean {
  const price = CHARACTER_PRICES[character];
  const data = loadPlayerData();
  const available = data.unlocks.totalStars - data.unlocks.spentStars;
  if (available < price) return false;
  if (data.unlocks.unlockedCharacters.includes(character)) return false;
  data.unlocks.spentStars += price;
  data.unlocks.unlockedCharacters.push(character);
  savePlayerData(data);
  return true;
}

export function getSettings(): GameSettings {
  const data = loadPlayerData();
  return data.settings;
}

export function saveSettings(settings: GameSettings): void {
  const data = loadPlayerData();
  data.settings = settings;
  savePlayerData(data);
}
