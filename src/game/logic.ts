import {
  DailyCompletionRecord,
  GameMode,
  LevelCompletionRecord,
  LevelDefinition,
  MedalType,
  PatchAction,
  SceneObject,
} from './types';
import { CAMPAIGN_LEVELS } from './levels';

export const DAILY_CHALLENGE_LAUNCH_DATE = '2026-01-01';
export const SAVE_SCHEMA_VERSION = 2;
export const LOCAL_STORAGE_KEY = 'project_punchline_save_v2';
export const LEGACY_STORAGE_KEY_V1 = 'project_punchline_save_v1';

const MS_PER_UTC_DAY = 86_400_000;

const MEDAL_RANK: Record<MedalType, number> = {
  gold: 3,
  silver: 2,
  bronze: 1,
};

/**
 * Checks whether two objects are eligible to swap with each other.
 * Rules from GDD 2.1:
 * - Only compatible, highlighted objects can be swapped.
 * - Both objects must have canSwap=true and share the same swapGroup.
 */
export function isCompatibleSwap(objA: SceneObject, objB: SceneObject): boolean {
  if (!objA || !objB) return false;
  if (objA.id === objB.id) return false;
  if (!objA.canSwap || !objB.canSwap) return false;
  if (!objA.swapGroup || !objB.swapGroup) return false;
  return objA.swapGroup === objB.swapGroup;
}

/**
 * Authoritative validation function for a patch action against a level's rules and intended solution.
 * Used by both the live simulation in CartoonStage.tsx and unit/browser tests.
 *
 * Validates:
 * 1. Non-null patch.
 * 2. Tool eligibility for the level.
 * 3. Target object existence and capability flags (canResize, canFreeze, canSwap + swapGroup compatibility).
 * 4. Resize option validity ('SMALL' | 'LARGE').
 * 5. Match with the level's deterministic intendedSolution.
 */
export function validatePatch(
  level: LevelDefinition,
  patch: PatchAction | null
): { success: boolean; reason: string; resultText: string } {
  if (!patch) {
    return {
      success: false,
      reason: 'No reality patch applied. The unpatched cartoon disaster unfolded as scripted!',
      resultText: level.failurePunchline.text,
    };
  }

  if (!level.eligibleTools.includes(patch.type)) {
    return {
      success: false,
      reason: `Tool ${patch.type} is not eligible for this level.`,
      resultText: level.failurePunchline.text,
    };
  }

  // Validate target existence and object capabilities before checking intendedSolution
  if (patch.type === 'RESIZE') {
    const targetObj = level.objects.find((o) => o.id === patch.targetId);
    if (!targetObj || !targetObj.canResize) {
      return {
        success: false,
        reason: 'Invalid resize target: object does not exist or cannot be resized.',
        resultText: level.failurePunchline.text,
      };
    }
    if (patch.size !== 'SMALL' && patch.size !== 'LARGE') {
      return {
        success: false,
        reason: 'Invalid resize scale option.',
        resultText: level.failurePunchline.text,
      };
    }
  } else if (patch.type === 'FREEZE') {
    const targetObj = level.objects.find((o) => o.id === patch.targetId);
    if (!targetObj || !targetObj.canFreeze) {
      return {
        success: false,
        reason: 'Invalid freeze target: object does not exist or cannot be frozen.',
        resultText: level.failurePunchline.text,
      };
    }
  } else if (patch.type === 'SWAP') {
    const objA = level.objects.find((o) => o.id === patch.targetAId);
    const objB = level.objects.find((o) => o.id === patch.targetBId);
    if (!objA || !objB || !isCompatibleSwap(objA, objB)) {
      return {
        success: false,
        reason: 'Invalid swap pair: objects do not exist or are not compatible swap targets.',
        resultText: level.failurePunchline.text,
      };
    }
  } else {
    return {
      success: false,
      reason: 'Unknown patch tool type.',
      resultText: level.failurePunchline.text,
    };
  }

  const sol = level.intendedSolution;

  if (patch.type !== sol.type) {
    return {
      success: false,
      reason: `Used ${patch.type}, but this situation requires a different reality alteration!`,
      resultText: level.failurePunchline.text,
    };
  }

  if (patch.type === 'RESIZE' && sol.type === 'RESIZE') {
    if (patch.targetId !== sol.targetId) {
      return {
        success: false,
        reason: 'Resized the wrong object in the scene.',
        resultText: level.failurePunchline.text,
      };
    }
    if (patch.size !== sol.size) {
      return {
        success: false,
        reason: `Changed size to ${patch.size}, but ${sol.size} was needed for correct clearance or coverage!`,
        resultText: level.failurePunchline.text,
      };
    }
    return {
      success: true,
      reason: 'Optimal size applied! Clearance and physics resolved cleanly.',
      resultText: level.successPunchline.text,
    };
  }

  if (patch.type === 'FREEZE' && sol.type === 'FREEZE') {
    if (patch.targetId !== sol.targetId) {
      return {
        success: false,
        reason: 'Frozen target was not the source of the hazard.',
        resultText: level.failurePunchline.text,
      };
    }
    return {
      success: true,
      reason: 'Hazardous momentum halted in time!',
      resultText: level.successPunchline.text,
    };
  }

  if (patch.type === 'SWAP' && sol.type === 'SWAP') {
    const matched =
      (patch.targetAId === sol.targetAId && patch.targetBId === sol.targetBId) ||
      (patch.targetAId === sol.targetBId && patch.targetBId === sol.targetAId);

    if (!matched) {
      return {
        success: false,
        reason: 'Swapped objects did not route to the correct destinations.',
        resultText: level.failurePunchline.text,
      };
    }
    return {
      success: true,
      reason: 'Positions exchanged successfully! Identities preserved.',
      resultText: level.successPunchline.text,
    };
  }

  return {
    success: false,
    reason: 'Unexpected patch outcome.',
    resultText: level.failurePunchline.text,
  };
}

