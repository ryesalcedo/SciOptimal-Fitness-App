import React, { useEffect, useState } from 'react';
import { useAppStore } from './store';
import Onboarding from './components/Onboarding';
import TodayView from './components/TodayView';
import FoodLogView from './components/FoodLogView';
import TrainView from './components/TrainView';
import ProgressView from './components/ProgressView';
import './App.css';

type Tab = 'today' | 'food' | 'train' | 'progress';

function Welcome() {
  const { login, register, authLoading, authError } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');
  const [homeNote, setHomeNote] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (body && body.service === 'scioptimal-home') {
          setHomeNote(`This PC keeps ${body.accounts} of ${body.maxAccounts} accounts.`);
        }
      })
      .catch(() => undefined);
  }, []);

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');
    if (mode === 'register') {
      if (!form.name.trim()) {
        setLocalError('Name is required');
        return;
      }
      if (form.password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      if (form.password !== form.confirm) {
        setLocalError('Passwords do not match');
        return;
      }
      await register(form.name, form.email, form.password);
      return;
    }
    await login(form.email, form.password);
  };

  return (
    <main className="phone">
      <p className="eyebrow">SciOptimal</p>
      <h1>Know the workout, the meal, and the rest day.</h1>
      <p className="lede">
        Log lifts and food in one place. Targets start from your body, then follow your weight trend. When a set tops out, the next session moves up.
      </p>
      {homeNote && <p className="muted">{homeNote}</p>}
      <form className="stack" onSubmit={submit}>
        <div className="choice-row">
          <button type="button" className={mode === 'login' ? 'choice on' : 'choice'} onClick={() => setMode('login')}>Log in</button>
          <button type="button" className={mode === 'register' ? 'choice on' : 'choice'} onClick={() => setMode('register')}>Sign up</button>
        </div>
        {mode === 'register' && (
          <label>Name
            <input name="name" autoComplete="name" value={form.name} onChange={update('name')} />
          </label>
        )}
        <label>Email
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} required />
        </label>
        <label>Password
          <input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={update('password')} required />
        </label>
        {mode === 'register' && (
          <label>Confirm password
            <input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirm} onChange={update('confirm')} />
          </label>
        )}
        {(localError || authError) && <p className="error">{localError || authError}</p>}
        <button className="primary" type="submit" disabled={authLoading}>
          {authLoading ? 'Working…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
    </main>
  );
}

function App() {
  const { isAuthenticated, userProfile, goal, program } = useAppStore();
  const [tab, setTab] = useState<Tab>('today');

  if (!isAuthenticated) return <Welcome />;

  if (!userProfile || !goal || !program) return <Onboarding />;

  return (
    <div className="phone">
      {tab === 'today' && <TodayView onFood={() => setTab('food')} onTrain={() => setTab('train')} onProgress={() => setTab('progress')} />}
      {tab === 'food' && <FoodLogView />}
      {tab === 'train' && <TrainView />}
      {tab === 'progress' && <ProgressView />}
      <nav className="tabbar">
        {(['today', 'food', 'train', 'progress'] as Tab[]).map((item) => (
          <button key={item} type="button" className={tab === item ? 'on' : ''} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
