import { applyProgression, buildProgram, nextTarget, recoveryStatus } from './program';

describe('training program', () => {
  test('builds a dumbbell program without barbell lifts', () => {
    const program = buildProgram({
      goal: 'gain',
      days: 4,
      sessionMinutes: 60,
      experience: 'intermediate',
      equipment: ['Dumbbells', 'Bench'],
    });
    const names = program.days.flatMap((day) => day.exercises.map((exercise) => exercise.name));
    expect(program.name).toBe('Upper / lower');
    expect(names.some((name) => name.includes('Dumbbell'))).toBe(true);
    expect(names.some((name) => name.startsWith('Barbell'))).toBe(false);
  });

  test('moves the next target up after the top of the rep range', () => {
    const exercise = buildProgram({
      goal: 'gain',
      days: 3,
      sessionMinutes: 45,
      experience: 'intermediate',
      equipment: ['Dumbbells'],
    }).days[0].exercises[0];
    const target = nextTarget({ ...exercise, repHigh: 12 }, { weight: 145, reps: 12, rir: 1 });
    expect(target.weight).toBeGreaterThan(145);
    expect(target.reps).toBe(exercise.repLow);
    expect(target.note).toMatch(/145 × 12/);
  });

  test('keeps the same weight when the range is not topped out', () => {
    const exercise = buildProgram({
      goal: 'lose',
      days: 3,
      sessionMinutes: 45,
      experience: 'beginner',
      equipment: ['Dumbbells'],
    }).days[0].exercises[0];
    const updated = applyProgression(exercise, [{ weight: 40, reps: 8, rir: 2 }]);
    expect(updated.nextWeight).toBe(40);
    expect(updated.lastReps).toBe(8);
  });

  test('marks a muscle recovering and a secondary mover on a shorter clock', () => {
    const now = new Date('2026-06-14T18:00:00');
    const status = recoveryStatus([
      {
        date: '2026-06-14T08:00:00',
        exercises: [{ muscle: 'chest', secondary: ['triceps', 'shoulders'] }],
      },
    ], now);
    const chest = status.find((item) => item.muscle === 'chest');
    const triceps = status.find((item) => item.muscle === 'triceps');
    expect(chest?.status).toBe('recovering');
    expect(triceps?.status).toBe('recovering');
    expect((triceps?.hoursLeft || 0)).toBeLessThan(chest?.hoursLeft || 0);
  });
});
