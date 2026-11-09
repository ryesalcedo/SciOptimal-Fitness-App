import { GoalType, suggestedRate } from './coaching';

export interface PhysiqueBody {
  sex: 'male' | 'female';
  weight: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
}

export interface PhysiqueRead {
  text: string;
  goal: GoalType;
  rateLbPerWeek: number;
  targetWeight: number;
  emphasis: string[];
  summary: string;
  understood: boolean;
}

const MUSCLE_WORDS: Array<{ muscle: string; pattern: RegExp }> = [
  { muscle: 'shoulders', pattern: /shoulders?|delts?/i },
  { muscle: 'chest', pattern: /\b(chest|pecs?)\b/i },
  { muscle: 'back', pattern: /\b(back|lats?)\b/i },
  { muscle: 'biceps', pattern: /\b(arms?|biceps?)\b/i },
  { muscle: 'triceps', pattern: /\b(arms?|triceps?)\b/i },
  { muscle: 'quads', pattern: /\b(legs?|quads?|thighs?)\b/i },
  { muscle: 'hamstrings', pattern: /\b(legs?|hamstrings?|thighs?)\b/i },
  { muscle: 'glutes', pattern: /\b(glutes?|butt|booty)\b/i },
  { muscle: 'core', pattern: /\b(abs?|core|six[- ]?pack)\b/i },
];

function roundRate(value: number): number {
  return Math.min(1.5, Math.max(0.25, Math.round(value * 4) / 4));
}

function targetWeightFrom(text: string, current: number): number | null {
  const found: number[] = [];
  const pattern = /(\d{2,3}(?:\.\d+)?)(?:\s*(?:lb|lbs|pounds))?/gi;
  let match = pattern.exec(text);
  while (match) {
    const value = Number(match[1]);
    const hasUnit = /lb|pound/i.test(match[0]);
    if (value >= 80 && value <= 450 && (hasUnit || value >= 100)) found.push(value);
    match = pattern.exec(text);
  }
  const different = found.filter((value) => Math.abs(value - current) >= 1);
  return (different[different.length - 1] ?? found[found.length - 1] ?? null);
}

function emphasisFrom(text: string): string[] {
  const muscles: string[] = [];
  MUSCLE_WORDS.forEach((entry) => {
    if (entry.pattern.test(text) && !muscles.includes(entry.muscle)) muscles.push(entry.muscle);
  });
  return muscles;
}

export function readPhysique(text: string, body: PhysiqueBody): PhysiqueRead {
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();
  const namedWeight = targetWeightFrom(cleaned, body.weight);
  const emphasis = emphasisFrom(cleaned);
  const leanBulk = /lean bulk|slow bulk/.test(lower);
  const wantsLose = /shred|cut\b|lean out|lose|losing|fat|slim|visible abs|get lean|drop/.test(lower);
  const wantsGain = /bulk|size|mass|bigger|grow|hypertrophy|muscular|add muscle/.test(lower);
  const wantsMaintain = /recomp|maintain|stay the same|keep (my )?weight|hold (my )?weight/.test(lower);
  const slow = /slow|patient|gradual|lean bulk/.test(lower);
  const aggressive = /aggressive|fast|quick|shredded/.test(lower);

  let goal: GoalType | null = null;
  if (leanBulk) goal = 'gain';
  else if (wantsMaintain && !wantsLose && !wantsGain) goal = 'maintain';
  else if (wantsLose && !wantsGain) goal = 'lose';
  else if (wantsGain && !wantsLose) goal = 'gain';
  else if (namedWeight !== null && namedWeight <= body.weight - 2) goal = 'lose';
  else if (namedWeight !== null && namedWeight >= body.weight + 2) goal = 'gain';
  else if (wantsLose && wantsGain) goal = namedWeight !== null && namedWeight > body.weight ? 'gain' : 'lose';
  else if (emphasis.length > 0) goal = 'maintain';

  const understood = Boolean(cleaned) && goal !== null;
  const resolved: GoalType = goal || 'maintain';
  let rate = suggestedRate({
    weightLb: body.weight,
    sex: body.sex,
    experience: body.experience,
    goal: resolved,
  });
  if (resolved !== 'maintain' && slow) rate = roundRate(rate - 0.25);
  if (resolved === 'lose' && aggressive) rate = roundRate(rate + 0.25);
  const targetWeight = namedWeight ?? (
    resolved === 'gain' ? body.weight + 8 : resolved === 'lose' ? Math.max(body.weight - 10, 100) : body.weight
  );

  if (!understood) {
    return {
      text: cleaned,
      goal: 'maintain',
      rateLbPerWeek: 0,
      targetWeight: body.weight,
      emphasis: [],
      understood: false,
      summary: 'Name the look, a target weight, or the muscles to bring up. For example: shredded at 170 with bigger shoulders.',
    };
  }

  const pace = resolved === 'maintain'
    ? 'Hold your weight'
    : `${resolved === 'lose' ? 'Lose' : 'Gain'} about ${rate} lb a week`;
  const destination = `toward ${targetWeight} lb`;
  const focus = emphasis.length ? ` Extra work for ${emphasis.join(', ')}.` : '';
  return {
    text: cleaned,
    goal: resolved,
    rateLbPerWeek: resolved === 'maintain' ? 0 : rate,
    targetWeight,
    emphasis,
    understood: true,
    summary: `${pace} ${destination}.${focus}`.replace(/\s+\./g, '.'),
  };
}
