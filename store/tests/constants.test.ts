import { describe, it, expect } from 'vitest';
import {
  COUNTRIES,
  COUNTRY_CODE_MAP,
  DEFAULT_CURRENCY_SYMBOL,
  DEFAULT_USER_NAME,
  TUTOR_RANK_LEVELS,
  POINTS_ALLOCATION,
  INITIAL_GAMIFICATION_STATS,
  ACHIEVEMENTS_DEFINITIONS,
  CURRENCY_OPTIONS
} from '../../constants';

describe('Constants Verification', () => {
  it('COUNTRIES should be a non-empty array of objects with name and code', () => {
    expect(Array.isArray(COUNTRIES)).toBe(true);
    expect(COUNTRIES.length).toBeGreaterThan(0);
    expect(COUNTRIES[0]).toHaveProperty('name');
    expect(COUNTRIES[0]).toHaveProperty('code');
  });

  it('COUNTRY_CODE_MAP should be correctly initialized from COUNTRIES', () => {
    expect(Object.keys(COUNTRY_CODE_MAP).length).toBe(COUNTRIES.length);
    // Spot check a few known countries
    expect(COUNTRY_CODE_MAP['United States']).toBe('+1');
    expect(COUNTRY_CODE_MAP['United Kingdom']).toBe('+44');
    expect(COUNTRY_CODE_MAP['Japan']).toBe('+81');

    // Check that every country in COUNTRIES is in the map
    COUNTRIES.forEach(c => {
      expect(COUNTRY_CODE_MAP[c.name]).toBe(c.code);
    });
  });

  it('DEFAULT_CURRENCY_SYMBOL should be defined', () => {
    expect(DEFAULT_CURRENCY_SYMBOL).toBeDefined();
    expect(typeof DEFAULT_CURRENCY_SYMBOL).toBe('string');
  });

  it('DEFAULT_USER_NAME should be defined', () => {
    expect(DEFAULT_USER_NAME).toBeDefined();
    expect(typeof DEFAULT_USER_NAME).toBe('string');
  });

  it('TUTOR_RANK_LEVELS should be an array of level definitions sorted by points', () => {
    expect(Array.isArray(TUTOR_RANK_LEVELS)).toBe(true);
    expect(TUTOR_RANK_LEVELS.length).toBeGreaterThan(0);

    // Verify sorting by points
    for (let i = 1; i < TUTOR_RANK_LEVELS.length; i++) {
      expect(TUTOR_RANK_LEVELS[i].points).toBeGreaterThan(TUTOR_RANK_LEVELS[i-1].points);
    }
  });

  it('POINTS_ALLOCATION should have positive point values for actions', () => {
    expect(POINTS_ALLOCATION).toBeDefined();
    expect(Object.values(POINTS_ALLOCATION).every(points => points > 0)).toBe(true);
  });

  it('INITIAL_GAMIFICATION_STATS should start at level 1 with 0 points', () => {
    expect(INITIAL_GAMIFICATION_STATS.level).toBe(1);
    expect(INITIAL_GAMIFICATION_STATS.points).toBe(0);
    expect(INITIAL_GAMIFICATION_STATS.streak).toBe(0);
  });

  it('ACHIEVEMENTS_DEFINITIONS should have unique IDs', () => {
    expect(Array.isArray(ACHIEVEMENTS_DEFINITIONS)).toBe(true);
    expect(ACHIEVEMENTS_DEFINITIONS.length).toBeGreaterThan(0);

    const ids = ACHIEVEMENTS_DEFINITIONS.map(a => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length); // No duplicates

    // Ensure all start as unachieved
    expect(ACHIEVEMENTS_DEFINITIONS.every(a => a.achieved === false)).toBe(true);
  });

  it('CURRENCY_OPTIONS should have symbol and name properties', () => {
    expect(Array.isArray(CURRENCY_OPTIONS)).toBe(true);
    expect(CURRENCY_OPTIONS.length).toBeGreaterThan(0);
    expect(CURRENCY_OPTIONS[0]).toHaveProperty('symbol');
    expect(CURRENCY_OPTIONS[0]).toHaveProperty('name');
  });
});
