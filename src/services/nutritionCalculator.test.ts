import { NutritionCalculator } from './nutritionCalculator';
import { UserProfile } from '../store';

const profile: UserProfile = {
  id: 'user_1',
  name: 'Ryan',
  age: 30,
  sex: 'male',
  height: 70,
  weight: 180,
  bodyFatPercentage: 15,
  targetPhysique: 'Athletic',
  activityLevel: 'Moderately Active',
  equipment: ['Dumbbells'],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('nutrition targets', () => {
  test('treats profile weight as pounds', () => {
    const targets = NutritionCalculator.calculateNutritionTargets(profile);
    expect(targets.calories).toBeGreaterThan(2200);
    expect(targets.calories).toBeLessThan(3400);
    expect(targets.protein).toBeGreaterThan(120);
    expect(targets.protein).toBeLessThan(220);
  });

  test('lowers calories for a weight-loss goal', () => {
    const maintenance = NutritionCalculator.calculateNutritionTargets(profile);
    const cutting = NutritionCalculator.calculateNutritionTargets({
      ...profile,
      targetPhysique: 'Weight Loss',
    });
    expect(cutting.calories).toBeLessThan(maintenance.calories);
  });

  test('uses sex instead of guessing from the name', () => {
    const female = NutritionCalculator.calculateNutritionTargets({
      ...profile,
      name: 'Alex',
      sex: 'female',
    });
    const male = NutritionCalculator.calculateNutritionTargets(profile);
    expect(female.calories).toBeLessThan(male.calories);
  });
});
