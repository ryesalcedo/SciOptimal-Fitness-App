import React, { useState } from 'react';
import { suggestedGainRate } from '../services/coaching';
import { OnboardingInput, useAppStore } from '../store';

const EQUIPMENT = ['Barbell', 'Dumbbells', 'Bench', 'Pull-up Bar', 'Cables', 'Machines', 'Kettlebells', 'Bands'];

export default function Onboarding() {
  const { user, completeOnboarding, logout } = useAppStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [form, setForm] = useState<OnboardingInput>({
    name: user?.name || '',
    sex: 'male',
    age: 30,
    height: 70,
    weight: 180,
    goalType: 'lose',
    rateLbPerWeek: 0.5,
    targetWeight: 170,
    trainingDays: 4,
    sessionMinutes: 60,
    experience: 'intermediate',
    equipment: ['Dumbbells', 'Bench'],
  });

  const toggleGear = (item: string) => {
    setForm((current) => ({
      ...current,
      equipment: current.equipment.includes(item)
        ? current.equipment.filter((gear) => gear !== item)
        : [...current.equipment, item],
    }));
  };

  const next = () => {
    if (step === 0) {
      if (!form.name.trim()) return setError('Add your name.');
      if (form.age < 16 || form.age > 80) return setError('Age needs to be between 16 and 80.');
      if (form.height < 48 || form.height > 84) return setError('Height needs to be between 48 and 84 inches.');
      if (form.weight < 80 || form.weight > 450) return setError('Weight needs to be between 80 and 450 pounds.');
    }
    if (step === 1 && form.goalType !== 'maintain' && (form.rateLbPerWeek < 0.25 || form.rateLbPerWeek > 1.5)) {
      return setError('Pick a weekly rate between 0.25 and 1.5 lb.');
    }
    setError('');
    if (step < 2) setStep(step + 1);
    else completeOnboarding(form);
  };

  return (
    <main className="phone onboarding">
      <p className="eyebrow">SciOptimal · step {step + 1} of 3</p>
      <h1>{step === 0 ? 'Your body' : step === 1 ? 'The goal' : 'How you train'}</h1>
      <p className="lede">
        {step === 0 && 'Calories start from these numbers, then follow your food log and weight trend.'}
        {step === 1 && 'Lose, maintain, or gain. The rate sets the surplus or deficit. One weigh-in will not move it.'}
        {step === 2 && 'The routine uses your days, session length, and the equipment you actually have. 75 minutes fits the full growth dose, about 10–16 hard sets per muscle each week.'}
      </p>

      {step === 0 && (
        <div className="stack">
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <div className="choice-row">
            {(['male', 'female'] as const).map((sex) => (
              <button key={sex} type="button" className={form.sex === sex ? 'choice on' : 'choice'} onClick={() => setForm({ ...form, sex })}>
                {sex === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
          <div className="grid-3">
            <label>Age<input type="number" value={form.age} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} /></label>
            <label>Height, in<input type="number" value={form.height} onChange={(event) => setForm({ ...form, height: Number(event.target.value) })} /></label>
            <label>Weight, lb<input type="number" value={form.weight} onChange={(event) => setForm({ ...form, weight: Number(event.target.value) })} /></label>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="stack">
          <div className="choice-row">
            {(['lose', 'maintain', 'gain'] as const).map((goalType) => (
              <button key={goalType} type="button" className={form.goalType === goalType ? 'choice on' : 'choice'} onClick={() => setForm({
                ...form,
                goalType,
                rateLbPerWeek: goalType === 'gain' ? suggestedGainRate(form.weight, form.experience) : goalType === 'lose' ? 0.5 : 0,
                sessionMinutes: goalType === 'gain' ? 75 : 60,
                targetWeight: goalType === 'gain' ? form.weight + 8 : goalType === 'lose' ? Math.max(form.weight - 10, 100) : form.weight,
              })}>
                {goalType}
              </button>
            ))}
          </div>
          {form.goalType !== 'maintain' && (
            <label>
              Pounds per week
              <input type="number" step="0.25" value={form.rateLbPerWeek} onChange={(event) => setForm({ ...form, rateLbPerWeek: Number(event.target.value) })} />
            </label>
          )}
          <label>
            Target weight, lb
            <input type="number" value={form.targetWeight} onChange={(event) => setForm({ ...form, targetWeight: Number(event.target.value) })} />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="stack">
          <div className="choice-row">
            {[3, 4, 5, 6].map((days) => (
              <button key={days} type="button" className={form.trainingDays === days ? 'choice on' : 'choice'} onClick={() => setForm({ ...form, trainingDays: days })}>
                {days} days
              </button>
            ))}
          </div>
          <div className="choice-row">
            {[45, 60, 75].map((minutes) => (
              <button key={minutes} type="button" className={form.sessionMinutes === minutes ? 'choice on' : 'choice'} onClick={() => setForm({ ...form, sessionMinutes: minutes })}>
                {minutes} min
              </button>
            ))}
          </div>
          <div className="choice-row">
            {(['beginner', 'intermediate', 'advanced'] as const).map((experience) => (
              <button key={experience} type="button" className={form.experience === experience ? 'choice on' : 'choice'} onClick={() => setForm({
                ...form,
                experience,
                rateLbPerWeek: form.goalType === 'gain' ? suggestedGainRate(form.weight, experience) : form.rateLbPerWeek,
              })}>
                {experience}
              </button>
            ))}
          </div>
          <div className="chips">
            {EQUIPMENT.map((item) => (
              <button key={item} type="button" className={form.equipment.includes(item) ? 'chip on' : 'chip'} onClick={() => toggleGear(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      <div className="footer-actions">
        {step > 0 ? <button type="button" className="ghost" onClick={() => setStep(step - 1)}>Back</button> : <button type="button" className="ghost" onClick={logout}>Log out</button>}
        <button type="button" className="primary" onClick={next}>{step === 2 ? 'Build my plan' : 'Continue'}</button>
      </div>
    </main>
  );
}
