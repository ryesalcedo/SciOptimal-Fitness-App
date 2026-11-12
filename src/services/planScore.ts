import { GoalType } from './coaching';
import { estimatedOneRepMax } from './program';

export interface PlanScore {
  total: number;
  strength: number;
  nutrition: number;
  consistency: number;
  note: string;
}

export function planScore(input: {
  goal: GoalType;
  plannedWorkouts: number;
  completedWorkouts: number;
  setsThisWeek: number;
  plannedSets: number;
  newPrs: number;
  loggedDays: number;
  proteinHitDays: number;
  weighIns: number;
}): PlanScore {
  const strength = Math.round(Math.min(100,
    35
    + Math.min(40, input.plannedSets ? (input.setsThisWeek / input.plannedSets) * 40 : 0)
    + Math.min(25, input.newPrs * 8)
  ));
  const nutrition = Math.round(Math.min(100,
    (input.loggedDays / 7) * 55
    + (input.proteinHitDays / 7) * 30
    + Math.min(15, input.weighIns * 5)
  ));
  const consistency = Math.round(Math.min(100,
    (input.plannedWorkouts ? input.completedWorkouts / input.plannedWorkouts : 0) * 60
    + (input.loggedDays / 7) * 40
  ));
  const weights = input.goal === 'gain'
    ? { strength: 0.45, nutrition: 0.3, consistency: 0.25 }
    : input.goal === 'lose'
      ? { strength: 0.3, nutrition: 0.45, consistency: 0.25 }
      : { strength: 0.34, nutrition: 0.33, consistency: 0.33 };
  const total = Math.round(strength * weights.strength + nutrition * weights.nutrition + consistency * weights.consistency);
  const weakest = [
    { name: 'strength', value: strength },
    { name: 'nutrition', value: nutrition },
    { name: 'consistency', value: consistency },
  ].sort((a, b) => a.value - b.value)[0];
  return {
    total,
    strength,
    nutrition,
    consistency,
    note: `${weakest.name[0].toUpperCase()}${weakest.name.slice(1)} is the part to push next.`,
  };
}

export function isPersonalRecord(weight: number, reps: number, history: Array<{ weight: number; reps: number }>): boolean {
  const current = estimatedOneRepMax(weight, reps);
  if (current <= 0) return false;
  return history.every((set) => estimatedOneRepMax(set.weight, set.reps) < current);
}

export function looksLikeWater(scale: number, trend: number): boolean {
  if (!scale || !trend) return false;
  return Math.abs(scale - trend) >= Math.max(2, trend * 0.012);
}
