import React, { useState } from 'react';
import {
  getCurrentUtcDateString,
  getDailyChallengeLevel,
  getEffectiveDailyStreak,
  isDailyCompletedForDate,
  SavedGameState,
} from '../game/logic';
import { sound } from '../game/audio';

interface DailyChallengeModalProps {
  savedState: SavedGameState;
  onPlayDailyLevel: (levelId: number) => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  savedState,
  onPlayDailyLevel,
  onClose,
}) => {
  const todayStr = getCurrentUtcDateString();
  const { level, dayNumber } = getDailyChallengeLevel(todayStr);
  const isCompletedToday = isDailyCompletedForDate(savedState, todayStr);
  const activeStreak = getEffectiveDailyStreak(savedState, todayStr);
  const todayRecord = savedState.dailyCompletions[todayStr];
  const [copied, setCopied] = useState(false);

  const handleShareDaily = () => {
    sound.playSelect();
    const medalLine = todayRecord
      ? `MEDAL: ${todayRecord.medal.toUpperCase()}`
      : 'STATUS: IN PROGRESS';
    const shareText = [
      `PROJECT PUNCHLINE`,
      `DAILY CHALLENGE #${dayNumber.toString().padStart(3, '0')}`,
      `DATE: ${todayStr}`,
      `STREAK: 🔥 ${activeStreak} DAYS`,
      medalLine,
      `STATUS: ${isCompletedToday ? '✅ PUZZLE FIXED' : '⏳ IN PROGRESS'}`,
      `CAN YOU FIX IT BETTER?`,
      `#ProjectPunchline #DailyChallenge`,
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-challenge-title"
    >
      <div className="relative w-full max-w-md bg-[#FFF2DC] border-4 border-[#292833] rounded-3xl p-6 sm:p-8 shadow-[0_12px_0_#292833] text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD65A] border-2 border-[#292833] text-[#292833] text-xs font-black uppercase tracking-wider mb-3">
          <span>📅</span>
          <span>GLOBAL DAILY PUZZLE #{dayNumber.toString().padStart(3, '0')}</span>
        </div>

        <h2 id="daily-challenge-title" className="text-2xl sm:text-3xl font-black text-[#292833] mb-2 tracking-tight">
          {level.title}
        </h2>

        <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-5">
          {level.openingScene}
        </p>

        {/* Daily Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-white border-2 border-[#292833] rounded-2xl">
            <span className="text-[10px] font-black text-slate-500 uppercase">ACTIVE STREAK</span>
            <div className="text-2xl font-black text-[#FF6B70] my-0.5">
              🔥 {activeStreak} {activeStreak === 1 ? 'DAY' : 'DAYS'}
            </div>
            <span className="text-[10px] font-bold text-slate-500">UTC Date: {todayStr}</span>
          </div>

          <div className="p-3 bg-white border-2 border-[#292833] rounded-2xl">
            <span className="text-[10px] font-black text-slate-500 uppercase">TODAY'S STATUS</span>
            <div className="text-xl font-black text-[#15803D] my-1">
              {isCompletedToday ? 'SOLVED ✅' : 'READY ⚡'}
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {isCompletedToday && todayRecord
                ? `Best Medal: ${todayRecord.medal.toUpperCase()}`
                : 'Awaiting your fix'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playSelect();
              onPlayDailyLevel(level.id);
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#83D49B] hover:bg-[#6ee7b7] text-[#292833] font-black text-base border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 cursor-pointer"
          >
            {isCompletedToday ? 'REPLAY TODAY’S CHALLENGE' : 'PLAY TODAY’S CHALLENGE ▶'}
          </button>

          <button
            onClick={handleShareDaily}
            className="w-full py-2.5 rounded-xl bg-[#54C8D8] hover:bg-[#38b2c2] text-[#292833] font-black text-xs sm:text-sm border-2 border-[#292833] shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{copied ? '✅ COPIED TO CLIPBOARD!' : '📋 SHARE DAILY RESULT CARD'}</span>
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onClose();
            }}
            className="mt-1 text-xs font-bold text-slate-500 hover:text-[#292833] underline cursor-pointer"
          >
            Back to Title
          </button>
        </div>
      </div>
    </div>
  );
};
