import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN_LEVELS } from './levels';
import { validatePatch, isCompatibleSwap, calculateMedal, getDailyChallengeLevel, formatTime } from './logic';
import { PatchAction } from './types';

test('Level definitions validation: all 10 campaign levels have valid intended solutions', () => {
  assert.equal(CAMPAIGN_LEVELS.length, 10, 'Must have exactly 10 initial handcrafted levels');

  for (const level of CAMPAIGN_LEVELS) {
    const check = validatePatch(level, level.intendedSolution);
    assert.equal(check.success, true, `Level ${level.id} (${level.title}) intended solution must succeed`);
    assert.ok(check.resultText.length > 0, `Level ${level.id} must have victory text`);
  }
});

test('Level 1 Coffee Clearance: requires RESIZE SMALL on mug, rejects LARGE or wrong tools', () => {
  const level1 = CAMPAIGN_LEVELS[0];

  // Intended
  assert.equal(validatePatch(level1, { type: 'RESIZE', targetId: 'mug', size: 'SMALL' }).success, true);

  // Large should fail
  const largeCheck = validatePatch(level1, { type: 'RESIZE', targetId: 'mug', size: 'LARGE' });
  assert.equal(largeCheck.success, false);

  // Freeze should fail
  const freezeCheck = validatePatch(level1, { type: 'FREEZE', targetId: 'mug' });
  assert.equal(freezeCheck.success, false);

  // Null patch should fail
  assert.equal(validatePatch(level1, null).success, false);
});

test('Level 2 Pigeon Protocol: requires FREEZE on pigeon', () => {
  const level2 = CAMPAIGN_LEVELS[1];
  assert.equal(validatePatch(level2, { type: 'FREEZE', targetId: 'pigeon' }).success, true);
  assert.equal(validatePatch(level2, { type: 'FREEZE', targetId: 'ceo' }).success, false);
});

test('Level 3 Wrong Way Wi-Fi: requires SWAP between sign_active and sign_spare (order-independent)', () => {
  const level3 = CAMPAIGN_LEVELS[2];

  // Order 1
  assert.equal(validatePatch(level3, { type: 'SWAP', targetAId: 'sign_active', targetBId: 'sign_spare' }).success, true);
  // Order 2
  assert.equal(validatePatch(level3, { type: 'SWAP', targetAId: 'sign_spare', targetBId: 'sign_active' }).success, true);
  // Invalid pair
  assert.equal(validatePatch(level3, { type: 'SWAP', targetAId: 'sign_active', targetBId: 'robot' }).success, false);
});

test('Level 5 Two Under One Umbrella: requires RESIZE LARGE on umbrella', () => {
  const level5 = CAMPAIGN_LEVELS[4];
  assert.equal(validatePatch(level5, { type: 'RESIZE', targetId: 'umbrella', size: 'LARGE' }).success, true);
  assert.equal(validatePatch(level5, { type: 'RESIZE', targetId: 'umbrella', size: 'SMALL' }).success, false);
});

test('Swap compatibility rule enforcement', () => {
  const signA = { id: 's1', name: 'Sign 1', role: 'r', canSwap: true, swapGroup: 'signs', x: 0, y: 0, width: 10, height: 10, visualType: 'sign' };
  const signB = { id: 's2', name: 'Sign 2', role: 'r', canSwap: true, swapGroup: 'signs', x: 0, y: 0, width: 10, height: 10, visualType: 'sign' };
  const parcel = { id: 'p1', name: 'Parcel', role: 'r', canSwap: true, swapGroup: 'parcels', x: 0, y: 0, width: 10, height: 10, visualType: 'box' };
  const staticObj = { id: 'st', name: 'Static', role: 'r', x: 0, y: 0, width: 10, height: 10, visualType: 'wall' };

  assert.equal(isCompatibleSwap(signA, signB), true, 'Same group objects can swap');
  assert.equal(isCompatibleSwap(signA, signA), false, 'Cannot swap object with itself');
  assert.equal(isCompatibleSwap(signA, parcel), false, 'Different swapGroup cannot swap');
  assert.equal(isCompatibleSwap(signA, staticObj), false, 'Object without canSwap cannot swap');
});

test('Medal rating calculation follows GDD 9.2', () => {
  assert.equal(calculateMedal(1, 0), 'gold', 'First attempt without hint = Gold');
  assert.equal(calculateMedal(1, 1), 'gold', 'First attempt with Direction hint only = Gold');
  assert.equal(calculateMedal(1, 2), 'gold', 'First attempt with Object hint only = Gold');
  assert.equal(calculateMedal(2, 0), 'silver', 'Second attempt without solution hint = Silver');
  assert.equal(calculateMedal(4, 1), 'silver', 'Multiple retries without solution hint = Silver');
  assert.equal(calculateMedal(1, 3), 'bronze', 'Using solution hint (stage 3) = Bronze');
  assert.equal(calculateMedal(3, 3), 'bronze', 'Retries with solution hint = Bronze');
});

test('Daily Challenge generation is deterministic', () => {
  const d1 = getDailyChallengeLevel('2026-11-02');
  const d2 = getDailyChallengeLevel('2026-11-02');
  assert.equal(d1.level.id, d2.level.id);
  assert.equal(d1.dayNumber, d2.dayNumber);
  assert.ok(d1.level.id >= 1 && d1.level.id <= 10);
});

test('formatTime outputs mm:ss format', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(25), '00:25');
  assert.equal(formatTime(85), '01:25');
});
