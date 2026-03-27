import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadPlayerData,
  savePlayerData,
  addGameRecord,
  getRecentGames,
  getAvailableStars,
  getTotalStars,
  isCharacterUnlocked,
  unlockCharacter,
  CHARACTER_PRICES,
  DEFAULT_CHARACTER,
} from '../../src/game/state/Persistence';
import type { GameRecord, PlayerData } from '../../src/game/state/Persistence';

// Mock localStorage
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: (_i: number) => null,
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

function makeRecord(overrides: Partial<GameRecord> = {}): GameRecord {
  return {
    id: `game-${Date.now()}`,
    date: new Date().toISOString(),
    grade: 3,
    mode: 'multiples',
    character: 'claude',
    levelReached: 5,
    starsEarned: 20,
    totalAnswers: 25,
    correctAnswers: 20,
    wrongAnswers: 5,
    deaths: [],
    problems: [],
    ...overrides,
  };
}

describe('Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('loadPlayerData returns defaults when empty', () => {
    const data = loadPlayerData();
    expect(data.history).toEqual([]);
    expect(data.unlocks.totalStars).toBe(0);
    expect(data.unlocks.spentStars).toBe(0);
    expect(data.unlocks.unlockedCharacters).toEqual([DEFAULT_CHARACTER]);
  });

  it('savePlayerData and loadPlayerData round-trip', () => {
    const data = loadPlayerData();
    data.unlocks.totalStars = 100;
    savePlayerData(data);
    const loaded = loadPlayerData();
    expect(loaded.unlocks.totalStars).toBe(100);
  });

  it('addGameRecord appends and accumulates stars', () => {
    addGameRecord(makeRecord({ starsEarned: 15 }));
    addGameRecord(makeRecord({ starsEarned: 25 }));
    const data = loadPlayerData();
    expect(data.history).toHaveLength(2);
    expect(data.unlocks.totalStars).toBe(40);
  });

  it('getRecentGames returns last N games', () => {
    for (let i = 0; i < 15; i++) {
      addGameRecord(makeRecord({ id: `game-${i}`, starsEarned: 1 }));
    }
    const recent = getRecentGames(10);
    expect(recent).toHaveLength(10);
    expect(recent[0].id).toBe('game-5'); // 6th game (index 5)
    expect(recent[9].id).toBe('game-14'); // last game
  });

  it('getAvailableStars returns totalStars minus spentStars', () => {
    addGameRecord(makeRecord({ starsEarned: 200 }));
    expect(getAvailableStars()).toBe(200);
    unlockCharacter('axolotl'); // costs 100
    expect(getAvailableStars()).toBe(100);
  });

  it('getTotalStars returns lifetime total', () => {
    addGameRecord(makeRecord({ starsEarned: 50 }));
    addGameRecord(makeRecord({ starsEarned: 30 }));
    expect(getTotalStars()).toBe(80);
  });
});

describe('Character Unlocks', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('default character is always unlocked', () => {
    expect(isCharacterUnlocked(DEFAULT_CHARACTER)).toBe(true);
  });

  it('non-default characters start locked', () => {
    expect(isCharacterUnlocked('claude')).toBe(false);
    expect(isCharacterUnlocked('pusheen')).toBe(false);
  });

  it('unlockCharacter succeeds with enough stars', () => {
    addGameRecord(makeRecord({ starsEarned: 200 }));
    const result = unlockCharacter('axolotl');
    expect(result).toBe(true);
    expect(isCharacterUnlocked('axolotl')).toBe(true);
    expect(getAvailableStars()).toBe(200 - CHARACTER_PRICES.axolotl);
  });

  it('unlockCharacter fails without enough stars', () => {
    addGameRecord(makeRecord({ starsEarned: 5 }));
    const result = unlockCharacter('axolotl'); // costs 100
    expect(result).toBe(false);
    expect(isCharacterUnlocked('axolotl')).toBe(false);
  });

  it('unlockCharacter fails if already unlocked', () => {
    addGameRecord(makeRecord({ starsEarned: 200 }));
    unlockCharacter('axolotl');
    const result = unlockCharacter('axolotl'); // already unlocked
    expect(result).toBe(false);
    // Stars should not be double-deducted
    expect(getAvailableStars()).toBe(200 - CHARACTER_PRICES.axolotl);
  });

  it('CHARACTER_PRICES has prices for all 9 characters', () => {
    expect(Object.keys(CHARACTER_PRICES)).toHaveLength(9);
    expect(CHARACTER_PRICES.box).toBe(0);
    expect(CHARACTER_PRICES.claude).toBe(5000);
    expect(CHARACTER_PRICES.pusheen).toBe(7500);
  });
});
