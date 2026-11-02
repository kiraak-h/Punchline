import { LevelDefinition, MedalType, PatchAction, SceneObject } from './types';
import { CAMPAIGN_LEVELS } from './levels';

/**
 * Checks whether two objects are eligible to swap with each other.
 * Rules from GDD 2.1:
 * - Only compatible, highlighted objects can be swapped.
 * - Both objects must have canSwap=true and share the same swapGroup.
 */
export function isCompatibleSwap(objA: SceneObject, objB: SceneObject): boolean {
  if (objA.id === objB.id) return false;
  if (!objA.canSwap || !objB.canSwap) return false;
  if (!objA.swapGroup || !objB.swapGroup) return false;
  return objA.swapGroup === objB.swapGroup;
}

/**
 * Validates a patch action against a level's intended solution.
 * Deterministic rules:
 * - RESIZE must target the right object and pick the right scale option.
 * - FREEZE must target the right object.
 * - SWAP must exchange the designated pair (order-independent).
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
 * - Gold: Solved on first attempt without using the solution hint (hint index 2).
 * - Silver: Solved after retrying (attempts > 1) without solution hint.
 * - Bronze: Solved after using the full solution hint (hint 3).
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
 * Returns a deterministic daily challenge level based on a date string (YYYY-MM-DD).
 */
export function getDailyChallengeLevel(dateStr: string): { level: LevelDefinition; dayNumber: number } {
  // Simple deterministic hash
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const index = positiveHash % CAMPAIGN_LEVELS.length;
  // Day number since launch reference point
  const dayNumber = (positiveHash % 365) + 1;
  const baseLevel = CAMPAIGN_LEVELS[index];

  return {
    level: {
      ...baseLevel,
      title: `[Daily #${dayNumber}] ${baseLevel.title}`,
      chapter: 'Daily Challenge',
    },
    dayNumber,
  };
}

/**
 * Formats seconds into MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generates spoiler-free share card copy as specified in GDD 9.4
 */
export function generateShareText(
  level: LevelDefinition,
  medal: MedalType,
  timeSec: number,
  attempts: number
): string {
  const medalEmoji = medal === 'gold' ? '🥇 GOLD' : medal === 'silver' ? '🥈 SILVER' : '🥉 BRONZE';
  return [
    `PROJECT PUNCHLINE`,
    `LEVEL #${level.id}: ${level.title.toUpperCase()}`,
    `MEDAL: ${medalEmoji}`,
    `TIME: ${formatTime(timeSec)}`,
    `ATTEMPTS: ${attempts}`,
    `CAN YOU FIX IT BETTER?`,
    `#ProjectPunchline #CartoonPuzzle`,
  ].join('\n');
}

export const LOCAL_STORAGE_KEY = 'project_punchline_save_v1';

export interface SavedGameState {
  completedLevels: Record<number, { medal: MedalType; timeSec: number; attempts: number }>;
  highestUnlockedLevel: number;
  dailyStreak: number;
  lastDailyDate: string | null;
}

export function loadSavedGameState(): SavedGameState {
  if (typeof window === 'undefined') {
    return {
      completedLevels: {},
      highestUnlockedLevel: 1,
      dailyStreak: 0,
      lastDailyDate: null,
    };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return {
        completedLevels: {},
        highestUnlockedLevel: 1,
        dailyStreak: 0,
        lastDailyDate: null,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      completedLevels: {},
      highestUnlockedLevel: 1,
      dailyStreak: 0,
      lastDailyDate: null,
    };
  }
}

export function saveGameState(state: SavedGameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}
