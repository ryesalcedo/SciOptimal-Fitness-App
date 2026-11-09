import React, { useState } from 'react';
import { useAppStore } from '../store';
import { buildNutritionPlan, goalEtaWeeks, smoothWeight } from '../services/coaching';
import { nextTarget, recoveryStatus, sessionForDate } from '../services/program';
import { planScore } from '../services/planScore';
import { coachLines } from '../services/coachLines';
import { dayKey } from '../utils/units';

export default function TodayView({ onFood, onTrain, onProgress }: { onFood: () => void; onTrain: () => void; onProgress: () => void }) {
  const store = useAppStore();
  const { userProfile, goal, lockedPlan, program, nutritionLog, progressHistory, workoutHistory, addProgressEntry } = store;
  const [weight, setWeight] = useState('');
  if (!userProfile || !goal || !lockedPlan || !program) return null;

  const today = dayKey();
  const meals = nutritionLog.filter((entry) => dayKey(entry.date) === today);
  const eaten = meals.reduce((sum, entry) => ({
    calories: sum.calories + entry.calories,
    protein: sum.protein + entry.protein,
    carbs: sum.carbs + entry.carbs,
    fat: sum.fat + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  const left = {
    calories: lockedPlan.calories - eaten.calories,
    protein: lockedPlan.protein - eaten.protein,
    carbs: lockedPlan.carbs - eaten.carbs,
    fat: lockedPlan.fat - eaten.fat,
  };
  const trend = smoothWeight(progressHistory.map((entry) => ({ date: dayKey(entry.date), weight: entry.weight })));
  const latestTrend = trend[trend.length - 1];
  const session = sessionForDate(program, new Date());
  const day = session.day;
  const trainedToday = workoutHistory.some((workout) => dayKey(workout.date) === today);
  const recovery = recoveryStatus(workoutHistory.map((workout) => ({
    date: new Date(workout.date).toISOString(),
    exercises: workout.exercises.map((exercise) => ({ muscle: exercise.muscle || 'other', secondary: exercise.secondary || [] })),
  })));
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekWorkouts = workoutHistory.filter((workout) => new Date(workout.date) >= weekStart);
  const loggedDays = new Set(nutritionLog.filter((entry) => new Date(entry.date) >= weekStart).map((entry) => dayKey(entry.date))).size;
  const proteinDays = countProteinDays(nutritionLog, lockedPlan.protein, weekStart);
  const plannedSets = program.days.reduce((sum, programDay) => sum + programDay.exercises.reduce((inner, exercise) => inner + exercise.sets, 0), 0);
  const score = planScore({
    goal: goal.type,
    plannedWorkouts: goal.trainingDays,
    completedWorkouts: weekWorkouts.length,
    setsThisWeek: weekWorkouts.reduce((sum, workout) => sum + workout.exercises.reduce((inner, exercise) => inner + exercise.sets.length, 0), 0),
    plannedSets,
    newPrs: 0,
    loggedDays,
    proteinHitDays: proteinDays,
    weighIns: progressHistory.filter((entry) => new Date(entry.date) >= weekStart).length,
  });
  const intakeByDay: Record<string, number> = {};
  nutritionLog.forEach((entry) => {
    const key = dayKey(entry.date);
    intakeByDay[key] = (intakeByDay[key] || 0) + entry.calories;
  });
  const preview = buildNutritionPlan({
    profile: userProfile,
    goal,
    trainingDays: goal.trainingDays,
    intake: Object.keys(intakeByDay).map((date) => ({ date, calories: intakeByDay[date] })),
    weighIns: progressHistory.map((entry) => ({ date: dayKey(entry.date), weight: entry.weight })),
    previousCalories: lockedPlan.calories,
    previousSource: lockedPlan.source,
  });
  const liftsMoved = program.days.some((programDay) => programDay.exercises.some((exercise) =>
    (exercise.nextWeight || 0) > (exercise.lastWeight || 0)
  ));
  const stall = goal.type === 'gain' && preview.source === 'logs' && (preview.trendLbPerWeek ?? 1) < 0.15 && !liftsMoved;
  const progressed = (day?.exercises || []).map((exercise) => exercise.nextWeight && exercise.lastWeight && exercise.nextWeight > exercise.lastWeight
    ? nextTarget(exercise).note
    : '').find(Boolean);
  const lines = coachLines({
    goal: goal.type,
    proteinLeft: left.protein,
    caloriesLeft: left.calories,
    trainedToday,
    lastProgressNote: progressed || undefined,
    recovery,
    scale: latestTrend?.scale,
    trend: latestTrend?.trend,
    stall,
  });
  const eta = goalEtaWeeks(latestTrend?.trend ?? userProfile.weight, goal.targetWeight, goal);

  const saveWeight = () => {
    const value = Number(weight);
    if (!value) return;
    addProgressEntry({ id: `progress_${Date.now()}`, date: new Date(), weight: value });
    setWeight('');
  };

  return (
    <div className="screen">
      <header className="top">
        <div>
          <p className="eyebrow">{goal.type} · {program.name}</p>
          <h1>{greeting()}, {userProfile.name.split(' ')[0]}</h1>
        </div>
        <div className="score-pill" aria-label={`Plan score ${score.total}`}>
          <strong>{score.total}</strong>
          <span>score</span>
        </div>
      </header>

      <section className="hero-card">
        <p className="eyebrow">Left today</p>
        <p className="hero-number">{Math.round(left.calories)}</p>
        <p className="muted">of {lockedPlan.calories} kcal · {lockedPlan.mode === 'manual' ? 'your numbers' : lockedPlan.source === 'logs' ? 'from your logs' : 'from your stats'}</p>
        <Macro name="Protein" left={left.protein} target={lockedPlan.protein} eaten={eaten.protein} />
        <Macro name="Carbs" left={left.carbs} target={lockedPlan.carbs} eaten={eaten.carbs} />
        <Macro name="Fat" left={left.fat} target={lockedPlan.fat} eaten={eaten.fat} />
        <button type="button" className="primary wide" onClick={onFood}>Log food</button>
      </section>

      <section className="card">
        <p className="eyebrow">Coach</p>
        {lines.map((line) => <p key={line}>{line}</p>)}
        <p className="muted">{score.note} Strength {score.strength} · Nutrition {score.nutrition} · Consistency {score.consistency}</p>
        {(Math.abs(preview.calories - lockedPlan.calories) >= 20 || preview.source !== lockedPlan.source) && (
          <button type="button" className="text-button" onClick={onProgress}>
            Suggested target {preview.calories} kcal. Review it.
          </button>
        )}
      </section>

      <section className="card">
        <div className="split">
          <p className="eyebrow">{session.rest ? 'Rest day' : day?.name}</p>
          <button type="button" className="text-button" onClick={onTrain}>{trainedToday ? 'Review' : 'Open'}</button>
        </div>
        {session.rest ? (
          <p>Next up · {session.next?.name}. {recovery.filter((item) => item.status === 'recovering').length} muscle groups are still recovering.</p>
        ) : (
          <ul className="plain">
            {day?.exercises.slice(0, 4).map((exercise) => (
              <li key={exercise.id}>
                <span>{exercise.name}</span>
                <strong>{exercise.nextWeight ? `${exercise.nextWeight} × ${exercise.nextReps}` : `${exercise.sets} × ${exercise.repLow}–${exercise.repHigh}`}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <p className="eyebrow">Trend weight</p>
        <p className="stat">{latestTrend ? latestTrend.trend : userProfile.weight}<span> lb</span></p>
        <p className="muted">
          Scale {latestTrend ? latestTrend.scale : userProfile.weight} lb
          {eta ? ` · about ${eta} weeks to ${goal.targetWeight}` : ''}
        </p>
        <div className="inline-form">
          <label className="sr" htmlFor="weigh-in">Morning weight</label>
          <input id="weigh-in" inputMode="decimal" placeholder="Morning weight" value={weight} onChange={(event) => setWeight(event.target.value)} />
          <button type="button" className="primary" onClick={saveWeight}>Save</button>
        </div>
      </section>
    </div>
  );
}

function Macro({ name, left, target, eaten }: { name: string; left: number; target: number; eaten: number }) {
  const width = Math.max(0, Math.min(100, target ? (eaten / target) * 100 : 0));
  return (
    <div className="macro">
      <div className="split"><span>{name}</span><span>{Math.round(eaten)}/{target}g</span></div>
      <div className="bar"><span style={{ width: `${width}%` }} /></div>
      <p className="muted">{Math.round(left)}g left</p>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function countProteinDays(log: { date: Date; protein: number }[], target: number, since: Date) {
  const byDay = new Map<string, number>();
  log.forEach((entry) => {
    if (new Date(entry.date) < since) return;
    const key = dayKey(entry.date);
    byDay.set(key, (byDay.get(key) || 0) + entry.protein);
  });
  return Array.from(byDay.values()).filter((protein) => protein >= target * 0.9).length;
}
