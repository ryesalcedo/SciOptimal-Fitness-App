import { looksLikeWater } from './planScore';
import { MuscleStatus } from './program';

export function coachLines(input: {
  goal: 'lose' | 'maintain' | 'gain';
  proteinLeft: number;
  caloriesLeft: number;
  trainedToday: boolean;
  lastProgressNote?: string;
  recovery: MuscleStatus[];
  scale?: number;
  trend?: number;
  stall: boolean;
}): string[] {
  const lines: string[] = [];
  if (input.scale && input.trend && looksLikeWater(input.scale, input.trend)) {
    const direction = input.scale > input.trend ? 'up' : 'down';
    lines.push(`The scale jumped ${direction} from the trend. That looks like water, so the plan stays put.`);
  }
  if (input.lastProgressNote) lines.push(input.lastProgressNote);
  const resting = input.recovery.filter((muscle) => muscle.status === 'recovering' && muscle.role === 'primary').slice(0, 2);
  if (resting.length) {
    lines.push(`${resting.map((muscle) => muscle.muscle).join(' and ')} still need about ${resting[0].hoursLeft} hours. Train something else or take the rest.`);
  }
  if (input.trainedToday && input.proteinLeft > 20) {
    lines.push(`Protein is ${Math.round(input.proteinLeft)}g short after training. A high-protein meal tonight closes today's target.`);
  } else if (input.caloriesLeft < 0) {
    lines.push(`You are ${Math.abs(Math.round(input.caloriesLeft))} kcal over the target. Nothing is broken. Tomorrow's log is a fresh start.`);
  } else if (input.proteinLeft > 30) {
    lines.push(`${Math.round(input.proteinLeft)}g of protein left. That is the number that matters most for this goal.`);
  }
  if (input.stall && input.goal === 'gain') {
    lines.push('Weight trend is flat and the lifts have not moved. A small calorie increase is the next lever.');
  }
  if (lines.length === 0) {
    lines.push(input.goal === 'lose'
      ? 'Log the meal and the morning weight. The target only moves from that pair, not from one noisy scale reading.'
      : 'Log the work and the food. The next target shows up as soon as a set tops out the rep range.');
  }
  return lines.slice(0, 3);
}
