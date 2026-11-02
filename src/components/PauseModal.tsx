import React from 'react';
import { sound } from '../game/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
  onGoToTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenLevelSelect,
  onGoToTitle,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-modal-title"
    >
      <div className="relative w-full max-w-sm bg-[#FFF2DC] border-4 border-[#292833] rounded-3xl p-6 sm:p-8 shadow-[0_12px_0_#292833] text-center">
        <h2 id="pause-modal-title" className="text-3xl font-black text-[#292833] mb-6 tracking-tight">
          PAUSED ⏸️
        </h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              sound.playSelect();
              onResume();
            }}
            aria-label="Resume playing"
            className="w-full py-3.5 rounded-2xl bg-[#83D49B] hover:bg-[#6ee7b7] text-[#292833] font-black text-base border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 cursor-pointer"
          >
            RESUME [ESC]
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onRestart();
            }}
            aria-label="Restart current level"
            className="w-full py-3 rounded-2xl bg-[#FFF2DC] hover:bg-white text-[#292833] font-black text-sm border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 cursor-pointer"
          >
            RESTART LEVEL [R]
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onOpenLevelSelect();
            }}
            aria-label="Open level select menu"
            className="w-full py-3 rounded-2xl bg-[#54C8D8] hover:bg-[#38b2c2] text-[#292833] font-black text-sm border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 cursor-pointer"
          >
            CHAPTER & LEVEL SELECT
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onToggleMute();
            }}
            aria-label="Toggle sound mute"
            className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-[#292833] font-bold text-xs border-2 border-[#292833] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'UNMUTE SOUND' : 'MUTE SOUND'}</span>
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onGoToTitle();
            }}
            aria-label="Return to Title Screen"
            className="w-full py-3 rounded-2xl bg-[#292833] hover:bg-[#3E3D4A] text-[#FFF2DC] font-black text-sm border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 cursor-pointer"
          >
            TITLE SCREEN
          </button>
        </div>
      </div>
    </div>
  );
};
