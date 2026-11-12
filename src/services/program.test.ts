import { applyProgression, buildProgram, deloadWeek, nextTarget, recoveryStatus, weeklySetTarget, weeklySets } from './program';

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

  test('gives a 75-minute gain plan a full growth dose', () => {
    const program = buildProgram({
      goal: 'gain',
      days: 4,
      sessionMinutes: 75,
      experience: 'intermediate',
      equipment: ['Dumbbells', 'Bench'],
    });
    const totals = weeklySets(program);
    expect(totals.chest).toBeGreaterThanOrEqual(10);
    expect(totals.back).toBeGreaterThanOrEqual(10);
    expect(totals.quads).toBeGreaterThanOrEqual(10);
    expect(totals.hamstrings).toBeGreaterThanOrEqual(10);
    const lifts = program.days.flatMap((day) => day.exercises);
    expect(lifts.find((exercise) => exercise.muscle === 'chest')?.restSec).toBeGreaterThanOrEqual(150);
    expect(lifts.find((exercise) => exercise.muscle === 'biceps')?.restSec).toBe(90);
    program.days.forEach((day) => {
      const minutes = day.exercises.reduce((sum, exercise) => sum + exercise.sets * (exercise.restSec + 40), 0) / 60;
      expect(minutes).toBeLessThanOrEqual(76);
    });
  });

  test('hits legs twice in a five-day week and chest every three-day session', () => {
    const five = buildProgram({
      goal: 'gain',
      days: 5,
      sessionMinutes: 75,
      experience: 'intermediate',
      equipment: ['Dumbbells', 'Bench'],
    });
    expect(five.days.filter((day) => day.exercises.some((exercise) => exercise.muscle === 'quads')).length).toBeGreaterThanOrEqual(2);
    expect(five.days.filter((day) => day.exercises.some((exercise) => exercise.muscle === 'hamstrings')).length).toBeGreaterThanOrEqual(2);

    const three = buildProgram({
      goal: 'gain',
      days: 3,
      sessionMinutes: 75,
      experience: 'intermediate',
      equipment: ['Dumbbells', 'Bench'],
    });
    expect(three.days.filter((day) => day.exercises.some((exercise) => exercise.muscle === 'chest')).length).toBe(3);
    expect(three.days.filter((day) => day.exercises.some((exercise) => exercise.muscle === 'quads')).length).toBeGreaterThanOrEqual(2);
  });

  test('adds 2.5 lb on an isolation lift and does not raise the load on a deload', () => {
    const curl = buildProgram({
      goal: 'gain',
      days: 4,
      sessionMinutes: 75,
      experience: 'intermediate',
      equipment: ['Dumbbells', 'Bench'],
    }).days.flatMap((day) => day.exercises).find((exercise) => exercise.muscle === 'biceps');
    expect(curl).toBeTruthy();
    const target = nextTarget(curl!, { weight: 30, reps: curl!.repHigh, rir: 1 });
    expect(target.weight).toBe(32.5);
    const held = applyProgression(curl!, [{ weight: 30, reps: curl!.repHigh, rir: 1 }], { deload: true });
    expect(held.nextWeight).toBe(30);
    const start = new Date('2026-01-01T00:00:00Z');
    expect(deloadWeek(start.toISOString(), new Date(start.getTime() + 5 * 7 * 24 * 60 * 60 * 1000))).toBe(true);
    expect(deloadWeek(start.toISOString(), new Date(start.getTime() + 4 * 7 * 24 * 60 * 60 * 1000))).toBe(false);
  });

  test('puts an asked-for muscle first and gives it an extra set', () => {
    const focused = buildProgram({
      goal: 'gain',
      days: 4,
      sessionMinutes: 75,
      experience: 'intermediate',
      equipment: ['Dumbbells', 'Bench'],
      emphasis: ['shoulders'],
    });
    const plain = buildProgram({
      goal: 'gain',
      days: 4,
      sessionMinutes: 75,
      experience: 'intermediate',
      equipment: ['Dumbbells', 'Bench'],
    });
    const upper = focused.days.find((day) => day.name === 'Upper A');
    expect(upper?.exercises[0].muscle).toBe('shoulders');
    expect(weeklySets(focused).shoulders).toBeGreaterThanOrEqual(weeklySets(plain).shoulders);
    expect(focused.volumeNote || '').toMatch(/shoulders/);
  });

  test('uses a smaller dose and a slower pace for an older lifter on a cut', () => {
    expect(weeklySetTarget('chest', 'lose', 'intermediate', 55)).toBeLessThan(weeklySetTarget('chest', 'gain', 'intermediate', 30));
    const older = buildProgram({
      goal: 'lose',
      days: 4,
      sessionMinutes: 75,
      experience: 'intermediate',
      equipment: ['Dumbbells', 'Bench'],
      age: 55,
    });
    const younger = buildProgram({
      goal: 'gain',
      days: 4,
      sessionMinutes: 75,
      experience: 'intermediate',
      equipment: ['Dumbbells', 'Bench'],
      age: 28,
    });
    const olderChest = older.days.flatMap((day) => day.exercises).find((exercise) => exercise.muscle === 'chest');
    const youngerChest = younger.days.flatMap((day) => day.exercises).find((exercise) => exercise.muscle === 'chest');
    expect(weeklySets(older).chest).toBeLessThan(weeklySets(younger).chest);
    expect(olderChest?.restSec || 0).toBeGreaterThan(150);
    expect(youngerChest?.repHigh).toBe(10);
    expect(olderChest?.repHigh).toBe(12);
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
