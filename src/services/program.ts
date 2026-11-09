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
];

const SPLITS: Record<string, Array<{ name: string; muscles: string[] }>> = {
  'Full body': [
    { name: 'Full Body A', muscles: ['quads', 'chest', 'back', 'shoulders', 'core'] },
    { name: 'Full Body B', muscles: ['hamstrings', 'back', 'chest', 'glutes', 'biceps'] },
  ],
  'Upper / lower': [
    { name: 'Upper A', muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
    { name: 'Lower A', muscles: ['quads', 'hamstrings', 'glutes', 'core'] },
    { name: 'Upper B', muscles: ['back', 'chest', 'shoulders', 'triceps', 'biceps'] },
    { name: 'Lower B', muscles: ['hamstrings', 'quads', 'glutes', 'core'] },
  ],
  'Push / pull / legs': [
    { name: 'Push', muscles: ['chest', 'shoulders', 'triceps', 'chest', 'shoulders'] },
    { name: 'Pull', muscles: ['back', 'back', 'biceps', 'shoulders', 'core'] },
    { name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'quads', 'core'] },
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
}): TrainingProgram {
  const splitName = input.days <= 3 ? 'Full body' : input.days === 4 ? 'Upper / lower' : 'Push / pull / legs';
  const templates = SPLITS[splitName];
  const owned = ownedGear(input.equipment);
  const count = exerciseCount(input.sessionMinutes);
  const sets = input.experience === 'beginner' ? 3 : input.experience === 'advanced' ? 4 : 3;
  const repLow = input.goal === 'lose' ? 6 : 8;
  const repHigh = input.goal === 'lose' ? 10 : 12;
  const restSec = input.goal === 'lose' ? 120 : 90;

  const days = templates.slice(0, input.days <= 3 ? 2 : templates.length).map((template) => {
    const used = new Set<string>();
    const exercises: ProgramExercise[] = [];
    template.muscles.forEach((muscle) => {
      if (exercises.length >= count) return;
      const lift = pickLift(muscle, owned, used);
      if (!lift) return;
      exercises.push({
        ...lift,
        sets: muscle === 'biceps' || muscle === 'triceps' || muscle === 'core' ? Math.max(2, sets - 1) : sets,
        repLow: lift.name === 'Plank' ? 30 : repLow,
        repHigh: lift.name === 'Plank' ? 60 : repHigh,
        restSec: lift.name === 'Plank' ? 45 : restSec,
      });
    });
    return { id: `day_${template.name.replace(/\s+/g, '_').toLowerCase()}`, name: template.name, exercises };
  });

  return {
    id: `program_${Date.now()}`,
    name: splitName,
    days,
    schedule: trainingSchedule(input.days).slice(0, input.days),
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

export function nextTarget(exercise: ProgramExercise, performance?: SetPerformance): { weight: number; reps: number; note: string } {
  const working = performance && !performance.dropset ? performance : undefined;
  const weight = working?.weight ?? exercise.lastWeight ?? exercise.nextWeight ?? 0;
  const reps = working?.reps ?? exercise.lastReps ?? exercise.nextReps ?? exercise.repLow;
  const toppedOut = reps >= exercise.repHigh && weight > 0 && exercise.name !== 'Plank';
  if (toppedOut) {
    const jump = exercise.muscle === 'quads' || exercise.muscle === 'hamstrings' ? (weight >= 100 ? 10 : 5) : 5;
    const nextWeight = roundLoad(weight + jump);
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
  const aim = working && working.rir >= 2 && reps < exercise.repHigh ? reps + 1 : reps;
  return { weight, reps: aim, note: `Stay at ${weight} lb and aim for ${aim} reps.` };
}

export function applyProgression(exercise: ProgramExercise, sets: SetPerformance[]): ProgramExercise {
  const working = [...sets].reverse().find((set) => !set.dropset) || sets[sets.length - 1];
  if (!working) return exercise;
  const target = nextTarget(exercise, working);
  return {
    ...exercise,
    lastWeight: working.weight,
    lastReps: working.reps,
    lastRir: working.rir,
    nextWeight: target.weight,
    nextReps: target.reps,
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
