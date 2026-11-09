import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { deloadWeek, nextTarget, prescribedSets, recoveryStatus, sessionForDate } from '../services/program';
import { estimatedOneRepMax } from '../services/program';
import { isPersonalRecord } from '../services/planScore';

export default function TrainView() {
  const { program, workoutHistory, activeSession, startSession, logSessionSet, finishSession, swapExercise, rebuildProgram } = useAppStore();
  const [rest, setRest] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, { weight: string; reps: string; rir: number }>>({});
  useEffect(() => {
    if (rest <= 0) return undefined;
    const timer = window.setInterval(() => setRest((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [rest]);

  if (!program) return null;
  const deload = deloadWeek(program.startedAt);
  const today = sessionForDate(program, new Date());
  const day = activeSession
    ? program.days.find((item) => item.id === activeSession.dayId) || today.day
    : today.day || today.next;
  if (!day) return <div className="screen"><h1>No session yet</h1></div>;

  const recovery = recoveryStatus(workoutHistory.map((workout) => ({
    date: new Date(workout.date).toISOString(),
    exercises: workout.exercises.map((exercise) => ({ muscle: exercise.muscle || 'other', secondary: exercise.secondary || [] })),
  })));

  const historyFor = (name: string) => workoutHistory.flatMap((workout) => workout.exercises)
    .filter((exercise) => exercise.name === name)
    .flatMap((exercise) => exercise.sets);

  const logSet = (exerciseId: string, dropset = false) => {
    const exercise = day.exercises.find((item) => item.id === exerciseId);
    if (!exercise) return;
    const draft = drafts[exerciseId] || {
      weight: String(exercise.nextWeight || exercise.lastWeight || ''),
      reps: String(exercise.nextReps || exercise.repLow),
      rir: 2,
    };
    const weight = dropset ? Math.round((Number(draft.weight) || 0) * 0.7) : Number(draft.weight) || 0;
    const reps = Number(draft.reps) || exercise.repLow;
    logSessionSet({
      exerciseId,
      name: exercise.name,
      muscle: exercise.muscle,
      secondary: exercise.secondary,
      weight,
      reps,
      rir: draft.rir,
      dropset,
    });
    setRest(exercise.restSec);
  };

  return (
    <div className="screen">
      <header className="top">
        <div>
          <p className="eyebrow">{deload ? 'Deload week' : today.rest && !activeSession ? 'Rest day' : 'Training'}</p>
          <h1>{day.name}</h1>
        </div>
        {activeSession ? (
          <button type="button" className="primary" onClick={finishSession} disabled={activeSession.sets.length === 0}>End</button>
        ) : (
          <button type="button" className="primary" onClick={() => startSession(day.id)}>Start</button>
        )}
      </header>

      {!program.startedAt && (
        <button type="button" className="primary wide" onClick={rebuildProgram}>Update to the growth plan</button>
      )}
      {deload && <p className="card">Volume is lighter this week so the next block can start fresh. Keep the weight, stop two reps early.</p>}
      {program.volumeNote && !deload && <p className="card">{program.volumeNote}</p>}
      {rest > 0 && <p className="rest">Rest {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, '0')} <button type="button" className="text-button" onClick={() => setRest(0)}>Skip</button></p>}

      {day.exercises.map((exercise) => {
        const logged = activeSession?.sets.filter((set) => set.exerciseId === exercise.id) || [];
        const target = nextTarget(exercise, logged.filter((set) => !set.dropset).slice(-1)[0], { deload });
        const sets = prescribedSets(exercise.sets, deload);
        const draft = drafts[exercise.id] || {
          weight: String(target.weight || ''),
          reps: String(target.reps || exercise.repLow),
          rir: 2,
        };
        const prior = historyFor(exercise.name);
        const best = prior.reduce((max, set) => Math.max(max, estimatedOneRepMax(set.weight, set.reps)), 0);
        return (
          <section key={exercise.id} className="card">
            <div className="split">
              <div>
                <h2>{exercise.name}</h2>
                <p className="muted">{sets} sets · {exercise.repLow}–{exercise.repHigh} reps · {restLabel(exercise.restSec)} · {best ? `best e1RM ${best}` : 'no history yet'}</p>
              </div>
              <button type="button" className="text-button" onClick={() => swapExercise(day.id, exercise.id)}>Swap</button>
            </div>
            <p>{target.note}</p>
            <ul className="plain">
              {logged.map((set, index) => {
                const record = isPersonalRecord(set.weight, set.reps, prior);
                return (
                  <li key={set.id}>
                    <span>{index + 1}{set.dropset ? ' drop' : ''}</span>
                    <strong>{set.weight} lb × {set.reps} · {set.rir} RIR {record ? '· PR' : ''}</strong>
                  </li>
                );
              })}
            </ul>
            {activeSession && (
              <div className="set-grid">
                <label>lb<input inputMode="decimal" value={draft.weight} onChange={(event) => setDrafts({ ...drafts, [exercise.id]: { ...draft, weight: event.target.value } })} /></label>
                <label>reps<input inputMode="numeric" value={draft.reps} onChange={(event) => setDrafts({ ...drafts, [exercise.id]: { ...draft, reps: event.target.value } })} /></label>
                <label>RIR<input inputMode="numeric" value={draft.rir} onChange={(event) => setDrafts({ ...drafts, [exercise.id]: { ...draft, rir: Number(event.target.value) } })} /></label>
                <button type="button" className="primary" onClick={() => logSet(exercise.id)}>Log set</button>
                <button type="button" className="ghost" onClick={() => logSet(exercise.id, true)}>Dropset</button>
              </div>
            )}
          </section>
        );
      })}

      <section className="card">
        <p className="eyebrow">Recovery</p>
        <div className="chips">
          {recovery.length === 0 && <span className="muted">Nothing is fatigued yet.</span>}
          {recovery.map((muscle) => (
            <span key={muscle.muscle} className={muscle.status === 'ready' ? 'chip on' : 'chip'}>
              {muscle.muscle} · {muscle.status === 'ready' ? 'ready' : `${muscle.hoursLeft}h`}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function restLabel(seconds: number): string {
  if (seconds % 60 === 0) return `${seconds / 60} min rest`;
  if (seconds > 60) return `${Math.round((seconds / 60) * 10) / 10} min rest`;
  return `${seconds}s rest`;
}
