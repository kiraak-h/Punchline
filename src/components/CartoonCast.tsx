import React from 'react';

interface CharacterProps {
  pose?: 'normal' | 'celebrate' | 'panic' | 'smug' | 'sleep' | 'toast';
  className?: string;
  size?: number;
}

/**
 * 4 Recurring Original Characters from the Project Punchline Bible:
 * 1. Raccoon Manager (Troublemaker, charcoal fur, office tie, striped tail)
 * 2. Toaster CEO (Chrome toaster body, serious suit tie, popping toast)
 * 3. NPC Pigeon (Round, chubby, big brows, clueless)
 * 4. Goblin Intern (Small, green, oversized ears, wide eyes)
 */

export const RaccoonAvatar: React.FC<CharacterProps> = ({ pose = 'normal', className = '', size = 80 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`overflow-visible transition-transform duration-300 ${className} ${
        pose === 'panic' ? 'animate-bounce' : pose === 'celebrate' ? 'scale-110' : ''
      }`}
    >
      <g transform="translate(0, 0)">
        {/* Striped Tail */}
        <path
          d="M 20 70 Q 5 75 8 90 Q 22 95 35 80 Z"
          fill="#3E3D4A"
          stroke="#292833"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M 12 75 Q 16 82 25 78" stroke="#D1D5DB" strokeWidth="4" fill="none" />
        <path d="M 10 85 Q 18 90 28 85" stroke="#D1D5DB" strokeWidth="4" fill="none" />

        {/* Body & Grey Suit */}
        <ellipse cx="50" cy="72" rx="26" ry="24" fill="#4B5563" stroke="#292833" strokeWidth="3.5" />
        {/* White chest fluff */}
        <path d="M 42 58 Q 50 72 58 58 Z" fill="#F3F4F6" />
        {/* Red Corporate Office Tie */}
        <polygon points="48,58 52,58 54,74 50,78 46,74" fill="#FF6B70" stroke="#292833" strokeWidth="2" />

        {/* Head */}
        <ellipse cx="50" cy="42" rx="28" ry="22" fill="#6B7280" stroke="#292833" strokeWidth="3.5" />

        {/* Ears */}
        <polygon points="26,30 32,15 42,26" fill="#3E3D4A" stroke="#292833" strokeWidth="3" />
        <polygon points="28,28 33,18 40,25" fill="#FF6B70" />
        <polygon points="74,30 68,15 58,26" fill="#3E3D4A" stroke="#292833" strokeWidth="3" />
        <polygon points="72,28 67,18 60,25" fill="#FF6B70" />

        {/* Bandit Mask */}
        <path
          d="M 24 40 Q 50 36 76 40 Q 72 50 50 48 Q 28 50 24 40 Z"
          fill="#292833"
          stroke="#292833"
          strokeWidth="2"
        />

        {/* Eyes */}
        {pose === 'sleep' ? (
          <>
            <path d="M 33 42 Q 40 46 43 42" stroke="#FFF2DC" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 57 42 Q 60 46 67 42" stroke="#FFF2DC" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        ) : pose === 'panic' ? (
          <>
            <circle cx="38" cy="42" r="6" fill="#FFF2DC" stroke="#292833" strokeWidth="2" />
            <circle cx="38" cy="42" r="2.5" fill="#ED6666" />
            <circle cx="62" cy="42" r="6" fill="#FFF2DC" stroke="#292833" strokeWidth="2" />
            <circle cx="62" cy="42" r="2.5" fill="#ED6666" />
          </>
        ) : (
          <>
            <circle cx="38" cy="41" r="5" fill="#FFF2DC" stroke="#292833" strokeWidth="1.5" />
            <circle cx={pose === 'smug' ? 40 : 38} cy="41" r="2.8" fill="#292833" />
            <circle cx="62" cy="41" r="5" fill="#FFF2DC" stroke="#292833" strokeWidth="1.5" />
            <circle cx={pose === 'smug' ? 64 : 62} cy="41" r="2.8" fill="#292833" />
            {/* Eye glint */}
            <circle cx="37" cy="40" r="1.2" fill="#FFFFFF" />
            <circle cx="61" cy="40" r="1.2" fill="#FFFFFF" />
          </>
        )}

        {/* Snout & Nose */}
        <ellipse cx="50" cy="49" rx="10" ry="7" fill="#F3F4F6" stroke="#292833" strokeWidth="2" />
        <ellipse cx="50" cy="46" rx="4" ry="2.5" fill="#292833" />

        {/* Mouth */}
        {pose === 'smug' ? (
          <path d="M 46 51 Q 52 54 57 49" stroke="#292833" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : pose === 'panic' ? (
          <ellipse cx="50" cy="52" rx="4" ry="5" fill="#ED6666" stroke="#292833" strokeWidth="1.5" />
        ) : (
          <path d="M 46 50 Q 50 54 54 50" stroke="#292833" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}

        {/* Whiskers */}
        <line x1="22" y1="48" x2="35" y2="49" stroke="#292833" strokeWidth="1.5" />
        <line x1="20" y1="52" x2="35" y2="52" stroke="#292833" strokeWidth="1.5" />
        <line x1="78" y1="48" x2="65" y2="49" stroke="#292833" strokeWidth="1.5" />
        <line x1="80" y1="52" x2="65" y2="52" stroke="#292833" strokeWidth="1.5" />
      </g>
    </svg>
  );
};

export const ToasterCEOAvatar: React.FC<CharacterProps> = ({ pose = 'normal', className = '', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`overflow-visible ${className}`}>
      <g>
        {/* Popped Toast (animated if toast or panic) */}
        <g
          className={`transition-transform duration-300 ${
            pose === 'toast' || pose === 'panic' ? '-translate-y-5 animate-pulse' : '-translate-y-1'
          }`}
        >
          <rect x="35" y="10" width="30" height="24" rx="4" fill="#D97706" stroke="#292833" strokeWidth="3" />
          <path d="M 38 18 Q 50 15 62 18" stroke="#FDE68A" strokeWidth="2" fill="none" />
          {/* Butter melting */}
          <rect x="46" y="14" width="8" height="6" rx="1.5" fill="#FFD65A" stroke="#292833" strokeWidth="1" />
        </g>

        {/* Toaster Body (Chrome/Silver) */}
        <rect
          x="22"
          y="28"
          width="56"
          height="48"
          rx="10"
          fill="#CBD5E1"
          stroke="#292833"
          strokeWidth="3.5"
        />
        {/* Chrome highlight */}
        <path d="M 28 32 L 32 32 L 32 70 L 28 70 Z" fill="#F1F5F9" opacity="0.8" />

        {/* Toast Slots */}
        <rect x="32" y="27" width="36" height="5" rx="2" fill="#1E293B" stroke="#292833" strokeWidth="2" />

        {/* Lever */}
        <line x1="78" y1="45" x2="86" y2="45" stroke="#292833" strokeWidth="4" strokeLinecap="round" />
        <circle cx="86" cy="45" r="4" fill="#FF6B70" stroke="#292833" strokeWidth="2" />

        {/* Executive Eyebrows and Eyes */}
        <line x1="33" y1="41" x2="43" y2="44" stroke="#292833" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="67" y1="41" x2="57" y2="44" stroke="#292833" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="39" cy="49" r="4" fill="#1E293B" />
        <circle cx="61" cy="49" r="4" fill="#1E293B" />
        <circle cx="40" cy="48" r="1.5" fill="#54C8D8" />
        <circle cx="62" cy="48" r="1.5" fill="#54C8D8" />

        {/* Strict Executive Mouth */}
        <line x1="44" y1="58" x2="56" y2="58" stroke="#292833" strokeWidth="3" strokeLinecap="round" />

        {/* Executive Blue Tie */}
        <polygon points="47,68 53,68 55,86 50,91 45,86" fill="#3B82F6" stroke="#292833" strokeWidth="2" />
        {/* Toaster Feet */}
        <rect x="28" y="76" width="8" height="6" rx="2" fill="#475569" stroke="#292833" strokeWidth="2" />
        <rect x="64" y="76" width="8" height="6" rx="2" fill="#475569" stroke="#292833" strokeWidth="2" />
      </g>
    </svg>
  );
};