/**
 * Calculates medal based on GDD Part 9.2:
 * - Gold: Solved on first attempt without using the solution hint (hint stage 3).
 * - Silver: Solved after retrying (attempts > 1) without solution hint.
 * - Bronze: Solved after using the full solution hint (hint stage 3).
 */
export function calculateMedal(attempts: number, maxHintStageViewed: number): MedalType {
  if (maxHintStageViewed >= 3) {
    return 'bronze';
  }
  if (attempts <= 1) {
    return 'gold';
  }
  return 'silver';
}

/**
 * Strictly validates a YYYY-MM-DD calendar date in UTC.
 */
export function isValidUtcDateString(dateStr: unknown): dateStr is string {
  if (typeof dateStr !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const utcMs = Date.UTC(year, month - 1, day);
  if (Number.isNaN(utcMs)) return false;
  const checkDate = new Date(utcMs);
  return (
    checkDate.getUTCFullYear() === year &&
    checkDate.getUTCMonth() === month - 1 &&
    checkDate.getUTCDate() === day
  );
}

/**
 * Parses a valid YYYY-MM-DD string into UTC midnight timestamp in milliseconds.
 * Guaranteed independent of host local timezone.
 */
export function parseUtcDateMs(dateStr: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid UTC date string: ${dateStr}`);
  }
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * Returns the current UTC calendar date formatted as YYYY-MM-DD.
 */
export function getCurrentUtcDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Computes exact integer UTC calendar days between two YYYY-MM-DD strings (toDate - fromDate).
 */
export function getUtcDaysDifference(fromDateStr: string, toDateStr: string): number {
  const fromMs = parseUtcDateMs(fromDateStr);
  const toMs = parseUtcDateMs(toDateStr);
  return Math.round((toMs - fromMs) / MS_PER_UTC_DAY);
}

/**
 * Returns a deterministic daily challenge level and consecutive UTC day number
 * anchored to DAILY_CHALLENGE_LAUNCH_DATE ('2026-01-01' = Day #1).
 *
 * Ensures:
 * - Same UTC date always produces the same puzzle and dayNumber.
 * - Consecutive UTC dates always produce consecutive dayNumbers (N, N+1, N+2...).
 * - Local timezone offsets never affect the calculation.
 */
export function getDailyChallengeLevel(dateStr: string): {
  level: LevelDefinition;
  dayNumber: number;
  dateStr: string;
} {
  const normalizedDate = isValidUtcDateString(dateStr) ? dateStr : DAILY_CHALLENGE_LAUNCH_DATE;
  const daysSinceLaunch = getUtcDaysDifference(DAILY_CHALLENGE_LAUNCH_DATE, normalizedDate);
  const dayNumber = Math.max(1, daysSinceLaunch + 1);
  const index =
    (((dayNumber - 1) % CAMPAIGN_LEVELS.length) + CAMPAIGN_LEVELS.length) %
    CAMPAIGN_LEVELS.length;
  const baseLevel = CAMPAIGN_LEVELS[index];

  return {
    level: {
      ...baseLevel,
      title: `[Daily #${dayNumber}] ${baseLevel.title}`,
      chapter: 'Daily Challenge',
    },
    dayNumber,
    dateStr: normalizedDate,
  };
}

