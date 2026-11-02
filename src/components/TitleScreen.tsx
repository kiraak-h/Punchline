import React, { useEffect, useState } from 'react';
import { sound } from '../game/audio';
import { RaccoonAvatar, ToasterCEOAvatar, PigeonAvatar, GoblinAvatar } from './CartoonCast';

interface TitleScreenProps {
  onStartCampaign: () => void;
  onOpenDailyChallenge: () => void;
  onOpenLevelSelect: () => void;
  completedLevelsCount: number;
  totalLevels: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartCampaign,
  onOpenDailyChallenge,
  onOpenLevelSelect,
  completedLevelsCount,
  totalLevels,
  isMuted,
  onToggleMute,
}) => {
  const [characterPose, setCharacterPose] = useState<'normal' | 'celebrate' | 'smug'>('normal');

  useEffect(() => {
    // Atmospheric character animation pulse
    const interval = setInterval(() => {
      setCharacterPose((prev) => (prev === 'normal' ? 'celebrate' : 'normal'));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <main
      className="relative w-full h-full min-h-screen bg-[#FFF2DC] flex flex-col justify-between items-center p-6 sm:p-10 select-none overflow-hidden"
      role="main"
      aria-label="Project Punchline Game Title"
    >
      {/* Top utility row */}
      <header className="w-full max-w-5xl flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#292833] text-[#FFD65A] font-black text-xs">
            PP
          </span>
          <span className="text-xs font-black tracking-widest uppercase text-[#292833]/80">
            Cartoon Reality Debugger
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playSelect();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="px-3 py-1.5 rounded-xl bg-[#292833]/10 hover:bg-[#292833]/20 text-[#292833] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'SOUND'}</span>
          </button>

          {completedLevelsCount > 0 && (
            <div className="bg-[#292833] text-[#FFF2DC] px-3 py-1.5 rounded-xl text-xs font-bold tabular-nums border-2 border-[#292833] shadow-sm">
              🏆 {completedLevelsCount} / {totalLevels} SOLVED
            </div>
          )}
        </div>
      </header>

      {/* Centerpiece Hero Section */}
      <div className="flex flex-col items-center justify-center max-w-3xl w-full text-center my-auto z-10">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="w-full max-w-xl mx-auto mb-6 transform hover:scale-[1.02] transition-transform duration-300">
          <svg viewBox="0 0 600 150" className="w-full h-auto drop-shadow-xl overflow-visible">
            <defs>
              <filter id="title_shadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="0" floodColor="#292833" />
              </filter>
            </defs>

            {/* "PROJECT" Kicker */}
            <text
              x="300"
              y="38"
              fill="#54C8D8"
              stroke="#292833"
              strokeWidth="5"
              paintOrder="stroke fill"
              fontSize="24"
              fontWeight="900"
              letterSpacing="6"
              textAnchor="middle"
            >
              PROJECT
            </text>

            {/* Main "PUNCHLINE" Logo */}
            <g filter="url(#title_shadow)">
              <text
                x="300"
                y="108"
                fill="#FF6B70"
                stroke="#292833"
                strokeWidth="12"
                strokeLinejoin="round"
                paintOrder="stroke fill"
                fontSize="68"
                fontWeight="950"
                letterSpacing="2"
                textAnchor="middle"
                className="font-black"
              >
                PUNCHLINE
              </text>
            </g>

            {/* Comic reality band crack */}
            <path
              d="M 120 70 L 150 78 L 190 68 L 220 75"
              stroke="#FFD65A"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 380 72 L 410 65 L 450 75 L 480 68"
              stroke="#FFD65A"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Tagline Promise */}
        <p className="text-base sm:text-xl font-black text-[#292833] max-w-lg mx-auto mb-6 leading-tight">
          One ridiculous situation. One clever fix.{' '}
          <span className="text-[#FF6B70]">One unexpected punchline.</span>
        </p>

        {/* Animated Hero Character Lineup Showcase */}
        <div className="flex items-end justify-center gap-2 sm:gap-6 mb-8 py-2">
          <div className="flex flex-col items-center">
            <RaccoonAvatar pose={characterPose} size={85} />
            <span className="text-[10px] font-black uppercase text-[#292833] mt-1">Raccoon</span>
          </div>
          <div className="flex flex-col items-center">
            <ToasterCEOAvatar pose={characterPose === 'celebrate' ? 'toast' : 'normal'} size={85} />
            <span className="text-[10px] font-black uppercase text-[#292833] mt-1">CEO</span>
          </div>
          <div className="flex flex-col items-center">
            <PigeonAvatar pose={characterPose} size={75} />
            <span className="text-[10px] font-black uppercase text-[#292833] mt-1">Pigeon</span>
          </div>
          <div className="flex flex-col items-center">
            <GoblinAvatar pose={characterPose} size={75} />
            <span className="text-[10px] font-black uppercase text-[#292833] mt-1">Intern</span>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
          <button
            data-start="true"
            data-testid="start-campaign-button"
            onClick={() => {
              sound.playSelect();
              onStartCampaign();
            }}
            aria-label="Start Campaign Mode"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#83D49B] hover:bg-[#6ee7b7] text-[#292833] border-4 border-[#292833] font-black text-lg sm:text-xl shadow-[0_6px_0_#292833] hover:shadow-[0_2px_0_#292833] hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>▶</span>
            <span>START CAMPAIGN</span>
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onOpenDailyChallenge();
            }}
            aria-label="Open Daily Challenge puzzle"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#FFD65A] hover:bg-yellow-300 text-[#292833] border-4 border-[#292833] font-black text-base shadow-[0_6px_0_#292833] hover:shadow-[0_2px_0_#292833] hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📅</span>
            <span>DAILY PUZZLE</span>
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onOpenLevelSelect();
            }}
            aria-label="Browse all campaign levels"
            className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-[#FFF2DC] hover:bg-white text-[#292833] border-4 border-[#292833] font-black text-base shadow-[0_6px_0_#292833] hover:shadow-[0_2px_0_#292833] hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🗺️</span>
            <span>LEVELS</span>
          </button>
        </div>
      </div>

      {/* Flat Bottom Control Hint Line */}
      <footer className="w-full text-center text-xs font-black text-[#292833]/70 tracking-wider py-2 border-t-2 border-[#292833]/10 z-10">
        Enter / Space to Start · 1 Swap · 2 Freeze · 3 Resize · Esc Pause
      </footer>
    </main>
  );
};
