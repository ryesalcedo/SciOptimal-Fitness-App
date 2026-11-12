import { webcrypto } from 'crypto';
import { TextEncoder } from 'util';
import {
  authenticateAccount,
  emptySavedUserData,
  loadUserData,
  registerAccount,
  saveUserData,
} from './accounts';

beforeAll(() => {
  Object.defineProperty(global, 'TextEncoder', { value: TextEncoder });
  Object.defineProperty(global, 'crypto', { value: webcrypto });
});

describe('local accounts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('registers and signs in with the same password', async () => {
    const created = await registerAccount('Ryan', 'Ryan@Example.com', 'secret1');
    const signedIn = await authenticateAccount('ryan@example.com', 'secret1');
    expect(signedIn.id).toBe(created.id);
    expect(signedIn.email).toBe('ryan@example.com');
    expect(signedIn.passwordHash).not.toBe('secret1');
  });

  test('rejects a duplicate email and a wrong password', async () => {
    await registerAccount('Ryan', 'ryan@example.com', 'secret1');
    await expect(registerAccount('Other', 'ryan@example.com', 'secret1')).rejects.toThrow(/already exists/);
    await expect(authenticateAccount('ryan@example.com', 'nope')).rejects.toThrow(/Incorrect password/);
    await expect(authenticateAccount('missing@example.com', 'secret1')).rejects.toThrow(/No account/);
  });

  test('keeps each account\'s saved training data separate', async () => {
    const ryan = await registerAccount('Ryan', 'ryan@example.com', 'secret1');
    const alex = await registerAccount('Alex', 'alex@example.com', 'secret1');

    saveUserData(ryan.id, {
      ...emptySavedUserData(),
      workoutHistory: [{ id: 'w1', name: 'Squat day' }],
    });
    saveUserData(alex.id, {
      ...emptySavedUserData(),
      nutritionLog: [{ id: 'n1', food: 'Eggs' }],
    });

    expect(loadUserData(ryan.id).workoutHistory).toHaveLength(1);
    expect(loadUserData(ryan.id).nutritionLog).toHaveLength(0);
    expect(loadUserData(alex.id).nutritionLog).toHaveLength(1);
    expect(loadUserData('missing').userProfile).toBeNull();
  });
});
