import React from 'react';
import { LevelDefinition, PatchAction, ToolType } from '../game/types';
import { sound } from '../game/audio';

interface GameHUDProps {
  level: LevelDefinition;
  totalLevels: number;
  activeTool: ToolType | null;
  onSelectTool: (tool: ToolType) => void;
  patch: PatchAction | null;
  onUndoPatch: () => void;
  onRunSimulation: () => void;
  isRunning: boolean;
  onOpenHint: () => void;
  onRestartLevel: () => void;
  onPause: () => void;
  onOpenLevelSelect: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  hintsUsedCount: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  totalLevels,
  activeTool,
  onSelectTool,
  patch,
  onUndoPatch,
  onRunSimulation,
  isRunning,
  onOpenHint,
  onRestartLevel,
  onPause,
  onOpenLevelSelect,
  isMuted,
  onToggleMute,
  isMusicPlaying,
  onToggleMusic,
  hintsUsedCount,
}) => {
  const getPatchSummary = () => {
    if (!patch) return 'NO PATCH APPLIED';
    if (patch.type === 'FREEZE') {
      const obj = level.objects.find((o) => o.id === patch.targetId);
      return `FROZEN: ${obj?.name || 'Object'}`;
    }
    if (patch.type === 'RESIZE') {
      const obj = level.objects.find((o) => o.id === patch.targetId);
      return `RESIZED: ${obj?.name || 'Object'} ➔ ${patch.size} (${patch.size === 'SMALL' ? '0.6×' : '1.6×'})`;
    }
    if (patch.type === 'SWAP') {
      const objA = level.objects.find((o) => o.id === patch.targetAId);
      const objB = level.objects.find((o) => o.id === patch.targetBId);
      return `SWAPPED: ${objA?.name || 'A'} ⇄ ${objB?.name || 'B'}`;
    }
    return '';
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5 select-none z-20">
      {/* Top Header Cluster */}
      <header className="flex items-start justify-between gap-3 w-full">
        {/* Left: Level Info & Chapter */}
        <div className="pointer-events-auto bg-[#292833]/95 text-[#FFF2DC] border-3 border-[#292833] rounded-2xl px-4 py-2.5 shadow-xl max-w-sm sm:max-w-md">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-[#FFD65A]">
              {level.chapter}
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-[10px] sm:text-xs font-bold text-[#54C8D8] tabular-nums">
              LEVEL {level.id.toString().padStart(2, '0')} / {totalLevels.toString().padStart(2, '0')}
            </span>
          </div>
          <h1 className="text-sm sm:text-lg font-black tracking-tight text-[#FFF2DC] truncate">
            {level.title}
          </h1>
          <p className="text-xs text-amber-200/90 font-medium line-clamp-1 mt-0.5">
            🎯 <span className="text-white font-bold">Goal:</span> {level.goal}
          </p>
        </div>

        {/* Right: Quick Utilities Cluster */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Hint Button */}
          <button
            onClick={() => {
              sound.playSelect();
              onOpenHint();
            }}
            aria-label="View puzzle hints"
            disabled={isRunning}
            className={`px-3 py-2 rounded-xl border-3 border-[#292833] font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all transform active:scale-95 cursor-pointer ${
              hintsUsedCount > 0
                ? 'bg-[#FFD65A] text-[#292833] hover:bg-yellow-300'
                : 'bg-[#FFF2DC] text-[#292833] hover:bg-white'
            }`}
          >
            <span>💡</span>
            <span className="hidden sm:inline">HINT</span>
            <span className="text-[10px] bg-[#292833]/15 px-1.5 py-0.5 rounded font-mono font-bold">H</span>
          </button>

          {/* Level Select */}
          <button
            onClick={() => {
              sound.playSelect();
              onOpenLevelSelect();
            }}
            aria-label="Open level select modal"
            disabled={isRunning}
            className="px-2.5 py-2 rounded-xl bg-[#FFF2DC] hover:bg-white text-[#292833] border-3 border-[#292833] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <span>🗺️</span>
            <span className="hidden md:inline">LEVELS</span>
          </button>

          {/* Restart Level */}
          <button
            onClick={() => {
              sound.playSelect();
              onRestartLevel();
            }}
            aria-label="Restart current level"
            disabled={isRunning}
            className="w-10 h-10 rounded-xl bg-[#FFF2DC] hover:bg-white text-[#292833] border-3 border-[#292833] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Restart Level [R]"
          >
            🔄
          </button>

          {/* Ambient Music Toggle */}
          <button
            onClick={() => {
              sound.playSelect();
              onToggleMusic();
            }}
            aria-label="Toggle cartoon background music"
            className={`w-10 h-10 rounded-xl border-3 border-[#292833] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              isMusicPlaying ? 'bg-[#83D49B] text-[#292833]' : 'bg-[#FFF2DC] text-slate-400'
            }`}
            title="Music [B]"
          >
            🎵
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              sound.playSelect();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="w-10 h-10 rounded-xl bg-[#FFF2DC] hover:bg-white text-[#292833] border-3 border-[#292833] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Mute Sound [M]"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Pause */}
          <button
            onClick={() => {
              sound.playSelect();
              onPause();
            }}
            aria-label="Pause game"
            disabled={isRunning}
            className="w-10 h-10 rounded-xl bg-[#292833] hover:bg-[#3E3D4A] text-[#FFF2DC] border-3 border-[#292833] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Pause [Esc / P]"
          >
            ⏸️
          </button>
        </div>
      </header>

      {/* Bottom Tool Dock & Run Action Bar */}
      <footer className="flex flex-col items-center gap-3 w-full">
        {/* Active Patch Status Pill */}
        {patch && (
          <div className="pointer-events-auto flex items-center gap-2 bg-[#292833] border-2 border-[#54C8D8] text-[#FFF2DC] px-4 py-1.5 rounded-full shadow-lg text-xs sm:text-sm font-bold animate-fadeIn">
            <span className="text-[#54C8D8]">✨</span>
            <span>{getPatchSummary()}</span>
            <button
              onClick={() => {
                sound.playUndo();
                onUndoPatch();
              }}
              aria-label="Undo applied patch"
              disabled={isRunning}
              className="ml-2 bg-[#FF6B70] hover:bg-red-500 text-[#FFF2DC] text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
            >
              <span>UNDO</span>
              <span className="font-mono opacity-80">[Z]</span>
            </button>
          </div>
        )}

        {/* Central Controls Dock */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#292833]/95 border-3 border-[#292833] p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-none">
          {/* Tool 1: SWAP */}
          <button
            onClick={() => {
              sound.playToolSelect('SWAP');
              onSelectTool('SWAP');
            }}
            aria-label="Select SWAP tool to exchange positions of two compatible objects"
            disabled={isRunning || !level.eligibleTools.includes('SWAP')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-3 font-black text-xs sm:text-sm transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer ${
              activeTool === 'SWAP'
                ? 'bg-[#FF6B70] text-[#FFF2DC] border-[#292833] ring-3 ring-[#FFD65A] scale-105'
                : level.eligibleTools.includes('SWAP')
                ? 'bg-[#FFF2DC] text-[#292833] border-[#292833] hover:bg-white'
                : 'bg-slate-700/50 text-slate-400 border-slate-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <span className="text-base sm:text-lg">🔄</span>
            <span className="tracking-wide">SWAP</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">1</span>
          </button>

          {/* Tool 2: FREEZE */}
          <button
            onClick={() => {
              sound.playToolSelect('FREEZE');
              onSelectTool('FREEZE');
            }}
            aria-label="Select FREEZE tool to stop movement or active behaviour"
            disabled={isRunning || !level.eligibleTools.includes('FREEZE')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-3 font-black text-xs sm:text-sm transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer ${
              activeTool === 'FREEZE'
                ? 'bg-[#54C8D8] text-[#292833] border-[#292833] ring-3 ring-[#FFD65A] scale-105'
                : level.eligibleTools.includes('FREEZE')
                ? 'bg-[#FFF2DC] text-[#292833] border-[#292833] hover:bg-white'
                : 'bg-slate-700/50 text-slate-400 border-slate-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <span className="text-base sm:text-lg">❄️</span>
            <span className="tracking-wide">FREEZE</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">2</span>
          </button>

          {/* Tool 3: RESIZE */}
          <button
            onClick={() => {
              sound.playToolSelect('RESIZE');
              onSelectTool('RESIZE');
            }}
            aria-label="Select RESIZE tool to change object dimensions"
            disabled={isRunning || !level.eligibleTools.includes('RESIZE')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-3 font-black text-xs sm:text-sm transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer ${
              activeTool === 'RESIZE'
                ? 'bg-[#FFD65A] text-[#292833] border-[#292833] ring-3 ring-[#FF6B70] scale-105'
                : level.eligibleTools.includes('RESIZE')
                ? 'bg-[#FFF2DC] text-[#292833] border-[#292833] hover:bg-white'
                : 'bg-slate-700/50 text-slate-400 border-slate-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <span className="text-base sm:text-lg">📐</span>
            <span className="tracking-wide">RESIZE</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">3</span>
          </button>

          {/* Divider */}
          <div className="w-[2px] h-8 bg-slate-600 hidden sm:block mx-1" />

          {/* Primary Action CTA: RUN */}
          <button
            onClick={onRunSimulation}
            disabled={isRunning}
            data-testid="run-button"
            className={`px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base border-3 border-[#292833] shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer ${
              isRunning
                ? 'bg-amber-400 text-[#292833] animate-pulse cursor-wait'
                : 'bg-[#83D49B] hover:bg-[#6ee7b7] text-[#292833] hover:scale-105'
            }`}
          >
            <span className="text-base sm:text-lg">{isRunning ? '⏳' : '▶'}</span>
            <span className="tracking-wider">{isRunning ? 'SIMULATING...' : 'RUN SCENE'}</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono hidden sm:inline">
              SPACE
            </span>
          </button>
        </div>

        {/* Flat control hint line */}
        <div className="text-[11px] font-bold text-[#292833]/80 tracking-wide text-center">
          1 Swap · 2 Freeze · 3 Resize · Space Run · Z Undo · H Hint · Esc Pause
        </div>
      </footer>
    </div>
  );
};
