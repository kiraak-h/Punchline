import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN_LEVELS } from './levels';
import {
  calculateMedal,
  createDefaultSaveState,
  DAILY_CHALLENGE_LAUNCH_DATE,
  formatTime,
  generateShareText,
  getDailyChallengeLevel,
  getEffectiveDailyStreak,
  getUtcDaysDifference,
  isCompatibleSwap,
  isDailyCompletedForDate,
  isValidUtcDateString,
  LEGACY_STORAGE_KEY_V1,
  loadSavedGameState,
  LOCAL_STORAGE_KEY,
  recordCampaignCompletion,
  recordDailyCompletion,
  resetSavedGameState,
  SAVE_SCHEMA_VERSION,
  saveGameState,
  validateAndMigrateSaveState,
  validatePatch,
} from './logic';
import { PatchAction, SceneObject } from './types';

test('All 10 campaign levels validate intended solutions and reject null patches', () => {
  assert.equal(CAMPAIGN_LEVELS.length, 10, 'Must have 10 handcrafted campaign levels');

  for (const level of CAMPAIGN_LEVELS) {
    const validResult = validatePatch(level, level.intendedSolution);
    assert.equal(
      validResult.success,
      true,
      `Level ${level.id} (${level.title}) intendedSolution must pass validatePatch`
    );
    assert.equal(validResult.resultText, level.successPunchline.text);

    const nullResult = validatePatch(level, null);
    assert.equal(nullResult.success, false, `Level ${level.id} must reject null patch`);
    assert.equal(nullResult.resultText, level.failurePunchline.text);
  }
});

