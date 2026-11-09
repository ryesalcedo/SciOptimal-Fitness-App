import { inchesToCentimeters, isSameDay, poundsToKilograms, toDate } from './units';

describe('units', () => {
  test('converts pounds to kilograms', () => {
    expect(poundsToKilograms(220.46226218)).toBeCloseTo(100, 4);
  });

  test('converts inches to centimeters', () => {
    expect(inchesToCentimeters(70)).toBeCloseTo(177.8, 4);
  });

  test('revives date strings', () => {
    const date = toDate('2026-01-15T15:00:00.000Z');
    expect(date).toBeInstanceOf(Date);
    expect(date.toISOString()).toBe('2026-01-15T15:00:00.000Z');
  });

  test('matches calendar days after revival', () => {
    const morning = new Date(2026, 5, 2, 8, 0, 0);
    expect(isSameDay(morning.toISOString(), new Date(2026, 5, 2, 21, 0, 0))).toBe(true);
    expect(isSameDay(morning.toISOString(), new Date(2026, 5, 3, 8, 0, 0))).toBe(false);
  });
});
