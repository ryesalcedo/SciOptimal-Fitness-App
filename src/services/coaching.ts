import { dayKey, poundsToKilograms, shiftDay } from '../utils/units';

export type GoalType = 'lose' | 'maintain' | 'gain';

export interface CoachingProfile {
  sex: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
}

export interface CoachingGoal {
  type: GoalType;
  rateLbPerWeek: number;
}

export interface IntakeDay {
  date: string;
  calories: number;
}

export interface WeighIn {
  date: string;
  weight: number;
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  expenditure: number;
  source: 'profile' | 'logs';
  confidence: number;
  trendLbPerWeek: number | null;
  averageIntake: number | null;
  note: string;
}

const KCAL_PER_POUND = 3500;
const KCAL_PER_POUND_OF_LEAN_GAIN = 2200;

export function formulaExpenditure(profile: CoachingProfile, trainingDays: number): number {
  const weightKg = poundsToKilograms(profile.weight);
  const heightCm = profile.height * 2.54;
  const bmr = profile.sex === 'male'
    ? (10 * weightKg) + (6.25 * heightCm) - (5 * profile.age) + 5
    : (10 * weightKg) + (6.25 * heightCm) - (5 * profile.age) - 161;
  const activity = 1.2 + Math.max(0, Math.min(trainingDays, 7)) * 0.075;
  return Math.round(bmr * activity);
}

export function smoothWeight(weighIns: WeighIn[], alpha = 0.2): Array<{ date: string; scale: number; trend: number }> {
  const byDay = new Map<string, number>();
  weighIns.forEach((point) => {
    if (point.weight > 0) byDay.set(point.date, point.weight);
  });
  const days = Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  let trend = days[0]?.[1] ?? 0;
  return days.map(([date, scale], index) => {
    trend = index === 0 ? scale : trend + alpha * (scale - trend);
    return { date, scale, trend: Math.round(trend * 10) / 10 };
  });
}

function regressionPerDay(points: Array<{ day: number; value: number }>): number {
  if (points.length < 2) return 0;
  const meanDay = points.reduce((sum, point) => sum + point.day, 0) / points.length;
  const meanValue = points.reduce((sum, point) => sum + point.value, 0) / points.length;
  let numerator = 0;
  let denominator = 0;
  points.forEach((point) => {
    numerator += (point.day - meanDay) * (point.value - meanValue);
    denominator += (point.day - meanDay) ** 2;
  });
  return denominator === 0 ? 0 : numerator / denominator;
}

function signedRate(goal: CoachingGoal): number {
  if (goal.type === 'lose') return -Math.abs(goal.rateLbPerWeek);
  if (goal.type === 'gain') return Math.abs(goal.rateLbPerWeek);
  return 0;
}

export function suggestedRate(input: {
  weightLb: number;
  sex: 'male' | 'female';
  experience: 'beginner' | 'intermediate' | 'advanced';
  goal: GoalType;
}): number {
  if (input.goal === 'maintain') return 0;
  const sexFactor = input.sex === 'female' && input.goal === 'gain' ? 0.6 : 1;
  const fraction = input.goal === 'lose'
    ? (input.experience === 'beginner' ? 0.006 : input.experience === 'advanced' ? 0.004 : 0.005)
    : (input.experience === 'beginner' ? 0.004 : input.experience === 'advanced' ? 0.0015 : 0.0025) * sexFactor;
  const stepped = Math.round(input.weightLb * fraction * 4) / 4;
  return Math.min(1.5, Math.max(0.25, stepped));
}

export function suggestedGainRate(
  weightLb: number,
  experience: 'beginner' | 'intermediate' | 'advanced',
  sex: 'male' | 'female' = 'male',
): number {
  return suggestedRate({ weightLb, sex, experience, goal: 'gain' });
}

export function macrosFor(calories: number, weightLb: number, goalType: GoalType): { protein: number; carbs: number; fat: number; calories: number } {
  const proteinPerLb = goalType === 'maintain' ? 0.8 : 1;
  let protein = Math.round(weightLb * proteinPerLb);
  protein = Math.min(protein, Math.round((calories * 0.4) / 4));
  const minimumFat = Math.max(Math.round(weightLb * 0.3), Math.round((calories * 0.2) / 9));
  let fat = minimumFat;
  let proteinCalories = protein * 4;
  if (proteinCalories + fat * 9 > calories) {
    protein = Math.max(Math.round(weightLb * 0.6), Math.floor((calories - minimumFat * 9) / 4));
    proteinCalories = protein * 4;
  }
  const carbs = Math.max(0, Math.round((calories - proteinCalories - fat * 9) / 4));
  return { protein, carbs, fat, calories };
}