test('Individual level validation for all 10 campaign levels (Levels 1-10)', () => {
  // Level 1: Coffee Clearance (RESIZE mug -> SMALL)
  const l1 = CAMPAIGN_LEVELS[0];
  assert.equal(validatePatch(l1, { type: 'RESIZE', targetId: 'mug', size: 'SMALL' }).success, true);
  assert.equal(validatePatch(l1, { type: 'RESIZE', targetId: 'mug', size: 'LARGE' }).success, false);
  assert.equal(validatePatch(l1, { type: 'RESIZE', targetId: 'robot', size: 'SMALL' }).success, false);
  assert.equal(validatePatch(l1, { type: 'FREEZE', targetId: 'mug' }).success, false);

  // Level 2: Pigeon Protocol (FREEZE pigeon)
  const l2 = CAMPAIGN_LEVELS[1];
  assert.equal(validatePatch(l2, { type: 'FREEZE', targetId: 'pigeon' }).success, true);
  assert.equal(validatePatch(l2, { type: 'FREEZE', targetId: 'ceo' }).success, false);
  assert.equal(validatePatch(l2, { type: 'RESIZE', targetId: 'pigeon', size: 'SMALL' }).success, false);

  // Level 3: Wrong Way Wi-Fi (SWAP sign_active <-> sign_spare)
  const l3 = CAMPAIGN_LEVELS[2];
  assert.equal(
    validatePatch(l3, { type: 'SWAP', targetAId: 'sign_active', targetBId: 'sign_spare' }).success,
    true
  );
  assert.equal(
    validatePatch(l3, { type: 'SWAP', targetAId: 'sign_spare', targetBId: 'sign_active' }).success,
    true
  );
  assert.equal(
    validatePatch(l3, { type: 'SWAP', targetAId: 'sign_active', targetBId: 'robot' }).success,
    false
  );

  // Level 4: The Last Copy (FREEZE fan)
  const l4 = CAMPAIGN_LEVELS[3];
  assert.equal(validatePatch(l4, { type: 'FREEZE', targetId: 'fan' }).success, true);
  assert.equal(validatePatch(l4, { type: 'FREEZE', targetId: 'contract' }).success, false);
  assert.equal(validatePatch(l4, { type: 'FREEZE', targetId: 'shredder' }).success, false);

  // Level 5: Two Under One Umbrella (RESIZE umbrella -> LARGE)
  const l5 = CAMPAIGN_LEVELS[4];
  assert.equal(validatePatch(l5, { type: 'RESIZE', targetId: 'umbrella', size: 'LARGE' }).success, true);
  assert.equal(validatePatch(l5, { type: 'RESIZE', targetId: 'umbrella', size: 'SMALL' }).success, false);
  assert.equal(validatePatch(l5, { type: 'RESIZE', targetId: 'taxi', size: 'LARGE' }).success, false);

  // Level 6: Parcel Identity Crisis (SWAP parcel_cactus <-> parcel_pizza)
  const l6 = CAMPAIGN_LEVELS[5];
  assert.equal(
    validatePatch(l6, { type: 'SWAP', targetAId: 'parcel_cactus', targetBId: 'parcel_pizza' }).success,
    true
  );
  assert.equal(
    validatePatch(l6, { type: 'SWAP', targetAId: 'parcel_pizza', targetBId: 'parcel_cactus' }).success,
    true
  );
  assert.equal(
    validatePatch(l6, { type: 'SWAP', targetAId: 'parcel_cactus', targetBId: 'cafe_dest' }).success,
    false
  );

  // Level 7: Cart Before Horse (FREEZE cart)
  const l7 = CAMPAIGN_LEVELS[6];
  assert.equal(validatePatch(l7, { type: 'FREEZE', targetId: 'cart' }).success, true);
  assert.equal(validatePatch(l7, { type: 'FREEZE', targetId: 'cake' }).success, false);

  // Level 8: Catwalk Emergency (RESIZE stool -> LARGE)
  const l8 = CAMPAIGN_LEVELS[7];
  assert.equal(validatePatch(l8, { type: 'RESIZE', targetId: 'stool', size: 'LARGE' }).success, true);
  assert.equal(validatePatch(l8, { type: 'RESIZE', targetId: 'stool', size: 'SMALL' }).success, false);
  assert.equal(validatePatch(l8, { type: 'RESIZE', targetId: 'cat', size: 'LARGE' }).success, false);

  // Level 9: Boardroom Musical Chairs (SWAP chair_raccoon <-> chair_pigeon)
  const l9 = CAMPAIGN_LEVELS[8];
  assert.equal(
    validatePatch(l9, { type: 'SWAP', targetAId: 'chair_raccoon', targetBId: 'chair_pigeon' }).success,
    true
  );
  assert.equal(
    validatePatch(l9, { type: 'SWAP', targetAId: 'chair_pigeon', targetBId: 'chair_raccoon' }).success,
    true
  );
  assert.equal(
    validatePatch(l9, { type: 'SWAP', targetAId: 'chair_raccoon', targetBId: 'raccoon' }).success,
    false
  );

  // Level 10: The Red-Carpet Incident (SWAP tile_banana <-> tile_carpet)
  const l10 = CAMPAIGN_LEVELS[9];
  assert.equal(
    validatePatch(l10, { type: 'SWAP', targetAId: 'tile_banana', targetBId: 'tile_carpet' }).success,
    true
  );
  assert.equal(
    validatePatch(l10, { type: 'SWAP', targetAId: 'tile_carpet', targetBId: 'tile_banana' }).success,
    true
  );
  assert.equal(
    validatePatch(l10, { type: 'SWAP', targetAId: 'tile_banana', targetBId: 'podium' }).success,
    false
  );
});

test('Invalid target selection and capability validation', () => {
  const l1 = CAMPAIGN_LEVELS[0]; // RESIZE level
  // Non-existent target ID
  const nonExistent = validatePatch(l1, { type: 'RESIZE', targetId: 'ghost_id', size: 'SMALL' });
  assert.equal(nonExistent.success, false);
  assert.match(nonExistent.reason, /Invalid resize target/i);

  // Object exists in scene but does not have canResize: true
  const nonResizable = validatePatch(l1, { type: 'RESIZE', targetId: 'ceo', size: 'SMALL' });
  assert.equal(nonResizable.success, false);
  assert.match(nonResizable.reason, /Invalid resize target/i);

  // Invalid resize option at runtime
  const invalidSize = validatePatch(l1, {
    type: 'RESIZE',
    targetId: 'mug',
    size: 'GIGANTIC' as unknown as 'SMALL',
  });
  assert.equal(invalidSize.success, false);
  assert.match(invalidSize.reason, /Invalid resize scale/i);

  // Ineligible tool for level
  const ineligibleTool = validatePatch(l1, { type: 'SWAP', targetAId: 'mug', targetBId: 'ceo' });
  assert.equal(ineligibleTool.success, false);
  assert.match(ineligibleTool.reason, /not eligible/i);
});