/**
 * Formats seconds into MM:SS
 */
export function formatTime(seconds: number): string {
  const safeSecs = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const mins = Math.floor(safeSecs / 60);
  const secs = safeSecs % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generates spoiler-free share card copy as specified in GDD 9.4
 */
export function generateShareText(
  level: LevelDefinition,
  medal: MedalType,
  timeSec: number,
  attempts: number,
  mode: GameMode = 'campaign',
  dailyDayNumber?: number
): string {
  const medalEmoji = medal === 'gold' ? '🥇 GOLD' : medal === 'silver' ? '🥈 SILVER' : '🥉 BRONZE';
  const headerLine =
    mode === 'daily' && dailyDayNumber
      ? `DAILY CHALLENGE #${dailyDayNumber.toString().padStart(3, '0')}`
      : `LEVEL #${level.id}: ${level.title.toUpperCase()}`;

  return [
    `PROJECT PUNCHLINE`,
    headerLine,
    `MEDAL: ${medalEmoji}`,
    `TIME: ${formatTime(timeSec)}`,
    `ATTEMPTS: ${attempts}`,
    `CAN YOU FIX IT BETTER?`,
    `#ProjectPunchline #CartoonPuzzle`,
  ].join('\n');
}

export interface SavedGameState {
  version: number;
  completedLevels: Record<number, LevelCompletionRecord>;
  highestUnlockedLevel: number;
  dailyStreak: number;
  lastDailyDate: string | null;
  dailyCompletions: Record<string, DailyCompletionRecord>;
}

export function createDefaultSaveState(): SavedGameState {
  return {
    version: SAVE_SCHEMA_VERSION,
    completedLevels: {},
    highestUnlockedLevel: 1,
    dailyStreak: 0,
    lastDailyDate: null,
    dailyCompletions: {},
  };
}

function isValidMedal(val: unknown): val is MedalType {
  return val === 'gold' || val === 'silver' || val === 'bronze';
}

function sanitizeCompletionRecord(raw: unknown): LevelCompletionRecord | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const rec = raw as Record<string, unknown>;
  if (!isValidMedal(rec.medal)) return null;
  const timeSec =
    typeof rec.timeSec === 'number' && Number.isFinite(rec.timeSec) && rec.timeSec >= 0
      ? Math.round(rec.timeSec)
      : 1;
  const attempts =
    typeof rec.attempts === 'number' && Number.isFinite(rec.attempts) && rec.attempts >= 1
      ? Math.floor(rec.attempts)
      : 1;
  return {
    medal: rec.medal,
    timeSec,
    attempts,
  };
}

/**
 * Validates and migrates raw parsed save data (from v1 or v2) into a guaranteed valid v2 SavedGameState.
 * Recovers gracefully from corrupted, partial, or malformed data.
 */
