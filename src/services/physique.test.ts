import { readPhysique } from './physique';

const male = { sex: 'male' as const, weight: 185, experience: 'intermediate' as const };

describe('physique goals', () => {
  test('reads a cut to a named weight with a muscle to bring up', () => {
    const read = readPhysique('shredded at 170 with bigger shoulders', male);
    expect(read.understood).toBe(true);
    expect(read.goal).toBe('lose');
    expect(read.targetWeight).toBe(170);
    expect(read.emphasis).toContain('shoulders');
    expect(read.rateLbPerWeek).toBeGreaterThanOrEqual(0.5);
  });

  test('reads a slow lean bulk and puts extra work on the arms', () => {
    const read = readPhysique('lean bulk, slow, bring up my arms', { ...male, weight: 180 });
    expect(read.goal).toBe('gain');
    expect(read.emphasis).toEqual(expect.arrayContaining(['biceps', 'triceps']));
    const plain = readPhysique('I want to bulk', { ...male, weight: 180 });
    expect(read.rateLbPerWeek).toBeLessThan(plain.rateLbPerWeek);
  });

  test('holds weight on a recomp and asks for more detail when the sentence is empty', () => {
    const recomp = readPhysique('recomp and stay the same weight', male);
    expect(recomp.goal).toBe('maintain');
    expect(recomp.targetWeight).toBe(185);
    const blank = readPhysique('hello', male);
    expect(blank.understood).toBe(false);
  });
});