test('Swap compatibility rules enforce group matching and prevent self or incompatible swaps', () => {
  const signA: SceneObject = {
    id: 's1',
    name: 'Sign 1',
    role: 'r',
    canSwap: true,
    swapGroup: 'signs',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    visualType: 'sign',
  };
  const signB: SceneObject = {
    id: 's2',
    name: 'Sign 2',
    role: 'r',
    canSwap: true,
    swapGroup: 'signs',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    visualType: 'sign',
  };
  const parcel: SceneObject = {
    id: 'p1',
    name: 'Parcel',
    role: 'r',
    canSwap: true,
    swapGroup: 'parcels',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    visualType: 'box',
  };
  const staticObj: SceneObject = {
    id: 'st',
    name: 'Static',
    role: 'r',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    visualType: 'wall',
  };

  assert.equal(isCompatibleSwap(signA, signB), true, 'Same swapGroup can swap');
  assert.equal(isCompatibleSwap(signA, signA), false, 'Self-swap is rejected');
  assert.equal(isCompatibleSwap(signA, parcel), false, 'Mismatched swapGroup is rejected');
  assert.equal(isCompatibleSwap(signA, staticObj), false, 'Object without canSwap is rejected');

  // Verify validatePatch rejects self-swap on a SWAP level
  const l3 = CAMPAIGN_LEVELS[2];
  const selfSwap = validatePatch(l3, {
    type: 'SWAP',
    targetAId: 'sign_active',
    targetBId: 'sign_active',
  });
  assert.equal(selfSwap.success, false);
  assert.match(selfSwap.reason, /Invalid swap pair/i);
});

test('Medal rating calculation follows GDD 9.2', () => {
  assert.equal(calculateMedal(1, 0), 'gold', 'First attempt without hints = Gold');
  assert.equal(calculateMedal(1, 1), 'gold', 'First attempt with Stage 1 Direction hint = Gold');
  assert.equal(calculateMedal(1, 2), 'gold', 'First attempt with Stage 2 Target hint = Gold');
  assert.equal(calculateMedal(2, 0), 'silver', 'Second attempt without solution hint = Silver');
  assert.equal(calculateMedal(5, 2), 'silver', 'Multiple retries with Stage 2 hint = Silver');
  assert.equal(calculateMedal(1, 3), 'bronze', 'First attempt with Stage 3 Solution hint = Bronze');
  assert.equal(calculateMedal(4, 3), 'bronze', 'Multiple retries with Stage 3 Solution hint = Bronze');
});

test('Daily Challenge numbering is consecutive by UTC date and deterministic', () => {
  assert.equal(isValidUtcDateString('2026-01-01'), true);
  assert.equal(isValidUtcDateString('2026-02-29'), false, '2026 is not a leap year');
  assert.equal(isValidUtcDateString('not-a-date'), false);

  // Launch date is Day #1
  const launchDay = getDailyChallengeLevel(DAILY_CHALLENGE_LAUNCH_DATE);
  assert.equal(launchDay.dayNumber, 1);
  assert.equal(launchDay.level.id, 1);

  // Consecutive UTC dates produce strictly consecutive day numbers
  const d1 = getDailyChallengeLevel('2026-11-01');
  const d2 = getDailyChallengeLevel('2026-11-02');
  const d3 = getDailyChallengeLevel('2026-11-03');

  assert.equal(d2.dayNumber, d1.dayNumber + 1, 'Nov 2 must be exactly 1 day after Nov 1');
  assert.equal(d3.dayNumber, d2.dayNumber + 1, 'Nov 3 must be exactly 1 day after Nov 2');

  // Same UTC date always produces the exact same level and dayNumber
  const d2Repeat = getDailyChallengeLevel('2026-11-02');
  assert.equal(d2.dayNumber, d2Repeat.dayNumber);
  assert.equal(d2.level.id, d2Repeat.level.id);
  assert.equal(d2.level.title, d2Repeat.level.title);

  // Cycling across 10 consecutive UTC days visits all 10 campaign levels
  const seenLevelIds = new Set<number>();
  for (let i = 1; i <= 10; i++) {
    const dateStr = `2026-01-${i.toString().padStart(2, '0')}`;
    const info = getDailyChallengeLevel(dateStr);
    assert.equal(info.dayNumber, i);
    seenLevelIds.add(info.level.id);
  }
  assert.equal(seenLevelIds.size, 10, '10 consecutive UTC days cycle through all 10 levels');
});