export function validateAndMigrateSaveState(rawInput: unknown): SavedGameState {
  const fallback = createDefaultSaveState();
  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return fallback;
  }

  const raw = rawInput as Record<string, unknown>;
  const isV2OrLater = typeof raw.version === 'number' && raw.version >= 2;

  // 1. Validate campaign completedLevels
  const completedLevels: Record<number, LevelCompletionRecord> = {};
  let maxCompletedId = 0;
  if (raw.completedLevels && typeof raw.completedLevels === 'object' && !Array.isArray(raw.completedLevels)) {
    for (const [key, val] of Object.entries(raw.completedLevels as Record<string, unknown>)) {
      const lvlId = Number(key);
      if (Number.isInteger(lvlId) && lvlId >= 1 && lvlId <= CAMPAIGN_LEVELS.length) {
        const sanitized = sanitizeCompletionRecord(val);
        if (sanitized) {
          completedLevels[lvlId] = sanitized;
          if (lvlId > maxCompletedId) maxCompletedId = lvlId;
        }
      }
    }
  }

  // 2. Validate highestUnlockedLevel
  const minUnlockedFromCompleted = Math.min(
    CAMPAIGN_LEVELS.length,
    Math.max(1, maxCompletedId + 1)
  );
  let highestUnlockedLevel = minUnlockedFromCompleted;
  if (typeof raw.highestUnlockedLevel === 'number' && Number.isFinite(raw.highestUnlockedLevel)) {
    const clamped = Math.max(
      1,
      Math.min(CAMPAIGN_LEVELS.length, Math.floor(raw.highestUnlockedLevel))
    );
    highestUnlockedLevel = Math.max(clamped, minUnlockedFromCompleted);
  }

  // 3. Validate dailyCompletions
  const dailyCompletions: Record<string, DailyCompletionRecord> = {};
  if (
    raw.dailyCompletions &&
    typeof raw.dailyCompletions === 'object' &&
    !Array.isArray(raw.dailyCompletions)
  ) {
    for (const [dateKey, val] of Object.entries(raw.dailyCompletions as Record<string, unknown>)) {
      if (!isValidUtcDateString(dateKey)) continue;
      const baseRec = sanitizeCompletionRecord(val);
      if (!baseRec) continue;
      const recObj = val as Record<string, unknown>;
      const expectedLevelId = getDailyChallengeLevel(dateKey).level.id;
      const levelId =
        typeof recObj.levelId === 'number' &&
        Number.isInteger(recObj.levelId) &&
        recObj.levelId >= 1 &&
        recObj.levelId <= CAMPAIGN_LEVELS.length
          ? recObj.levelId
          : expectedLevelId;

      dailyCompletions[dateKey] = {
        ...baseRec,
        levelId,
        dateStr: dateKey,
      };
    }
  }

  // 4. Validate lastDailyDate and dailyStreak
  // Note: In v1 saves, a bug incremented dailyStreak during campaign completions without dailyCompletions.
  // For v1 migration: if dailyCompletions is missing, only preserve lastDailyDate/dailyStreak if explicitly valid,
  // and synthesize a dailyCompletion entry for lastDailyDate if dailyStreak > 0 so state is consistent.
  let lastDailyDate: string | null = isValidUtcDateString(raw.lastDailyDate)
    ? raw.lastDailyDate
    : null;
  let dailyStreak: number =
    typeof raw.dailyStreak === 'number' && Number.isFinite(raw.dailyStreak) && raw.dailyStreak >= 0
      ? Math.floor(raw.dailyStreak)
      : 0;

  if (!lastDailyDate || dailyStreak === 0) {
    lastDailyDate = null;
    dailyStreak = 0;
  } else if (!isV2OrLater && !dailyCompletions[lastDailyDate]) {
    // Migrate v1 daily state into dailyCompletions so v2 state is self-consistent
    const dailyInfo = getDailyChallengeLevel(lastDailyDate);
    dailyCompletions[lastDailyDate] = {
      levelId: dailyInfo.level.id,
      dateStr: lastDailyDate,
      medal: 'gold',
      timeSec: 30,
      attempts: 1,
    };
  }

  return {
    version: SAVE_SCHEMA_VERSION,
    completedLevels,
    highestUnlockedLevel,
    dailyStreak,
    lastDailyDate,
    dailyCompletions,
  };
}

/**
 * Computes the active daily streak as of a given UTC date (todayStr).
 * If the player missed yesterday (lastDailyDate is more than 1 UTC day before todayStr),
 * the effective active streak is 0.
 */
export function getEffectiveDailyStreak(
  state: SavedGameState,
  todayStr: string = getCurrentUtcDateString()
): number {
  if (!state.lastDailyDate || !isValidUtcDateString(state.lastDailyDate) || state.dailyStreak <= 0) {
    return 0;
  }
  if (!isValidUtcDateString(todayStr)) {
    return state.dailyStreak;
  }
  const diffDays = getUtcDaysDifference(state.lastDailyDate, todayStr);
  if (diffDays === 0 || diffDays === 1) {
    return state.dailyStreak;
  }
  return 0;
}

/**
 * Checks whether today's daily challenge has been completed.
 */
export function isDailyCompletedForDate(
  state: SavedGameState,
  dateStr: string = getCurrentUtcDateString()
): boolean {
  return Boolean(state.dailyCompletions[dateStr]);
}

function mergeBestCompletionRecord(
  existing: LevelCompletionRecord | undefined,
  incoming: LevelCompletionRecord
): LevelCompletionRecord {
  if (!existing) return incoming;
  const bestMedal =
    MEDAL_RANK[incoming.medal] >= MEDAL_RANK[existing.medal] ? incoming.medal : existing.medal;
  const bestTimeSec = Math.min(existing.timeSec, incoming.timeSec);
  const bestAttempts = Math.min(existing.attempts, incoming.attempts);
  return {
    medal: bestMedal,
    timeSec: bestTimeSec,
    attempts: bestAttempts,
  };
}

/**
 * Records a campaign level completion.
 * Strictly isolated from daily challenge streaks and daily completion records.
 */