function stepToward(current: number, recommended: number, maxStep: number): number {
  const delta = recommended - current;
  if (Math.abs(delta) <= maxStep) return recommended;
  return current + Math.sign(delta) * maxStep;
}

export function buildNutritionPlan(input: {
  profile: CoachingProfile;
  goal: CoachingGoal;
  trainingDays: number;
  intake: IntakeDay[];
  weighIns: WeighIn[];
  today?: string;
  previousCalories?: number;
  previousSource?: NutritionPlan['source'];
}): NutritionPlan {
  const today = input.today || dayKey();
  const windowStart = shiftDay(today, -13);
  const formula = formulaExpenditure(input.profile, input.trainingDays);
  const trend = smoothWeight(input.weighIns);
  const trendInWindow = trend.filter((point) => point.date >= windowStart && point.date <= today);
  const intakeByDay = new Map<string, number>();
  input.intake.forEach((entry) => {
    if (entry.date < windowStart || entry.date > today) return;
    intakeByDay.set(entry.date, (intakeByDay.get(entry.date) || 0) + entry.calories);
  });
  const loggedDays = Array.from(intakeByDay.values()).filter((calories) => calories > 0);
  const averageIntake = loggedDays.length
    ? loggedDays.reduce((sum, calories) => sum + calories, 0) / loggedDays.length
    : null;

  const span = trendInWindow.length
    ? (Date.parse(`${trendInWindow[trendInWindow.length - 1].date}T12:00:00`) - Date.parse(`${trendInWindow[0].date}T12:00:00`)) / 86400000
    : 0;
  const enoughLogs = loggedDays.length >= 7 && trendInWindow.length >= 2 && span >= 7;
  let expenditure = formula;
  let source: NutritionPlan['source'] = 'profile';
  let confidence = 0.35;
  let trendLbPerWeek: number | null = null;

  if (enoughLogs && span >= 6 && averageIntake !== null) {
    const origin = Date.parse(`${trendInWindow[0].date}T12:00:00`);
    const slope = regressionPerDay(trendInWindow.map((point) => ({
      day: (Date.parse(`${point.date}T12:00:00`) - origin) / 86400000,
      value: point.trend,
    })));
    trendLbPerWeek = Math.round(slope * 7 * 100) / 100;
    const kcalPerPound = input.goal.type === 'gain' ? KCAL_PER_POUND_OF_LEAN_GAIN : KCAL_PER_POUND;
    const raw = averageIntake - slope * kcalPerPound;
    const low = formula * 0.65;
    const high = formula * 1.55;
    expenditure = Math.round(Math.min(high, Math.max(low, raw)));
    source = 'logs';
    confidence = Math.min(0.92, 0.45 + loggedDays.length / 28 + trendInWindow.length / 40);
    if (raw < low || raw > high) confidence *= 0.7;
  }

  const recommended = Math.max(input.profile.sex === 'female' ? 1200 : 1500, Math.round(expenditure + signedRate(input.goal) * 500));
  const calories = input.previousCalories
    ? stepToward(input.previousCalories, recommended, 150)
    : recommended;
  const macros = macrosFor(calories, input.profile.weight, input.goal.type);
  const rateLabel = input.goal.type === 'maintain'
    ? 'maintain weight'
    : `${input.goal.type} ${Math.abs(input.goal.rateLbPerWeek)} lb/week`;

  let note = source === 'profile'
    ? `Starting target from your stats, aimed to ${rateLabel}. Log meals and morning weight for a week and the target will follow what you actually burn.`
    : `Recent intake averaged ${Math.round(averageIntake || 0)} kcal and the weight trend is ${trendLbPerWeek && trendLbPerWeek > 0 ? '+' : ''}${trendLbPerWeek} lb/week. Expenditure is about ${expenditure} kcal, so this target is set to ${rateLabel}.`;

  if (input.previousCalories && calories !== recommended) {
    note += ` The target moved ${calories - input.previousCalories > 0 ? '+' : ''}${calories - input.previousCalories} kcal today. The rest of the adjustment waits for the next check-in.`;
  }

  return {
    ...macros,
    expenditure: Math.round(expenditure),
    source,
    confidence: Math.round(confidence * 100) / 100,
    trendLbPerWeek,
    averageIntake: averageIntake === null ? null : Math.round(averageIntake),
    note,
  };
}

export function goalEtaWeeks(currentTrend: number | null, targetWeight: number, goal: CoachingGoal): number | null {
  if (goal.type === 'maintain' || currentTrend === null) return null;
  const remaining = targetWeight - currentTrend;
  const weekly = signedRate(goal);
  if (weekly === 0 || Math.sign(remaining) !== Math.sign(weekly)) return null;
  return Math.round((remaining / weekly) * 10) / 10;
}