test('Daily streak progression: first solve, same-day replay, consecutive day, and missed day', () => {
  let state = createDefaultSaveState();
  assert.equal(getEffectiveDailyStreak(state, '2026-11-01'), 0);

  // Day 1 completion
  state = recordDailyCompletion(state, '2026-11-01', 5, 'silver', 25, 2);
  assert.equal(state.dailyStreak, 1);
  assert.equal(state.lastDailyDate, '2026-11-01');
  assert.equal(isDailyCompletedForDate(state, '2026-11-01'), true);
  assert.equal(getEffectiveDailyStreak(state, '2026-11-01'), 1);
  assert.equal(state.dailyCompletions['2026-11-01'].medal, 'silver');

  // Replaying on the same UTC date (2026-11-01) must NOT increment streak again,
  // but should upgrade medal if better
  state = recordDailyCompletion(state, '2026-11-01', 5, 'gold', 15, 1);
  assert.equal(state.dailyStreak, 1, 'Same-day replay must not increment streak');
  assert.equal(state.dailyCompletions['2026-11-01'].medal, 'gold', 'Medal upgraded to gold');
  assert.equal(state.dailyCompletions['2026-11-01'].timeSec, 15, 'Best time updated');

  // Completing on consecutive UTC day (2026-11-02) increments streak to 2
  assert.equal(
    getEffectiveDailyStreak(state, '2026-11-02'),
    1,
    'Before solving today, yesterday streak is still active'
  );
  state = recordDailyCompletion(state, '2026-11-02', 6, 'gold', 18, 1);
  assert.equal(state.dailyStreak, 2, 'Consecutive UTC day increments streak to 2');
  assert.equal(state.lastDailyDate, '2026-11-02');

  // Completing on 2026-11-03 increments streak to 3
  state = recordDailyCompletion(state, '2026-11-03', 7, 'bronze', 40, 3);
  assert.equal(state.dailyStreak, 3);

  // Missing 2026-11-04 and checking effective streak on 2026-11-05
  assert.equal(
    getEffectiveDailyStreak(state, '2026-11-05'),
    0,
    'Effective streak drops to 0 when a UTC day is missed'
  );

  // Completing on 2026-11-05 after missing 2026-11-04 resets streak to 1
  state = recordDailyCompletion(state, '2026-11-05', 9, 'gold', 20, 1);
  assert.equal(state.dailyStreak, 1, 'Streak resets to 1 after missed day');
  assert.equal(state.lastDailyDate, '2026-11-05');
});

test('Campaign progress and Daily Challenge progress are strictly isolated', () => {
  let state = createDefaultSaveState();

  // Complete Campaign Levels 1 and 2
  state = recordCampaignCompletion(state, 1, 'gold', 12, 1);
  state = recordCampaignCompletion(state, 2, 'silver', 24, 2);

  // Campaign completion must NEVER increment dailyStreak or set lastDailyDate
  assert.equal(state.dailyStreak, 0, 'Campaign completion must not increment dailyStreak');
  assert.equal(state.lastDailyDate, null, 'Campaign completion must not set lastDailyDate');
  assert.deepEqual(state.dailyCompletions, {}, 'Campaign completion must not add dailyCompletions');
  assert.equal(state.highestUnlockedLevel, 3);
  assert.equal(state.completedLevels[1].medal, 'gold');
  assert.equal(state.completedLevels[2].medal, 'silver');

  // Now complete a Daily Challenge that happens to use Level 2 (with Bronze medal)
  // and another Daily Challenge that uses Level 5 (not yet completed in campaign)
  state = recordDailyCompletion(state, '2026-01-02', 2, 'bronze', 50, 4);
  state = recordDailyCompletion(state, '2026-01-05', 5, 'gold', 15, 1);

  // Daily Challenge completion must NOT overwrite campaign medals or unlock campaign levels
  assert.equal(
    state.completedLevels[2].medal,
    'silver',
    'Daily completion must not overwrite campaign Level 2 medal'
  );
  assert.equal(
    state.completedLevels[5],
    undefined,
    'Daily completion of Level 5 must not mark campaign Level 5 completed'
  );
  assert.equal(
    state.highestUnlockedLevel,
    3,
    'Daily completion must not change campaign highestUnlockedLevel'
  );
  assert.equal(state.dailyCompletions['2026-01-02'].medal, 'bronze');
  assert.equal(state.dailyCompletions['2026-01-05'].medal, 'gold');
});

