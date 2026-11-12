import React, { useMemo, useState } from 'react';
import { CatalogFood, FOODS, parseMealText, searchFoods } from '../data/foods';
import { useAppStore } from '../store';
import { dayKey, shiftDay } from '../utils/units';

type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function FoodLogView() {
  const { nutritionLog, customFoods, lockedPlan, addNutritionEntry, deleteNutritionEntry, addCustomFood } = useAppStore();
  const [day, setDay] = useState(dayKey());
  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState<Meal>(mealForNow());
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const catalog = useMemo(() => [...customFoods.map((food) => ({ ...food })), ...FOODS], [customFoods]);
  const results = searchFoods(catalog, query);
  const entries = nutritionLog.filter((entry) => dayKey(entry.date) === day);
  const eaten = entries.reduce((sum, entry) => sum + entry.calories, 0);

  const addFood = (food: CatalogFood, servings = 1) => {
    addNutritionEntry({
      id: `food_${Date.now()}_${food.id}`,
      date: new Date(`${day}T${clockFor(meal)}`),
      food: servings === 1 ? food.name : `${servings} × ${food.name}`,
      calories: Math.round(food.calories * servings),
      protein: Math.round(food.protein * servings * 10) / 10,
      carbs: Math.round(food.carbs * servings * 10) / 10,
      fat: Math.round(food.fat * servings * 10) / 10,
      meal,
      servings,
    });
    setQuery('');
  };

  const logDescription = () => {
    const parsed = parseMealText(query, catalog);
    if (parsed.length === 0) return;
    parsed.forEach((item, index) => {
      addNutritionEntry({
        id: `food_${Date.now()}_${index}`,
        date: new Date(`${day}T${clockFor(meal)}`),
        food: item.servings === 1 ? item.food.name : `${item.servings} × ${item.food.name}`,
        calories: Math.round(item.food.calories * item.servings),
        protein: Math.round(item.food.protein * item.servings * 10) / 10,
        carbs: Math.round(item.food.carbs * item.servings * 10) / 10,
        fat: Math.round(item.food.fat * item.servings * 10) / 10,
        meal,
        servings: item.servings,
      });
    });
    setQuery('');
  };

  const copyYesterday = () => {
    const previous = nutritionLog.filter((entry) => dayKey(entry.date) === shiftDay(day, -1));
    previous.forEach((entry, index) => {
      addNutritionEntry({ ...entry, id: `copy_${Date.now()}_${index}`, date: new Date(`${day}T12:00:00`) });
    });
  };

  const saveCustom = () => {
    if (!custom.name || !Number(custom.calories)) return;
    const food = {
      id: `custom_${Date.now()}`,
      name: custom.name.trim(),
      serving: '1 serving',
      calories: Number(custom.calories),
      protein: Number(custom.protein) || 0,
      carbs: Number(custom.carbs) || 0,
      fat: Number(custom.fat) || 0,
    };
    addCustomFood(food);
    addFood(food);
    setCustom({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setCustomOpen(false);
  };

  return (
    <div className="screen">
      <header className="top">
        <button type="button" className="ghost" onClick={() => setDay(shiftDay(day, -1))}>Prev</button>
        <div>
          <p className="eyebrow">{day === dayKey() ? 'Today' : day}</p>
          <h1>{Math.round((lockedPlan?.calories || 0) - eaten)} left</h1>
        </div>
        <button type="button" className="ghost" onClick={() => setDay(shiftDay(day, 1))} disabled={day >= dayKey()}>Next</button>
      </header>

      <div className="choice-row">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as Meal[]).map((item) => (
          <button key={item} type="button" className={meal === item ? 'choice on' : 'choice'} onClick={() => setMeal(item)}>{item}</button>
        ))}
      </div>

      <label className="search">
        Describe or search
        <input
          value={query}
          placeholder="2 eggs and oatmeal"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') logDescription(); }}
        />
      </label>
      <div className="footer-actions">
        <button type="button" className="primary" onClick={logDescription}>Log text</button>
        <button type="button" className="ghost" onClick={copyYesterday}>Copy yesterday</button>
      </div>

      {query && (
        <ul className="plain card">
          {results.map((food) => (
            <li key={food.id}>
              <button type="button" className="food-hit" onClick={() => addFood(food)}>
                <span>{food.name}<small>{food.serving}</small></span>
                <strong>{food.calories}</strong>
              </button>
            </li>
          ))}
          {results.length === 0 && <li>No match. Add it as a custom food.</li>}
        </ul>
      )}

      {(['breakfast', 'lunch', 'dinner', 'snack'] as Meal[]).map((item) => {
        const group = entries.filter((entry) => (entry.meal || 'snack') === item);
        if (group.length === 0) return null;
        const calories = group.reduce((sum, entry) => sum + entry.calories, 0);
        return (
          <section key={item} className="card">
            <div className="split"><p className="eyebrow">{item}</p><span>{Math.round(calories)} kcal</span></div>
            <ul className="plain">
              {group.map((entry) => (
                <li key={entry.id}>
                  <span>{entry.food}<small>{Math.round(entry.protein)}P · {Math.round(entry.carbs)}C · {Math.round(entry.fat)}F</small></span>
                  <button type="button" className="text-button" onClick={() => deleteNutritionEntry(entry.id)}>Remove</button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <button type="button" className="ghost wide" onClick={() => setCustomOpen((open) => !open)}>
        {customOpen ? 'Close custom food' : 'Custom food'}
      </button>
      {customOpen && (
        <div className="stack card">
          <label>Name<input value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} /></label>
          <div className="grid-3">
            <label>Kcal<input inputMode="decimal" value={custom.calories} onChange={(event) => setCustom({ ...custom, calories: event.target.value })} /></label>
            <label>Protein<input inputMode="decimal" value={custom.protein} onChange={(event) => setCustom({ ...custom, protein: event.target.value })} /></label>
            <label>Carbs<input inputMode="decimal" value={custom.carbs} onChange={(event) => setCustom({ ...custom, carbs: event.target.value })} /></label>
          </div>
          <label>Fat<input inputMode="decimal" value={custom.fat} onChange={(event) => setCustom({ ...custom, fat: event.target.value })} /></label>
          <button type="button" className="primary" onClick={saveCustom}>Save and log</button>
        </div>
      )}
    </div>
  );
}

function mealForNow(): Meal {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

function clockFor(meal: Meal) {
  return { breakfast: '08:00:00', lunch: '12:30:00', dinner: '18:30:00', snack: '21:00:00' }[meal];
}
