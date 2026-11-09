export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type GoalType = 'lose' | 'maintain' | 'gain';

export interface LiftOption {
  name: string;
  equipment: string;
}

export interface ProgramExercise {
  id: string;
  name: string;
  muscle: string;
  secondary: string[];
  equipment: string;
  options: LiftOption[];
  sets: number;
  repLow: number;
  repHigh: number;
  restSec: number;
  lastWeight?: number;
  lastReps?: number;
  lastRir?: number;
  nextWeight?: number;
  nextReps?: number;
}

export interface ProgramDay {
  id: string;
  name: string;
  exercises: ProgramExercise[];
}

export interface TrainingProgram {
  id: string;
  name: string;
  days: ProgramDay[];
  schedule: number[];
  startedAt: string;
  volumeNote?: string;
}

export interface SetPerformance {
  weight: number;
  reps: number;
  rir: number;
  dropset?: boolean;
}

const LIBRARY: Array<Omit<ProgramExercise, 'id' | 'sets' | 'repLow' | 'repHigh' | 'restSec' | 'name' | 'equipment'> & { options: LiftOption[] }> = [
  {
    muscle: 'quads',
    secondary: ['glutes'],
    options: [
      { name: 'Barbell Back Squat', equipment: 'barbell' },
      { name: 'Goblet Squat', equipment: 'dumbbell' },
      { name: 'Leg Press', equipment: 'machine' },
      { name: 'Bodyweight Squat', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'chest',
    secondary: ['triceps', 'shoulders'],
    options: [
      { name: 'Barbell Bench Press', equipment: 'barbell' },
      { name: 'Dumbbell Bench Press', equipment: 'dumbbell' },
      { name: 'Machine Chest Press', equipment: 'machine' },
      { name: 'Push-up', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'back',
    secondary: ['biceps'],
    options: [
      { name: 'Barbell Row', equipment: 'barbell' },
      { name: 'Dumbbell Row', equipment: 'dumbbell' },
      { name: 'Seated Cable Row', equipment: 'cable' },
      { name: 'Inverted Row', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'hamstrings',
    secondary: ['glutes'],
    options: [
      { name: 'Romanian Deadlift', equipment: 'barbell' },
      { name: 'Dumbbell Romanian Deadlift', equipment: 'dumbbell' },
      { name: 'Kettlebell Deadlift', equipment: 'kettlebell' },
      { name: 'Good Morning', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'shoulders',
    secondary: ['triceps'],
    options: [
      { name: 'Overhead Press', equipment: 'barbell' },
      { name: 'Dumbbell Shoulder Press', equipment: 'dumbbell' },
      { name: 'Machine Shoulder Press', equipment: 'machine' },
      { name: 'Pike Push-up', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'back',
    secondary: ['biceps'],
    options: [
      { name: 'Pull-up', equipment: 'pullup' },
      { name: 'Lat Pulldown', equipment: 'cable' },
      { name: 'Machine Pulldown', equipment: 'machine' },
      { name: 'Band Pulldown', equipment: 'band' },
    ],
  },
  {
    muscle: 'glutes',
    secondary: ['quads'],
    options: [
      { name: 'Walking Lunge', equipment: 'dumbbell' },
      { name: 'Barbell Lunge', equipment: 'barbell' },
      { name: 'Bodyweight Lunge', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'glutes',
    secondary: ['hamstrings'],
    options: [
      { name: 'Dumbbell Hip Thrust', equipment: 'dumbbell' },
      { name: 'Barbell Hip Thrust', equipment: 'barbell' },
      { name: 'Glute Bridge', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'back',
    secondary: ['biceps'],
    options: [
      { name: 'Chest-Supported Dumbbell Row', equipment: 'dumbbell' },
      { name: 'Seal Row', equipment: 'barbell' },
      { name: 'Machine Row', equipment: 'machine' },
    ],
  },
  {
    muscle: 'chest',
    secondary: ['shoulders'],
    options: [
      { name: 'Incline Dumbbell Press', equipment: 'dumbbell' },
      { name: 'Incline Barbell Press', equipment: 'barbell' },
      { name: 'Incline Push-up', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'biceps',
    secondary: [],
    options: [
      { name: 'Dumbbell Curl', equipment: 'dumbbell' },
      { name: 'Barbell Curl', equipment: 'barbell' },
      { name: 'Cable Curl', equipment: 'cable' },
    ],
  },
  {
    muscle: 'triceps',
    secondary: [],
    options: [
      { name: 'Dumbbell Overhead Extension', equipment: 'dumbbell' },
      { name: 'Cable Pressdown', equipment: 'cable' },
      { name: 'Bench Dip', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'shoulders',
    secondary: [],
    options: [
      { name: 'Dumbbell Lateral Raise', equipment: 'dumbbell' },
      { name: 'Cable Lateral Raise', equipment: 'cable' },
      { name: 'Band Lateral Raise', equipment: 'band' },
    ],
  },
  {
    muscle: 'core',
    secondary: [],
    options: [
      { name: 'Plank', equipment: 'bodyweight' },
      { name: 'Cable Crunch', equipment: 'cable' },
      { name: 'Hanging Knee Raise', equipment: 'pullup' },
    ],
  },
  {
    muscle: 'quads',
    secondary: ['glutes'],
    options: [
      { name: 'Bulgarian Split Squat', equipment: 'dumbbell' },
      { name: 'Barbell Split Squat', equipment: 'barbell' },
      { name: 'Bodyweight Split Squat', equipment: 'bodyweight' },
    ],
  },
  {
    muscle: 'hamstrings',
    secondary: ['glutes'],
    options: [
      { name: 'Dumbbell Leg Curl', equipment: 'dumbbell' },
      { name: 'Machine Leg Curl', equipment: 'machine' },
      { name: 'Sliding Leg Curl', equipment: 'bodyweight' },
    ],
  },
];

const BIG_MUSCLES = new Set(['quads', 'hamstrings', 'glutes', 'chest', 'back', 'shoulders']);

const DAY_TEMPLATES: Record<string, Array<{ name: string; muscles: string[] }>> = {
  'Full body': [
    { name: 'Full Body A', muscles: ['quads', 'hamstrings', 'chest', 'back', 'shoulders', 'biceps'] },
    { name: 'Full Body B', muscles: ['hamstrings', 'quads', 'back', 'chest', 'shoulders', 'triceps'] },
    { name: 'Full Body C', muscles: ['quads', 'hamstrings', 'chest', 'back', 'glutes', 'core'] },
  ],
  'Upper / lower': [
    { name: 'Upper A', muscles: ['chest', 'back', 'shoulders', 'chest', 'shoulders', 'biceps'] },
    { name: 'Lower A', muscles: ['quads', 'hamstrings', 'glutes', 'quads', 'hamstrings', 'glutes'] },
    { name: 'Upper B', muscles: ['back', 'chest', 'shoulders', 'back', 'shoulders', 'triceps'] },
    { name: 'Lower B', muscles: ['hamstrings', 'quads', 'glutes', 'hamstrings', 'quads', 'glutes'] },
  ],
  'Upper / lower / push / pull / legs': [
    { name: 'Upper', muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
    { name: 'Lower', muscles: ['quads', 'hamstrings', 'glutes', 'core'] },
    { name: 'Push', muscles: ['chest', 'shoulders', 'triceps', 'chest', 'shoulders'] },
    { name: 'Pull', muscles: ['back', 'back', 'biceps', 'shoulders', 'core'] },
    { name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'quads', 'hamstrings'] },
  ],
  'Push / pull / legs': [
    { name: 'Push A', muscles: ['chest', 'shoulders', 'triceps', 'chest', 'shoulders', 'triceps'] },
    { name: 'Pull A', muscles: ['back', 'back', 'biceps', 'shoulders', 'biceps', 'core'] },
    { name: 'Legs A', muscles: ['quads', 'hamstrings', 'glutes', 'quads', 'hamstrings', 'core'] },
    { name: 'Push B', muscles: ['chest', 'shoulders', 'triceps', 'chest', 'shoulders', 'triceps'] },
    { name: 'Pull B', muscles: ['back', 'back', 'biceps', 'shoulders', 'biceps', 'core'] },
    { name: 'Legs B', muscles: ['hamstrings', 'quads', 'glutes', 'hamstrings', 'quads', 'core'] },
  ],
};

const EQUIPMENT_TAGS: Record<string, string> = {
  Barbell: 'barbell',
  Dumbbells: 'dumbbell',
  Bench: 'bench',
  'Squat Rack': 'rack',
  'Pull-up Bar': 'pullup',
  Cables: 'cable',
  Machines: 'machine',
  Kettlebells: 'kettlebell',
  Bands: 'band',
};

export function ownedGear(equipment: string[]): Set<string> {
  const owned = new Set<string>(['bodyweight']);
  equipment.forEach((item) => {
    const tag = EQUIPMENT_TAGS[item];
    if (tag) owned.add(tag);
  });
  if (owned.has('barbell')) owned.add('rack');
  return owned;
}

function pickLift(muscle: string, owned: Set<string>, used: Set<string>): ProgramExercise | null {
  const candidates = LIBRARY.filter((lift) => lift.muscle === muscle && !used.has(lift.options[0].name));
  for (const lift of candidates) {
    const available = lift.options.filter((option) => owned.has(option.equipment));
    if (available.length === 0) continue;
    used.add(lift.options[0].name);
    return {
      id: `lift_${muscle}_${available[0].name.replace(/\s+/g, '_').toLowerCase()}`,
      name: available[0].name,
      muscle,
      secondary: lift.secondary,
      equipment: available[0].equipment,
      options: available,
      sets: 3,
      repLow: 8,
      repHigh: 12,
      restSec: 90,
    };
  }
  return null;
}

export function exerciseCount(sessionMinutes: number): number {
  if (sessionMinutes <= 40) return 4;
  if (sessionMinutes <= 60) return 5;
  return 6;
}

export function weeklySetTarget(muscle: string, goal: GoalType, experience: Experience, age = 30): number {
  const big = BIG_MUSCLES.has(muscle);
  let target: number;
  if (goal === 'gain') {
    if (experience === 'advanced') target = big ? 14 : 10;
    else if (experience === 'beginner') target = big ? 10 : 6;
    else target = big ? 12 : 8;
  } else if (goal === 'lose') {
    target = big ? (experience === 'advanced' ? 10 : 8) : 6;
  } else if (experience === 'advanced') {
    target = big ? 12 : 8;
  } else if (experience === 'beginner') {
    target = big ? 8 : 6;
  } else {
    target = big ? 10 : 8;
  }
  if (age >= 50) target -= 2;
  return Math.max(big ? 6 : 4, target);
}

export function isIsolation(exercise: Pick<ProgramExercise, 'muscle' | 'secondary'>): boolean {
  return exercise.muscle === 'biceps' || exercise.muscle === 'triceps' || exercise.muscle === 'core' || exercise.secondary.length === 0;
}

export function loadJump(exercise: Pick<ProgramExercise, 'muscle' | 'secondary' | 'equipment'>, weight: number): number {
  if (isIsolation(exercise)) return 2.5;
  const heavyBarbell = (exercise.muscle === 'quads' || exercise.muscle === 'hamstrings') && exercise.equipment === 'barbell' && weight >= 100;
  return heavyBarbell ? 10 : 5;
}

export function weeklySets(program: TrainingProgram): Record<string, number> {
  const totals: Record<string, number> = {};
  program.days.forEach((day) => {
    day.exercises.forEach((exercise) => {
      totals[exercise.muscle] = (totals[exercise.muscle] || 0) + exercise.sets;
    });
  });
  return totals;
}

export function deloadWeek(startedAt: string | undefined, date = new Date()): boolean {
  if (!startedAt) return false;
  const elapsed = date.getTime() - new Date(startedAt).getTime();
  if (elapsed < 0) return false;
  const week = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
  return week > 0 && week % 6 === 5;
}

export function prescribedSets(sets: number, deload: boolean): number {
  if (!deload) return sets;
  return Math.max(2, Math.round(sets * 0.6));
}

function sessionMinutesUsed(exercises: ProgramExercise[]): number {
  return exercises.reduce((sum, exercise) => sum + exercise.sets * (exercise.restSec + 40), 0) / 60;
}

function applyDose(exercise: ProgramExercise, appearances: number, goal: GoalType, experience: Experience, age: number) {
  const cap = exercise.name === 'Plank' ? 3 : 4;
  const weekly = weeklySetTarget(exercise.muscle, goal, experience, age);
  exercise.sets = Math.min(cap, Math.max(2, Math.round(weekly / appearances)));
  if (exercise.name === 'Plank') {
    exercise.repLow = 30;
    exercise.repHigh = 60;
    exercise.restSec = 45;
    return;
  }
  if (isIsolation(exercise)) {
    exercise.repLow = 10;
    exercise.repHigh = 15;
    exercise.restSec = age >= 50 ? 120 : 90;
    return;
  }
  exercise.repLow = goal === 'lose' ? 8 : 6;
  exercise.repHigh = goal === 'lose' ? 12 : 10;
  exercise.restSec = (goal === 'lose' ? 150 : 180) + (age >= 50 ? 30 : 0);
}

function fitWeek(days: ProgramDay[], minutes: number, goal: GoalType, experience: Experience, age: number) {
  const all = days.flatMap((day) => day.exercises);
  const surplus = (exercise: ProgramExercise) => {
    const weekly = all.filter((item) => item.muscle === exercise.muscle).reduce((sum, item) => sum + item.sets, 0);
    const over = weekly - weeklySetTarget(exercise.muscle, goal, experience, age);
    return (isIsolation(exercise) ? 20 : 0) + over;
  };
  let guard = 0;
  while (guard < 80 && days.some((day) => sessionMinutesUsed(day.exercises) > minutes)) {
    guard += 1;
    const crowded = days.filter((day) => sessionMinutesUsed(day.exercises) > minutes);
    const candidate = crowded
      .flatMap((day) => day.exercises)
      .filter((exercise) => exercise.sets > 2 && exercise.name !== 'Plank')
      .sort((a, b) => surplus(b) - surplus(a))[0];
    if (!candidate) break;
    candidate.sets -= 1;
  }
}

export function trainingSchedule(days: number): number[] {
  if (days <= 3) return [1, 3, 5];
  if (days === 4) return [1, 2, 4, 5];
  if (days === 5) return [1, 2, 3, 4, 5];
  return [1, 2, 3, 4, 5, 6];
}

export function buildProgram(input: {
  goal: GoalType;
  days: number;
  sessionMinutes: number;
  experience: Experience;
  equipment: string[];
  age?: number;
}): TrainingProgram {
  const age = input.age ?? 30;
  const splitName = input.days <= 3
    ? 'Full body'
    : input.days === 4
      ? 'Upper / lower'
      : input.days === 5
        ? 'Upper / lower / push / pull / legs'
        : 'Push / pull / legs';
  const templates = DAY_TEMPLATES[splitName].slice(0, input.days === 6 ? 6 : input.days);
  const owned = ownedGear(input.equipment);
  const count = exerciseCount(input.sessionMinutes);
  const days = templates.map((template) => {
    const used = new Set<string>();
    const exercises: ProgramExercise[] = [];
    template.muscles.forEach((muscle) => {
      if (exercises.length >= count) return;
      const lift = pickLift(muscle, owned, used);
      if (!lift) return;
      exercises.push(lift);
    });
    return { id: `day_${template.name.replace(/\s+/g, '_').toLowerCase()}`, name: template.name, exercises };
  });

  const appearances = new Map<string, number>();
  days.forEach((day) => {
    day.exercises.forEach((exercise) => {
      appearances.set(exercise.muscle, (appearances.get(exercise.muscle) || 0) + 1);
    });
  });
  days.forEach((day) => {
    day.exercises.forEach((exercise) => {
      applyDose(exercise, appearances.get(exercise.muscle) || 1, input.goal, input.experience, age);
    });
  });
  fitWeek(days, input.sessionMinutes, input.goal, input.experience, age);

  const totals: Record<string, number> = {};
  days.forEach((day) => {
    day.exercises.forEach((exercise) => {
      totals[exercise.muscle] = (totals[exercise.muscle] || 0) + exercise.sets;
    });
  });
  const short = ['chest', 'back', 'quads', 'hamstrings'].filter((muscle) => (
    (totals[muscle] || 0) > 0 && (totals[muscle] || 0) + 1 < weeklySetTarget(muscle, input.goal, input.experience, age)
  ));
  const doseName = input.goal === 'lose' ? 'muscle-keeping dose' : input.goal === 'maintain' ? 'maintenance dose' : 'growth dose';
  const volumeNote = short.length === 0
    ? undefined
    : input.sessionMinutes < 75
      ? `${input.sessionMinutes} minutes trims a few sets. 75 minutes fits the full ${doseName}.`
      : 'The biggest muscles are a set or two under the top of the range. Add one set on any lift that still feels strong.';

  return {
    id: `program_${Date.now()}`,
    name: splitName,
    days,
    schedule: trainingSchedule(input.days).slice(0, input.days),
    startedAt: new Date().toISOString(),
    volumeNote,
  };
}

export function sessionForDate(program: TrainingProgram, date: Date): { day: ProgramDay | null; rest: boolean; next: ProgramDay | null } {
  const weekday = date.getDay();
  const index = program.schedule.indexOf(weekday);
  if (index === -1) {
    const upcoming = program.schedule.find((day) => day > weekday) ?? program.schedule[0];
    const nextIndex = program.schedule.indexOf(upcoming);
    return { day: null, rest: true, next: program.days[nextIndex % program.days.length] || null };
  }
  return { day: program.days[index % program.days.length], rest: false, next: null };
}

export function roundLoad(weight: number): number {
  return Math.round(weight * 2) / 2;
}

export function nextTarget(
  exercise: ProgramExercise,
  performance?: SetPerformance,
  options?: { deload?: boolean },
): { weight: number; reps: number; note: string } {
  const working = performance && !performance.dropset ? performance : undefined;
  const weight = working?.weight ?? exercise.lastWeight ?? exercise.nextWeight ?? 0;
  const reps = working?.reps ?? exercise.lastReps ?? exercise.nextReps ?? exercise.repLow;
  if (options?.deload) {
    return {
      weight,
      reps: exercise.name === 'Plank' ? exercise.repLow : Math.max(exercise.repLow, reps),
      note: 'Deload week. Keep this weight and stop two reps early. The load goes back up next week.',
    };
  }
  const toppedOut = reps >= exercise.repHigh && weight > 0 && exercise.name !== 'Plank';
  if (toppedOut) {
    const nextWeight = roundLoad(weight + loadJump(exercise, weight));
    return {
      weight: nextWeight,
      reps: exercise.repLow,
      note: `You topped out at ${weight} × ${reps}, so the next target is ${nextWeight} × ${exercise.repLow}.`,
    };
  }
  if (exercise.name === 'Plank') {
    const seconds = Math.min(exercise.repHigh, Math.max(exercise.repLow, reps + 5));
    return { weight: 0, reps: seconds, note: `Hold the plank for ${seconds} seconds next set.` };
  }
  if (!weight) {
    return { weight: 0, reps: exercise.repLow, note: `Pick a weight you can do for ${exercise.repLow} reps with 2 left in the tank.` };
  }
  if (working && reps < exercise.repLow && working.rir <= 1) {
    const nextWeight = roundLoad(Math.max(weight - loadJump(exercise, weight), loadJump(exercise, weight)));
    return { weight: nextWeight, reps: exercise.repLow, note: `That set missed the range. Next time use ${nextWeight} lb and own ${exercise.repLow} reps.` };
  }
  const aim = working && working.rir >= 1 && reps < exercise.repHigh ? reps + 1 : reps;
  return { weight, reps: aim, note: `Stay at ${weight} lb and aim for ${aim} reps. Rest long enough that the next set is still strong.` };
}

export function applyProgression(exercise: ProgramExercise, sets: SetPerformance[], options?: { deload?: boolean }): ProgramExercise {
  const working = [...sets].reverse().find((set) => !set.dropset) || sets[sets.length - 1];
  if (!working) return exercise;
  const target = nextTarget(exercise, working, options);
  return {
    ...exercise,
    lastWeight: working.weight,
    lastReps: working.reps,
    lastRir: working.rir,
    nextWeight: options?.deload ? exercise.nextWeight || working.weight : target.weight,
    nextReps: options?.deload ? exercise.nextReps || exercise.repLow : target.reps,
  };
}

const PRIMARY_HOURS: Record<string, number> = {
  quads: 72,
  hamstrings: 72,
  back: 72,
  chest: 48,
  shoulders: 48,
  glutes: 48,
  biceps: 48,
  triceps: 48,
  core: 24,
};

export interface MuscleStatus {
  muscle: string;
  status: 'ready' | 'recovering';
  hoursLeft: number;
  role: 'primary' | 'secondary';
}

export function recoveryStatus(
  sessions: Array<{ date: string; exercises: Array<{ muscle: string; secondary: string[] }> }>,
  now = new Date()
): MuscleStatus[] {
  const latest = new Map<string, { at: number; role: 'primary' | 'secondary' }>();
  sessions.forEach((session) => {
    const at = new Date(session.date).getTime();
    session.exercises.forEach((exercise) => {
      const current = latest.get(exercise.muscle);
      if (!current || current.at < at || current.role === 'secondary') {
        latest.set(exercise.muscle, { at, role: 'primary' });
      }
      exercise.secondary.forEach((muscle) => {
        const secondary = latest.get(muscle);
        if (!secondary || (secondary.role === 'secondary' && secondary.at < at)) {
          if (!secondary || secondary.role !== 'primary') latest.set(muscle, { at, role: 'secondary' });
        }
      });
    });
  });

  return Array.from(latest.entries()).map(([muscle, info]): MuscleStatus => {
    const needed = info.role === 'primary' ? (PRIMARY_HOURS[muscle] || 48) : 24;
    const elapsed = (now.getTime() - info.at) / 36e5;
    const hoursLeft = Math.max(0, Math.ceil(needed - elapsed));
    return {
      muscle,
      status: hoursLeft > 0 ? 'recovering' : 'ready',
      hoursLeft,
      role: info.role,
    };
  }).sort((a, b) => b.hoursLeft - a.hoursLeft);
}

export function estimatedOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}