export const PigeonAvatar: React.FC<CharacterProps> = ({ pose = 'normal', className = '', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`overflow-visible ${className}`}>
      <g>
        {/* Round Pigeon Body */}
        <ellipse cx="48" cy="56" rx="28" ry="24" fill="#9CA3AF" stroke="#292833" strokeWidth="3.5" />
        {/* Iridescent neck sheen */}
        <path d="M 40 44 Q 50 38 64 44 Q 58 54 40 50 Z" fill="#8665BB" opacity="0.6" />
        <path d="M 42 46 Q 52 40 62 46 Q 56 52 42 49 Z" fill="#83D49B" opacity="0.5" />

        {/* Wing */}
        <ellipse cx="40" cy="60" rx="16" ry="12" fill="#6B7280" stroke="#292833" strokeWidth="2.5" />

        {/* Head */}
        <circle cx="64" cy="36" r="16" fill="#9CA3AF" stroke="#292833" strokeWidth="3.5" />

        {/* Huge clueless eyes */}
        <circle cx="68" cy="32" r="7" fill="#FFD65A" stroke="#292833" strokeWidth="2" />
        <circle cx="69" cy="32" r="3.5" fill="#292833" />
        <circle cx="70" cy="31" r="1.2" fill="#FFFFFF" />

        {/* Big surprised eyebrow */}
        <path d="M 62 23 Q 69 19 76 24" stroke="#292833" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Tiny yellow beak */}
        <polygon points="78,34 90,38 78,42" fill="#F59E0B" stroke="#292833" strokeWidth="2" />

        {/* Tiny stick legs */}
        <line x1="42" y1="80" x2="42" y2="92" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        <line x1="42" y1="92" x2="48" y2="92" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        <line x1="56" y1="80" x2="56" y2="92" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        <line x1="56" y1="92" x2="62" y2="92" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export const GoblinAvatar: React.FC<CharacterProps> = ({ pose = 'normal', className = '', size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`overflow-visible ${className}`}>
      <g>
        {/* Goblin Big Pointy Ears */}
        <polygon points="26,42 6,30 24,56" fill="#83D49B" stroke="#292833" strokeWidth="3" />
        <polygon points="74,42 94,30 76,56" fill="#83D49B" stroke="#292833" strokeWidth="3" />
        <polygon points="24,44 12,35 22,52" fill="#6EE7B7" />
        <polygon points="76,44 88,35 78,52" fill="#6EE7B7" />

        {/* Body & Oversized Intern Lanyard */}
        <ellipse cx="50" cy="74" rx="20" ry="18" fill="#F59E0B" stroke="#292833" strokeWidth="3.5" />
        <rect x="44" y="74" width="12" height="15" rx="2" fill="#F8FAFC" stroke="#292833" strokeWidth="2" />
        <text x="50" y="83" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#292833">
          INTERN
        </text>

        {/* Head */}
        <ellipse cx="50" cy="45" rx="26" ry="22" fill="#83D49B" stroke="#292833" strokeWidth="3.5" />

        {/* Wide Googly Eyes */}
        <circle cx="38" cy="40" r="8" fill="#FFF2DC" stroke="#292833" strokeWidth="2.5" />
        <circle cx="39" cy="40" r="4" fill="#292833" />
        <circle cx="40" cy="39" r="1.5" fill="#FFFFFF" />

        <circle cx="62" cy="40" r="8" fill="#FFF2DC" stroke="#292833" strokeWidth="2.5" />
        <circle cx="61" cy="40" r="4" fill="#292833" />
        <circle cx="62" cy="39" r="1.5" fill="#FFFFFF" />

        {/* Big grinning or gasping mouth */}
        {pose === 'panic' ? (
          <ellipse cx="50" cy="54" rx="8" ry="7" fill="#292833" />
        ) : (
          <path d="M 38 52 Q 50 62 62 52" stroke="#292833" strokeWidth="3" fill="#ED6666" />
        )}
        {/* Cute Single Goblin Tooth */}
        <polygon points="46,52 50,52 48,56" fill="#FFF2DC" />
      </g>
    </svg>
  );
};
