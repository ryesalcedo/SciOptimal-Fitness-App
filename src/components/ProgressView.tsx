import React, { useState } from 'react';
import { CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppStore } from '../store';
import { buildNutritionPlan, goalEtaWeeks, smoothWeight } from '../services/coaching';
import { estimatedOneRepMax } from '../services/program';
import { dayKey } from '../utils/units';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

export default function ProgressView() {
  const store = useAppStore();
  const { userProfile, goal, lockedPlan, nutritionLog, progressHistory, workoutHistory, setLockedPlan, logout } = store;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ calories: '', protein: '', carbs: '', fat: '' });
  if (!userProfile || !goal || !lockedPlan) return null;

  const weighIns = progressHistory.map((entry) => ({ date: dayKey(entry.date), weight: entry.weight }));
  const trend = smoothWeight(weighIns);
  const intake = Object.values(nutritionLog.reduce<Record<string, number>>((days, entry) => {
    const key = dayKey(entry.date);
    days[key] = (days[key] || 0) + entry.calories;
    return days;
  }, {})).length
    ? Object.entries(nutritionLog.reduce<Record<string, number>>((days, entry) => {
      const key = dayKey(entry.date);
      days[key] = (days[key] || 0) + entry.calories;
      return days;
    }, {})).map(([date, calories]) => ({ date, calories }))
    : [];
  const preview = buildNutritionPlan({
    profile: userProfile,
    goal,
    trainingDays: goal.trainingDays,
    intake,
    weighIns,
    previousCalories: lockedPlan.calories,
    previousSource: lockedPlan.source,
  });
  const latest = trend[trend.length - 1];
  const eta = goalEtaWeeks(latest?.trend ?? userProfile.weight, goal.targetWeight, goal);
  const projection = Math.round(((latest?.trend ?? userProfile.weight) + (goal.type === 'lose' ? -goal.rateLbPerWeek : goal.type === 'gain' ? goal.rateLbPerWeek : 0) * 4) * 10) / 10;
  const changed = Math.abs(preview.calories - lockedPlan.calories) >= 20 || preview.source !== lockedPlan.source;
  const records = personalRecords(workoutHistory);

  const accept = () => {
    setLockedPlan({ ...preview, mode: 'coached', updatedAt: new Date().toISOString() });
  };
  const saveManual = () => {
    const calories = Number(draft.calories) || lockedPlan.calories;
    const protein = Number(draft.protein) || lockedPlan.protein;
    const carbs = Number(draft.carbs) || lockedPlan.carbs;
    const fat = Number(draft.fat) || lockedPlan.fat;
    setLockedPlan({
      ...lockedPlan,
      calories,
      protein,
      carbs,
      fat,
      mode: 'manual',
      note: 'You set these numbers. The suggestion below stays available when you want the coach back.',
      updatedAt: new Date().toISOString(),
    });
    setEditing(false);
  };

  return (
    <div className="screen">
      <header className="top">
        <div>
          <p className="eyebrow">Weight trend</p>
          <h1>{latest ? latest.trend : userProfile.weight} lb</h1>
        </div>
        <p className="muted">Scale {latest ? `${latest.scale} lb` : '—'}{preview.trendLbPerWeek !== null ? ` · ${preview.trendLbPerWeek > 0 ? '+' : ''}${preview.trendLbPerWeek} lb/week` : ''}</p>
      </header>

      {trend.length > 0 && (
        <div className="card chart-card">
          <Line
            data={{
              labels: trend.map((point) => point.date.slice(5)),
              datasets: [
                { label: 'Scale', data: trend.map((point) => point.scale), borderColor: '#8e8e93', pointRadius: 2, tension: 0.2 },
                { label: 'Trend', data: trend.map((point) => point.trend), borderColor: '#d6ff4a', pointRadius: 0, tension: 0.35, fill: false },
              ],
            }}
            options={{
              plugins: { legend: { labels: { color: '#f5f5f4' } } },
              scales: {
                x: { ticks: { color: '#8e8e93', maxTicksLimit: 6 }, grid: { color: 'transparent' } },
                y: { ticks: { color: '#8e8e93' }, grid: { color: 'rgba(255,255,255,0.06)' } },
              },
            }}
          />
        </div>
      )}

      <section className="card">
        <p className="eyebrow">Expenditure {preview.source === 'logs' ? 'from your logs' : 'from your stats'}</p>
        <p className="stat">{preview.expenditure}<span> kcal</span></p>
        <p>{preview.note}</p>
        <p className="muted">Current target {lockedPlan.calories} kcal{changed ? ` · suggested ${preview.calories}` : ''}. In four weeks, about {projection} lb{eta ? ` · ${eta} weeks to goal` : ''}.</p>
        {changed && <button type="button" className="primary wide" onClick={accept}>Use suggested target</button>}
      </section>

      <section className="card">
        <div className="split">
          <p className="eyebrow">Targets · {lockedPlan.mode}</p>
          <button type="button" className="text-button" onClick={() => {
            setDraft({ calories: String(lockedPlan.calories), protein: String(lockedPlan.protein), carbs: String(lockedPlan.carbs), fat: String(lockedPlan.fat) });
            setEditing((open) => !open);
          }}>{editing ? 'Close' : 'Edit'}</button>
        </div>
        {editing ? (
          <div className="stack">
            <div className="grid-3">
              <label>Kcal<input value={draft.calories} onChange={(event) => setDraft({ ...draft, calories: event.target.value })} /></label>
              <label>Protein<input value={draft.protein} onChange={(event) => setDraft({ ...draft, protein: event.target.value })} /></label>
              <label>Carbs<input value={draft.carbs} onChange={(event) => setDraft({ ...draft, carbs: event.target.value })} /></label>
            </div>
            <label>Fat<input value={draft.fat} onChange={(event) => setDraft({ ...draft, fat: event.target.value })} /></label>
            <button type="button" className="primary" onClick={saveManual}>Save my numbers</button>
          </div>
        ) : (
          <p>{lockedPlan.calories} kcal · {lockedPlan.protein}P · {lockedPlan.carbs}C · {lockedPlan.fat}F</p>
        )}
      </section>

      <section className="card">
        <p className="eyebrow">Lift records</p>
        {records.length === 0 && <p className="muted">Finish a workout and the best set of each lift shows up here.</p>}
        <ul className="plain">
          {records.slice(0, 6).map((record) => (
            <li key={record.name}><span>{record.name}</span><strong>{record.weight} × {record.reps}</strong></li>
          ))}
        </ul>
      </section>

      <button type="button" className="ghost wide" onClick={logout}>Log out</button>
    </div>
  );
}

function personalRecords(workouts: { exercises: { name: string; sets: { weight: number; reps: number }[] }[] }[]) {
  const best = new Map<string, { name: string; weight: number; reps: number; score: number }>();
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        const score = estimatedOneRepMax(set.weight, set.reps);
        const current = best.get(exercise.name);
        if (!current || score > current.score) best.set(exercise.name, { name: exercise.name, weight: set.weight, reps: set.reps, score });
      });
    });
  });
  return Array.from(best.values()).sort((a, b) => b.score - a.score);
}
