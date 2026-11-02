import React, { useState } from 'react';
import { GameMode, LevelDefinition, MedalType } from '../game/types';
import { formatTime, generateShareText } from '../game/logic';
import { sound } from '../game/audio';
import { RaccoonAvatar, ToasterCEOAvatar, PigeonAvatar, GoblinAvatar } from './CartoonCast';

interface ResultModalProps {
  success: boolean;
  level: LevelDefinition;
  timeSpentSec: number;
  attempts: number;
  hintsUsedCount: number;
  medal: MedalType;
  onNextLevel: () => void;
  onRetry: () => void;
  onOpenHint: () => void;
  hasNextLevel: boolean;
  gameMode?: GameMode;
  dailyDayNumber?: number;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  success,
  level,
  timeSpentSec,
  attempts,
  hintsUsedCount,
  medal,
  onNextLevel,
  onRetry,
  onOpenHint,
  hasNextLevel,
  gameMode = 'campaign',
  dailyDayNumber,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = () => {
    sound.playSelect();
    const shareText = generateShareText(
      level,
      medal,
      timeSpentSec,
      attempts,
      gameMode,
      dailyDayNumber
    );
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      });
    }
  };

  const renderSpeakerAvatar = (speaker: string, isSuccess: boolean) => {
    const pose = isSuccess ? 'celebrate' : 'panic';
    if (speaker.includes('CEO') || speaker.includes('Toaster')) {
      return <ToasterCEOAvatar pose={isSuccess ? 'toast' : 'panic'} size={70} />;
    }
    if (speaker.includes('Pigeon')) {
      return <PigeonAvatar pose={pose} size={65} />;
    }
    if (speaker.includes('Goblin') || speaker.includes('Intern')) {
      return <GoblinAvatar pose={pose} size={65} />;
    }
    return <RaccoonAvatar pose={isSuccess ? 'smug' : 'panic'} size={70} />;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#FFF2DC] border-4 border-[#292833] rounded-3xl p-6 sm:p-8 shadow-[0_12px_0_#292833] text-center select-none">
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#292833] font-black text-xs sm:text-sm uppercase tracking-wider mb-4 shadow-sm bg-[#292833] text-[#FFF2DC]">
          <span>
            {success
              ? gameMode === 'daily'
                ? '📅 DAILY CHALLENGE FIXED'
                : '🎉 REALITY RESTORED'
              : '💥 CARTOON CATASTROPHE'}
          </span>
        </div>

        {/* Big Outcome Title */}
        <h2
          id="modal-title"
          className={`text-2xl sm:text-3xl font-black mb-2 tracking-tight ${
            success ? 'text-[#15803D]' : 'text-[#DC2626]'
          }`}
        >
          {success ? 'PUNCHLINE DELIVERED!' : 'DISASTER UNFOLDED!'}
        </h2>

        {/* Punchline Dialog Speech Bubble */}
        <div className="relative bg-white border-3 border-[#292833] rounded-2xl p-4 sm:p-5 mb-5 shadow-md flex items-start gap-3 sm:gap-4 text-left">
          <div className="shrink-0">{renderSpeakerAvatar(success ? level.successPunchline.speaker : level.failurePunchline.speaker, success)}</div>
          <div>
            <div className="text-xs font-black uppercase text-[#FF6B70] tracking-wider mb-0.5">
              {success ? level.successPunchline.speaker : level.failurePunchline.speaker}
            </div>
            <p className="text-sm sm:text-base font-bold text-[#292833] leading-snug">
              "{success ? level.successPunchline.text : level.failurePunchline.text}"
            </p>
          </div>
        </div>

        {/* Mastery Metrics Tile Grid (GDD Part 9.2) */}
        {success ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 bg-[#292833]/5 border-2 border-[#292833]/20 rounded-2xl p-3">
            {/* Medal */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border-2 border-[#292833]">
              <span className="text-xs font-bold text-slate-500 uppercase">MEDAL</span>
              <span className="text-2xl my-0.5">
                {medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉'}
              </span>
              <span className="text-xs font-black uppercase text-[#292833]">
                {medal.toUpperCase()}
              </span>
            </div>

            {/* Clear Time */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border-2 border-[#292833]">
              <span className="text-xs font-bold text-slate-500 uppercase">SOLVE TIME</span>
              <span className="text-xl sm:text-2xl font-black text-[#292833] tabular-nums my-0.5">
                {formatTime(timeSpentSec)}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Par: {level.expectedTime}
              </span>
            </div>

            {/* Attempts */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border-2 border-[#292833]">
              <span className="text-xs font-bold text-slate-500 uppercase">ATTEMPTS</span>
              <span className="text-xl sm:text-2xl font-black text-[#292833] tabular-nums my-0.5">
                {attempts}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {hintsUsedCount > 0 ? `${hintsUsedCount} hints` : 'No hints!'}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-red-700 mb-1">
              What Went Wrong:
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-red-900">
              The unpatched cartoon hazard activated. Try using one of the three tools (Swap, Freeze, or Resize) before running the scene!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {success ? (
            <>
              {gameMode === 'daily' ? (
                <button
                  data-start="true"
                  onClick={() => {
                    sound.playSelect();
                    onNextLevel();
                  }}
                  aria-label="Return to Title Screen"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#83D49B] hover:bg-[#6ee7b7] text-[#292833] font-black text-base border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>BACK TO TITLE ➔</span>
                  <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded font-mono">ENTER</span>
                </button>
              ) : hasNextLevel ? (
                <button
                  data-start="true"
                  onClick={() => {
                    sound.playSelect();
                    onNextLevel();
                  }}
                  aria-label="Proceed to Next Level"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#83D49B] hover:bg-[#6ee7b7] text-[#292833] font-black text-base border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>NEXT LEVEL ➔</span>
                  <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded font-mono">ENTER</span>
                </button>
              ) : (
                <div className="text-sm font-black text-[#15803D] py-2">
                  🏆 CAMPAIGN CLEARED! ALL 10 LEVELS MASTERED!
                </div>
              )}

              <button
                onClick={() => {
                  sound.playSelect();
                  onRetry();
                }}
                aria-label="Replay Level"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#FFF2DC] hover:bg-white text-[#292833] font-black text-sm border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 cursor-pointer"
              >
                🔄 REPLAY
              </button>

              <button
                onClick={handleShare}
                aria-label="Share Results Card"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#54C8D8] hover:bg-[#38b2c2] text-[#292833] font-black text-sm border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{copiedShare ? '✅ COPIED!' : '📋 SHARE'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                data-start="true"
                onClick={() => {
                  sound.playSelect();
                  onRetry();
                }}
                aria-label="Try again"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#FF6B70] hover:bg-[#fa555b] text-[#FFF2DC] font-black text-base border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>TRY AGAIN 🔄</span>
                <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded font-mono">SPACE</span>
              </button>

              <button
                onClick={() => {
                  sound.playSelect();
                  onOpenHint();
                }}
                aria-label="Open hint window"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FFD65A] hover:bg-yellow-300 text-[#292833] font-black text-sm border-3 border-[#292833] shadow-[0_4px_0_#292833] hover:shadow-[0_1px_0_#292833] hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>💡 NEED A HINT?</span>
                <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded font-mono">H</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
