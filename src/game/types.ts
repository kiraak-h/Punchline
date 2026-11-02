export type ToolType = 'SWAP' | 'FREEZE' | 'RESIZE';
export type ResizeOption = 'SMALL' | 'LARGE';

export type PatchAction =
  | { type: 'RESIZE'; targetId: string; size: ResizeOption }
  | { type: 'FREEZE'; targetId: string }
  | { type: 'SWAP'; targetAId: string; targetBId: string };

export interface SceneObject {
  id: string;
  name: string;
  role: string;
  canSwap?: boolean;
  canFreeze?: boolean;
  canResize?: boolean;
  swapGroup?: string;
  defaultSize?: ResizeOption | 'NORMAL';
  isFrozenByDefault?: boolean;
  x: number; // percentage or scene coordinate
  y: number;
  width: number;
  height: number;
  visualType: string;
  color?: string;
  label?: string;
}

export interface PunchlineDialog {
  speaker: 'Raccoon Manager' | 'Toaster CEO' | 'NPC Pigeon' | 'Goblin Intern' | 'Robot' | 'Announcer' | 'Cat';
  text: string;
  reaction: 'celebrate' | 'smug' | 'panic' | 'toast' | 'cozy' | 'confused' | 'sleep';
}

export interface LevelDefinition {
  id: number;
  title: string;
  chapter: string;
  difficulty: number;
  expectedTime: string;
  openingScene: string;
  goal: string;
  learningObjective: string;
  objects: SceneObject[];
  eligibleTools: ToolType[];
  intendedSolution: PatchAction;
  hints: [string, string, string]; // [1: Direction, 2: Object, 3: Solution]
  successPunchline: PunchlineDialog;
  failurePunchline: PunchlineDialog;
  runDurationSec: number;
}

export type MedalType = 'gold' | 'silver' | 'bronze';

export interface LevelScore {
  medal: MedalType;
  attempts: number;
  hintsUsed: number;
  timeSpentSec: number;
  solvedAt: string;
}

export type GameScreen = 'title' | 'playing' | 'paused' | 'level_select' | 'daily_challenge';
