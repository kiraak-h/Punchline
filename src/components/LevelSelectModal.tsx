import React, { useState } from 'react';
import { CAMPAIGN_LEVELS } from '../game/levels';
import { SavedGameState } from '../game/logic';
import { sound } from '../game/audio';

interface LevelSelectModalProps {
  currentLevelId: number;
  savedState: SavedGameState;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
  onResetProgress?: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  savedState,
  onSelectLevel,
  onClose,
  onResetProgress,
}) => {
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-select-title"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#FFF2DC] border-4 border-[#292833] rounded-3xl p-6 sm:p-8 shadow-[0_12px_0_#292833] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b-3 border-[#292833]">
          <div>
            <span className="text-xs font-black tracking-widest text-[#FF6B70] uppercase">
              CAMPAIGN BROWSER
            </span>
            <h2 id="level-select-title" className="text-2xl sm:text-3xl font-black text-[#292833]">
              CHAPTER 1: THE FIRST FIX
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playSelect();
              onClose();
            }}
            aria-label="Close Level Select"
            className="w-9 h-9 rounded-full bg-[#292833] text-[#FFF2DC] font-black text-sm hover:bg-[#3E3D4A] transition-all cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Level Grid */}
        <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {CAMPAIGN_LEVELS.map((lvl) => {
            const isCompleted = !!savedState.completedLevels[lvl.id];
            const medal = savedState.completedLevels[lvl.id]?.medal;
            const isUnlocked = lvl.id <= (savedState.highestUnlockedLevel || 1);
            const isCurrent = lvl.id === currentLevelId;

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  if (!isUnlocked) return;
                  sound.playSelect();
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                disabled={!isUnlocked}
                className={`p-3.5 rounded-2xl border-3 text-left transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-[#FFD65A] border-[#292833] ring-3 ring-[#FF6B70] shadow-md scale-[1.01]'
                    : isUnlocked
                    ? 'bg-white border-[#292833] hover:bg-amber-50 hover:shadow-md cursor-pointer'
                    : 'bg-slate-200/70 border-slate-300 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 border-[#292833] shrink-0 ${
                      isCompleted
                        ? 'bg-[#83D49B] text-[#292833]'
                        : isUnlocked
                        ? 'bg-[#54C8D8] text-[#292833]'
                        : 'bg-slate-300 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? lvl.id.toString().padStart(2, '0') : '🔒'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-[#FF6B70] uppercase truncate">
                      {lvl.chapter}
                    </div>
                    <div className="text-sm font-black text-[#292833] truncate">
                      {lvl.title}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">
                      Tool: {lvl.eligibleTools.join(', ')} · Diff: {lvl.difficulty}/10
                    </div>
                  </div>
                </div>

                {/* Completion Medal */}
                {isCompleted && (
                  <div className="text-xl shrink-0" title={`Medal: ${medal}`}>
                    {medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Future Chapter Roadmaps & Reset Progress */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#292833]/5 border-2 border-[#292833]/15 rounded-2xl p-3 text-xs font-bold text-[#292833]">
          <div>
            <span>🚀 Chapters 2–7 · </span>
            <span className="text-[#FF6B70]">Roadmap Target: 100 Handcrafted Levels</span>
          </div>

          {onResetProgress && (
            !confirmingReset ? (
              <button
                onClick={() => {
                  sound.playSelect();
                  setConfirmingReset(true);
                }}
                aria-label="Reset progress"
                className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 border-2 border-[#292833] font-black text-xs transition-all cursor-pointer shrink-0"
              >
                🗑️ RESET PROGRESS
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-black text-red-700">Confirm reset?</span>
                <button
                  onClick={() => {
                    sound.playUndo();
                    setConfirmingReset(false);
                    onResetProgress();
                  }}
                  aria-label="Confirm reset progress"
                  className="px-2.5 py-1 rounded-lg bg-[#FF6B70] hover:bg-red-600 text-white border-2 border-[#292833] font-black text-xs cursor-pointer"
                >
                  YES, RESET
                </button>
                <button
                  onClick={() => {
                    sound.playSelect();
                    setConfirmingReset(false);
                  }}
                  aria-label="Cancel reset progress"
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#292833] border-2 border-[#292833] font-black text-xs cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