export function recordCampaignCompletion(
  state: SavedGameState,
  levelId: number,
  medal: MedalType,
  timeSec: number,
  attempts: number
): SavedGameState {
  const sanitizedTime = Math.max(1, Math.round(timeSec));
  const sanitizedAttempts = Math.max(1, Math.floor(attempts));
  const prevRecord = state.completedLevels[levelId];
  const mergedRecord = mergeBestCompletionRecord(prevRecord, {
    medal,
    timeSec: sanitizedTime,
    attempts: sanitizedAttempts,
  });

  const nextUnlocked = Math.max(
    state.highestUnlockedLevel,
    Math.min(CAMPAIGN_LEVELS.length, levelId + 1)
  );

  return {
    ...state,
    version: SAVE_SCHEMA_VERSION,
    completedLevels: {
      ...state.completedLevels,
      [levelId]: mergedRecord,
    },
    highestUnlockedLevel: nextUnlocked,
  };
}

/**
 * Records a daily challenge completion for a specific UTC date (YYYY-MM-DD).
 *
 * Rules (Task 1):
 * - Strictly isolated from campaign completedLevels and highestUnlockedLevel.
 * - One daily streak increment per UTC date: replaying the same UTC date never increments the streak again.
 * - Completing on the consecutive UTC day (diff === 1) increments the streak by 1.
 * - Completing after missing one or more UTC days (diff > 1) resets the streak to 1.
 */
export function recordDailyCompletion(
  state: SavedGameState,
  dateStr: string,
  levelId: number,
  medal: MedalType,
  timeSec: number,
  attempts: number
): SavedGameState {
  const validDate = isValidUtcDateString(dateStr) ? dateStr : getCurrentUtcDateString();
  const sanitizedTime = Math.max(1, Math.round(timeSec));
  const sanitizedAttempts = Math.max(1, Math.floor(attempts));

  const prevDailyRec = state.dailyCompletions[validDate];
  const mergedBase = mergeBestCompletionRecord(prevDailyRec, {
    medal,
    timeSec: sanitizedTime,
    attempts: sanitizedAttempts,
  });

  const updatedDailyRecord: DailyCompletionRecord = {
    ...mergedBase,
    levelId,
    dateStr: validDate,
  };

  let nextStreak = state.dailyStreak;
  let nextLastDate = state.lastDailyDate;

  if (prevDailyRec || state.lastDailyDate === validDate) {
    // Replaying today's puzzle: do not increment streak again
    nextStreak = Math.max(1, state.dailyStreak);
    nextLastDate = validDate;
  } else if (state.lastDailyDate && isValidUtcDateString(state.lastDailyDate)) {
    const diffDays = getUtcDaysDifference(state.lastDailyDate, validDate);
    if (diffDays === 1) {
      // Consecutive UTC day
      nextStreak = state.dailyStreak + 1;
      nextLastDate = validDate;
    } else if (diffDays > 1) {
      // Missed one or more UTC days -> streak resets to 1
      nextStreak = 1;
      nextLastDate = validDate;
    } else {
      // Out-of-order past date -> preserve current streak
      nextStreak = Math.max(1, state.dailyStreak);
    }
  } else {
    // First-ever daily completion
    nextStreak = 1;
    nextLastDate = validDate;
  }

  return {
    ...state,
    version: SAVE_SCHEMA_VERSION,
    dailyStreak: nextStreak,
    lastDailyDate: nextLastDate,
    dailyCompletions: {
      ...state.dailyCompletions,
      [validDate]: updatedDailyRecord,
    },
  };
}

/**
 * Loads, validates, and migrates saved game state from localStorage.
 * Safely recovers from corrupted JSON or invalid schemas.
 */
export function loadSavedGameState(): SavedGameState {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return createDefaultSaveState();
  }
  try {
    const rawV2 = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawV2 !== null) {
      const parsed = JSON.parse(rawV2);
      const validated = validateAndMigrateSaveState(parsed);
      return validated;
    }

    // Check legacy v1 key and migrate if present
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (rawV1 !== null) {
      const parsedV1 = JSON.parse(rawV1);
      const migrated = validateAndMigrateSaveState(parsedV1);
      saveGameState(migrated);
      return migrated;
    }

    return createDefaultSaveState();
  } catch {
    const fresh = createDefaultSaveState();
    saveGameState(fresh);
    return fresh;
  }
}

export function saveGameState(state: SavedGameState): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    const validated = validateAndMigrateSaveState(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validated));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Resets all saved progress back to a clean default state and persists to localStorage.
 */
export function resetSavedGameState(): SavedGameState {
  const fresh = createDefaultSaveState();
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY_V1);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore storage errors
    }
  }
  return fresh;
}