test('Save-data migration, runtime validation, corruption recovery, and reset-progress', () => {
  // 1. Corrupt / non-object inputs recover safely to default state
  assert.deepEqual(validateAndMigrateSaveState(null), createDefaultSaveState());
  assert.deepEqual(validateAndMigrateSaveState('corrupted-string'), createDefaultSaveState());
  assert.deepEqual(validateAndMigrateSaveState([1, 2, 3]), createDefaultSaveState());

  // 2. Migrate legacy v1 save data to v2 schema
  const legacyV1Save = {
    completedLevels: {
      1: { medal: 'gold', timeSec: 14, attempts: 1 },
      2: { medal: 'silver', timeSec: 28, attempts: 2 },
      999: { medal: 'gold', timeSec: 10, attempts: 1 }, // Out-of-bounds level ID should be stripped
      3: { medal: 'invalid_medal', timeSec: -5, attempts: 0 }, // Invalid medal should be stripped
    },
    highestUnlockedLevel: 3,
    dailyStreak: 2,
    lastDailyDate: '2026-11-01',
  };

  const migrated = validateAndMigrateSaveState(legacyV1Save);
  assert.equal(migrated.version, SAVE_SCHEMA_VERSION);
  assert.equal(migrated.completedLevels[1]?.medal, 'gold');
  assert.equal(migrated.completedLevels[2]?.medal, 'silver');
  assert.equal(migrated.completedLevels[999], undefined, 'Out-of-range level ID stripped');
  assert.equal(migrated.completedLevels[3], undefined, 'Invalid medal record stripped');
  assert.equal(migrated.highestUnlockedLevel, 3);
  assert.equal(migrated.dailyStreak, 2);
  assert.equal(migrated.lastDailyDate, '2026-11-01');
  assert.ok(
    migrated.dailyCompletions['2026-11-01'],
    'Migrated v1 daily completion synthesized for lastDailyDate'
  );

  // 3. Test localStorage integration (migration from v1 key, corruption recovery, and reset)
  const store: Record<string, string> = {};
  const mockStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };

  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: mockStorage },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true,
  });

  // Write legacy v1 data into LEGACY_STORAGE_KEY_V1
  store[LEGACY_STORAGE_KEY_V1] = JSON.stringify(legacyV1Save);
  const loadedFromV1 = loadSavedGameState();
  assert.equal(loadedFromV1.version, SAVE_SCHEMA_VERSION);
  assert.equal(loadedFromV1.completedLevels[1]?.medal, 'gold');
  assert.ok(store[LOCAL_STORAGE_KEY], 'Migrated v1 save persisted to v2 key');

  // Write corrupted JSON into LOCAL_STORAGE_KEY
  store[LOCAL_STORAGE_KEY] = '{bad_json:::';
  const recovered = loadSavedGameState();
  assert.deepEqual(recovered, createDefaultSaveState(), 'Corrupted JSON recovers to default state');

  // Save valid progress and test resetSavedGameState()
  const progressed = recordCampaignCompletion(recovered, 1, 'gold', 10, 1);
  saveGameState(progressed);
  assert.equal(loadSavedGameState().highestUnlockedLevel, 2);

  const afterReset = resetSavedGameState();
  assert.deepEqual(afterReset, createDefaultSaveState());
  assert.deepEqual(loadSavedGameState(), createDefaultSaveState());
  assert.equal(store[LEGACY_STORAGE_KEY_V1], undefined);
});

test('Utility formatting and share text generation', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(25), '00:25');
  assert.equal(formatTime(85), '01:25');
  assert.equal(getUtcDaysDifference('2026-01-01', '2026-01-11'), 10);

  const campaignShare = generateShareText(CAMPAIGN_LEVELS[0], 'gold', 15, 1, 'campaign');
  assert.match(campaignShare, /LEVEL #1: COFFEE CLEARANCE/);
  assert.match(campaignShare, /GOLD/);

  const dailyShare = generateShareText(CAMPAIGN_LEVELS[0], 'silver', 22, 2, 'daily', 42);
  assert.match(dailyShare, /DAILY CHALLENGE #042/);
  assert.match(dailyShare, /SILVER/);
});
