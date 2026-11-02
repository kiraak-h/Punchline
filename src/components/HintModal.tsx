import React from 'react';
import { LevelDefinition } from '../game/types';
import { sound } from '../game/audio';

interface HintModalProps {
  level: LevelDefinition;
  hintStage: number; // 1, 2, or 3
  onAdvanceHint: () => void;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  level,
  hintStage,
  onAdvanceHint,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hint-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#FFF2DC] border-4 border-[#292833] rounded-3xl p-6 sm:p-7 shadow-[0_12px_0_#292833]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <h3 id="hint-modal-title" className="text-xl font-black text-[#292833] tracking-tight">
              PUZZLE HINTS
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playSelect();
              onClose();
            }}
            aria-label="Close Hint Dialog"
            className="w-8 h-8 rounded-full bg-[#292833] text-[#FFF2DC] font-black text-sm hover:bg-[#3E3D4A] transition-all cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* 3 Progressive Hint Stages */}
        <div className="space-y-3 mb-6">
          {/* Hint Stage 1: Direction */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-[#292833] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-[#FF6B70] uppercase tracking-wider">
                STAGE 1 · DIRECTION
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                Safe for Gold
              </span>
            </div>
            <p className="text-sm font-bold text-[#292833] leading-snug">
              {level.hints[0]}
            </p>
          </div>

          {/* Hint Stage 2: Object */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all ${
              hintStage >= 2
                ? 'bg-white border-[#292833] shadow-sm'
                : 'bg-slate-200/60 border-slate-300 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-[#54C8D8] uppercase tracking-wider">
                STAGE 2 · TARGET OBJECT
              </span>
              {hintStage >= 2 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Safe for Gold
                </span>
              )}
            </div>
            {hintStage >= 2 ? (
              <p className="text-sm font-bold text-[#292833] leading-snug">
                {level.hints[1]}
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-500 italic">
                Locked. Reveal below to highlight the culprit object.
              </p>
            )}
          </div>

          {/* Hint Stage 3: Solution */}
          <div
            className={`p-3.5 rounded-2xl border-2 transition-all ${
              hintStage >= 3
                ? 'bg-amber-50 border-[#292833] shadow-sm'
                : 'bg-slate-200/60 border-slate-300 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                STAGE 3 · FULL SOLUTION
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                Awards Bronze Medal
              </span>
            </div>
            {hintStage >= 3 ? (
              <p className="text-sm font-bold text-[#292833] leading-snug">
                {level.hints[2]}
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-500 italic">
                Locked. Reveals exact tool and target.
              </p>
            )}
          </div>
        </div>

        {/* Advance or Close CTA */}
        <div className="flex items-center justify-end gap-3">
          {hintStage < 3 && (
            <button
              onClick={() => {
                sound.playSelect();
                onAdvanceHint();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#FFD65A] hover:bg-yellow-300 text-[#292833] font-black text-xs sm:text-sm border-2 border-[#292833] shadow-md transition-all active:scale-95 cursor-pointer"
            >
              REVEAL NEXT HINT ({hintStage + 1}/3)
            </button>
          )}

          <button
            onClick={() => {
              sound.playSelect();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#292833] hover:bg-[#3E3D4A] text-[#FFF2DC] font-black text-xs sm:text-sm border-2 border-[#292833] shadow-md transition-all active:scale-95 cursor-pointer"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
