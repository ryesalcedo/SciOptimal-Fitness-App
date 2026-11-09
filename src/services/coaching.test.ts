import { buildNutritionPlan, smoothWeight, suggestedGainRate } from './coaching';
import { shiftDay } from '../utils/units';

const profile = { sex: 'male' as const, age: 32, height: 70, weight: 185 };
const today = '2026-06-14';

function series(startWeight: number, changePerDay: number, days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = shiftDay(today, -(days - 1 - index));
    return {
      date,
      weight: Math.round((startWeight + changePerDay * index) * 100) / 100,
      calories: 2500,
    };
  });
}

describe('nutrition coaching', () => {
  test('smooths a one-day scale spike instead of treating it as progress', () => {
    const trend = smoothWeight([
      { date: '2026-06-01', weight: 180 },
      { date: '2026-06-02', weight: 186 },
      { date: '2026-06-03', weight: 180.2 },
    ]);
    expect(trend[1].trend).toBeLessThan(182);
    expect(trend[2].trend).toBeLessThan(181.5);
  });

  test('holds the target near current intake when the loss rate already matches the goal', () => {
    const logged = series(200, -1 / 7, 14);
    const plan = buildNutritionPlan({
      profile,
      goal: { type: 'lose', rateLbPerWeek: 1 },
      trainingDays: 4,
      intake: logged.map((day) => ({ date: day.date, calories: day.calories })),
      weighIns: logged.map((day) => ({ date: day.date, weight: day.weight })),
      today,
    });
    expect(plan.source).toBe('logs');
    expect(plan.calories).toBeGreaterThan(2300);
    expect(plan.calories).toBeLessThan(2750);
    expect(plan.protein).toBeGreaterThan(140);
  });

  test('raises calories when the same loss should stop', () => {
    const logged = series(200, -1 / 7, 14);
    const cutting = buildNutritionPlan({
      profile,
      goal: { type: 'lose', rateLbPerWeek: 1 },
      trainingDays: 4,
      intake: logged.map((day) => ({ date: day.date, calories: day.calories })),
      weighIns: logged.map((day) => ({ date: day.date, weight: day.weight })),
      today,
    });
    const maintaining = buildNutritionPlan({
      profile,
      goal: { type: 'maintain', rateLbPerWeek: 0 },
      trainingDays: 4,
      intake: logged.map((day) => ({ date: day.date, calories: day.calories })),
      weighIns: logged.map((day) => ({ date: day.date, weight: day.weight })),
      today,
    });
    expect(maintaining.calories).toBeGreaterThan(cutting.calories + 300);
  });

  test('sets gain protein at about a gram per pound and keeps a surplus while weight is rising', () => {
    const logged = series(185, 0.5 / 7, 14);
    const plan = buildNutritionPlan({
      profile,
      goal: { type: 'gain', rateLbPerWeek: 0.5 },
      trainingDays: 4,
      intake: logged.map((day) => ({ date: day.date, calories: 3200 })),
      weighIns: logged.map((day) => ({ date: day.date, weight: day.weight })),
      today,
    });
    expect(plan.protein).toBeGreaterThanOrEqual(170);
    expect(plan.calories).toBeGreaterThan(3200);
    expect(suggestedGainRate(185, 'beginner')).toBeGreaterThan(suggestedGainRate(185, 'advanced'));
  });

  test('uses the body-stat estimate until there is a week of logs', () => {
    const plan = buildNutritionPlan({
      profile,
      goal: { type: 'lose', rateLbPerWeek: 0.5 },
      trainingDays: 4,
      intake: [{ date: today, calories: 2200 }],
      weighIns: [{ date: today, weight: 185 }],
      today,
    });
    expect(plan.source).toBe('profile');
    expect(plan.calories).toBeGreaterThan(1800);
    expect(plan.calories).toBeLessThan(3200);
  });

  test('moves an existing target one step instead of jumping the whole gap', () => {
    const logged = series(200, 0, 14);
    const plan = buildNutritionPlan({
      profile,
      goal: { type: 'lose', rateLbPerWeek: 1 },
      trainingDays: 4,
      intake: logged.map((day) => ({ date: day.date, calories: 3000 })),
      weighIns: logged.map((day) => ({ date: day.date, weight: day.weight })),
      today,
      previousCalories: 3000,
      previousSource: 'logs',
    });
    expect(plan.calories).toBe(2850);
    expect(plan.note).toMatch(/next check-in/);
  });
});
