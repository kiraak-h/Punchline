import React, { useState, useEffect, useRef } from 'react';
import { LevelDefinition, PatchAction, ResizeOption, SceneObject, ToolType } from '../game/types';
import { isCompatibleSwap, validatePatch } from '../game/logic';
import { sound } from '../game/audio';
import { RaccoonAvatar, ToasterCEOAvatar, PigeonAvatar, GoblinAvatar } from './CartoonCast';

interface CartoonStageProps {
  level: LevelDefinition;
  activeTool: ToolType | null;
  patch: PatchAction | null;
  onApplyPatch: (patch: PatchAction) => void;
  isRunning: boolean;
  onRunFinished: (success: boolean) => void;
  highlightTargetId?: string | null;
}

export const CartoonStage: React.FC<CartoonStageProps> = ({
  level,
  activeTool,
  patch,
  onApplyPatch,
  isRunning,
  onRunFinished,
  highlightTargetId,
}) => {
  const [swapSelectionA, setSwapSelectionA] = useState<string | null>(null);
  const [resizePickerTarget, setResizePickerTarget] = useState<SceneObject | null>(null);
  const [simProgress, setSimProgress] = useState(0);
  const [screenShake, setScreenShake] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [impactHappened, setImpactHappened] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const shakeRef = useRef<number>(0);

  const levelRef = useRef(level);
  const patchRef = useRef(patch);
  const onRunFinishedRef = useRef(onRunFinished);

  useEffect(() => {
    levelRef.current = level;
    patchRef.current = patch;
    onRunFinishedRef.current = onRunFinished;
  }, [level, patch, onRunFinished]);

  // Clear sub-selections when tool changes
  useEffect(() => {
    setSwapSelectionA(null);
    setResizePickerTarget(null);
  }, [activeTool]);

  // Reset simulation states when level changes
  useEffect(() => {
    setSwapSelectionA(null);
    setResizePickerTarget(null);
    setSimProgress(0);
    setScreenShake({ x: 0, y: 0 });
    setImpactHappened(false);
  }, [level.id]);

  // Run deterministic simulation loop when isRunning becomes true
  useEffect(() => {
    if (!isRunning) {
      setSimProgress(0);
      setScreenShake({ x: 0, y: 0 });
      setImpactHappened(false);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      return;
    }

    const activeLevel = levelRef.current;
    const activePatch = patchRef.current;

    // Start 60fps deterministic simulation loop
    sound.playRunStart();
    startTimeRef.current = performance.now();
    shakeRef.current = 0;
    setImpactHappened(false);

    const { success: isSuccess } = validatePatch(activeLevel, activePatch);

    const totalDuration = activeLevel.runDurationSec * 1000;
    let impactTriggered = false;

    const tick = (now: number) => {
      const elapsed = now - (startTimeRef.current || now);
      const rawProgress = Math.min(elapsed / totalDuration, 1.0);
      setSimProgress(rawProgress);

      // Trigger comedy impact crash at ~60% progress if failed
      if (!isSuccess && rawProgress >= 0.6 && !impactTriggered) {
        impactTriggered = true;
        setImpactHappened(true);
        sound.playImpactCrash();
        shakeRef.current = 14; // trigger screen shake
      }

      // Handle screen shake decay
      if (shakeRef.current > 0.5) {
        const angle = Math.random() * Math.PI * 2;
        setScreenShake({
          x: Math.cos(angle) * shakeRef.current,
          y: Math.sin(angle) * shakeRef.current,
        });
        shakeRef.current *= 0.88;
      } else {
        setScreenShake({ x: 0, y: 0 });
      }

      if (rawProgress < 1.0) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        // Finished
        onRunFinishedRef.current(isSuccess);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRunning]);

  // Object manipulation helpers
  const handleObjectClick = (obj: SceneObject) => {
    if (isRunning) return;

    if (activeTool === 'FREEZE') {
      if (!obj.canFreeze) return;
      sound.playToolSelect('FREEZE');
      sound.playPatchApplied();
      onApplyPatch({
        type: 'FREEZE',
        targetId: obj.id,
      });
    } else if (activeTool === 'RESIZE') {
      if (!obj.canResize) return;
      sound.playToolSelect('RESIZE');
      setResizePickerTarget(obj);
    } else if (activeTool === 'SWAP') {
      if (!obj.canSwap) return;
      if (!swapSelectionA) {
        // Select first item
        sound.playSelect();
        setSwapSelectionA(obj.id);
      } else {
        if (swapSelectionA === obj.id) {
          // Deselect
          sound.playSelect();
          setSwapSelectionA(null);
          return;
        }
        const objA = level.objects.find((o) => o.id === swapSelectionA);
        if (objA && isCompatibleSwap(objA, obj)) {
          sound.playToolSelect('SWAP');
          sound.playPatchApplied();
          onApplyPatch({
            type: 'SWAP',
            targetAId: objA.id,
            targetBId: obj.id,
          });
          setSwapSelectionA(null);
        } else {
          sound.playSelect();
          setSwapSelectionA(obj.id);
        }
      }
    }
  };

  const handleSelectResize = (size: ResizeOption) => {
    if (!resizePickerTarget) return;
    sound.playPatchApplied();
    onApplyPatch({
      type: 'RESIZE',
      targetId: resizePickerTarget.id,
      size,
    });
    setResizePickerTarget(null);
  };

  // Determine patched values for rendering
  const isTargetFrozen = (id: string) => {
    return patch?.type === 'FREEZE' && patch.targetId === id;
  };

  const getTargetScale = (id: string) => {
    if (patch?.type === 'RESIZE' && patch.targetId === id) {
      return patch.size === 'SMALL' ? 0.6 : 1.6;
    }
    return 1.0;
  };

  const getSwappedId = (id: string) => {
    if (patch?.type === 'SWAP') {
      if (patch.targetAId === id) return patch.targetBId;
      if (patch.targetBId === id) return patch.targetAId;
    }
    return id;
  };

  // Render specific level scenes
  return (
    <div
      className="relative w-full h-full select-none overflow-hidden bg-[#FFF2DC] flex items-center justify-center"
      style={{
        transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
        transition: 'transform 0.05s ease-out',
      }}
    >
      {/* SVG Canvas for cartoon scene */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full max-h-[85vh] drop-shadow-md"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="checkered_floor" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#E2E8F0" />
            <rect x="20" width="20" height="20" fill="#CBD5E1" />
            <rect y="20" width="20" height="20" fill="#CBD5E1" />
            <rect x="20" y="20" width="20" height="20" fill="#E2E8F0" />
          </pattern>
          <linearGradient id="wall_grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF2DC" />
            <stop offset="100%" stopColor="#FFE0B2" />
          </linearGradient>
          <linearGradient id="ice_grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#54C8D8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#E0F7FA" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Level Backgrounds */}
        <rect width="1000" height="420" fill="url(#wall_grad)" />
        <rect y="420" width="1000" height="180" fill="url(#checkered_floor)" />
        <line x1="0" y1="420" x2="1000" y2="420" stroke="#292833" strokeWidth="5" />

        {/* Specific Level Scenery & Mechanics */}
        {level.id === 1 && renderLevel1(simProgress, isTargetFrozen('mug'), getTargetScale('mug'), impactHappened)}
        {level.id === 2 && renderLevel2(simProgress, isTargetFrozen('pigeon'), impactHappened)}
        {level.id === 3 && renderLevel3(simProgress, getSwappedId('sign_active'), impactHappened)}
        {level.id === 4 && renderLevel4(simProgress, isTargetFrozen('fan'), impactHappened)}
        {level.id === 5 && renderLevel5(simProgress, getTargetScale('umbrella'), impactHappened)}
        {level.id === 6 && renderLevel6(simProgress, getSwappedId('parcel_cactus'), getSwappedId('parcel_pizza'), impactHappened)}
        {level.id === 7 && renderLevel7(simProgress, isTargetFrozen('cart'), impactHappened)}
        {level.id === 8 && renderLevel8(simProgress, getTargetScale('stool'), impactHappened)}
        {level.id === 9 && renderLevel9(simProgress, getSwappedId('chair_raccoon'), getSwappedId('chair_pigeon'), impactHappened)}
        {level.id === 10 && renderLevel10(simProgress, getSwappedId('tile_banana'), getSwappedId('tile_carpet'), impactHappened)}

        {/* Interactive Highlight Rings for Targets */}
        {!isRunning &&
          level.objects.map((obj) => {
            const isEligible =
              (activeTool === 'FREEZE' && obj.canFreeze) ||
              (activeTool === 'RESIZE' && obj.canResize) ||
              (activeTool === 'SWAP' && obj.canSwap);

            const isSelectedA = swapSelectionA === obj.id;
            const isHighlightedByHint = highlightTargetId === obj.id;

            if (!isEligible && !isHighlightedByHint) return null;

            return (
              <g
                key={obj.id}
                data-testid={`target-${obj.id}`}
                role="button"
                aria-label={`Select target ${obj.name}`}
                className="cursor-pointer group"
                onClick={() => handleObjectClick(obj)}
              >
                <circle
                  cx={obj.x * 10}
                  cy={obj.y * 6}
                  r="45"
                  fill={isSelectedA ? '#FF6B70' : '#54C8D8'}
                  fillOpacity="0.25"
                  stroke={isSelectedA ? '#FF6B70' : isHighlightedByHint ? '#FFD65A' : '#54C8D8'}
                  strokeWidth="4"
                  strokeDasharray="8 6"
                  className="transition-all hover:scale-105"
                />
                <rect
                  x={obj.x * 10 - 45}
                  y={obj.y * 6 - 55}
                  width="90"
                  height="26"
                  rx="6"
                  fill="#292833"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={obj.x * 10}
                  y={obj.y * 6 - 38}
                  fill="#FFF2DC"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {isSelectedA ? 'SELECTED' : activeTool || 'TARGET'}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Resize Picker Floating Popover */}
      {resizePickerTarget && !isRunning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-[#292833] border-4 border-[#FFD65A] rounded-2xl p-5 shadow-2xl text-center max-w-sm">
          <h3 className="text-xl font-black text-[#FFF2DC] mb-1">RESIZE OBJECT</h3>
          <p className="text-xs text-[#CBD5E1] mb-4">Choose target scale for {resizePickerTarget.name}:</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleSelectResize('SMALL')}
              className="px-5 py-3 rounded-xl bg-[#54C8D8] hover:bg-[#38b2c2] text-[#292833] font-black text-sm transition-all transform hover:scale-105 shadow-md flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="text-lg">🔎 SMALL</span>
              <span className="text-xs opacity-80">(0.6× Scale)</span>
            </button>
            <button
              onClick={() => handleSelectResize('LARGE')}
              className="px-5 py-3 rounded-xl bg-[#FF6B70] hover:bg-[#fa555b] text-[#FFF2DC] font-black text-sm transition-all transform hover:scale-105 shadow-md flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="text-lg">🐘 LARGE</span>
              <span className="text-xs opacity-80">(1.6× Scale)</span>
            </button>
          </div>
          <button
            onClick={() => setResizePickerTarget(null)}
            className="mt-4 text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Freeze indicator badge overlay */}
      {patch?.type === 'FREEZE' && (
        <div className="absolute top-4 left-4 bg-[#54C8D8]/90 border-2 border-[#292833] px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm pointer-events-none">
          <span className="text-lg">❄️</span>
          <span className="text-xs font-black text-[#292833] uppercase">Object Frozen in Place</span>
        </div>
      )}

      {/* Resize indicator badge overlay */}
      {patch?.type === 'RESIZE' && (
        <div className="absolute top-4 left-4 bg-[#FFD65A]/90 border-2 border-[#292833] px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm pointer-events-none">
          <span className="text-lg">📐</span>
          <span className="text-xs font-black text-[#292833] uppercase">
            Resized to {patch.size} ({patch.size === 'SMALL' ? '0.6×' : '1.6×'})
          </span>
        </div>
      )}

      {/* Swap indicator badge overlay */}
      {patch?.type === 'SWAP' && (
        <div className="absolute top-4 left-4 bg-[#FF6B70]/90 border-2 border-[#292833] px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm pointer-events-none">
          <span className="text-lg">🔄</span>
          <span className="text-xs font-black text-[#FFF2DC] uppercase">Positions Swapped</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// SCENE RENDERERS (Deterministic animations)
// ==========================================

function renderLevel1(
  t: number,
  isMugFrozen: boolean,
  mugScale: number,
  impact: boolean
) {
  // Robot starts at x=180, heads to x=720 (CEO desk). Doorway is at x=550 (clearance 72u).
  // If mug is small (scale 0.6 => width ~65), it fits! If normal (width 108) or large (173), it hits doorway at x=520.
  const fitsThrough = mugScale <= 0.8;
  const stopX = fitsThrough ? 720 : 510;
  const currentX = 180 + (stopX - 180) * (fitsThrough ? t : Math.min(t / 0.6, 1.0));
  const robotBounce = Math.sin(t * 20) * (t < 0.95 ? 4 : 0);

  return (
    <g>
      {/* Wall Decor & Office Sign */}
      <rect x="680" y="80" width="180" height="50" rx="8" fill="#292833" />
      <text x="770" y="112" fill="#FFD65A" fontSize="16" fontWeight="bold" textAnchor="middle">
        CEO SUITE
      </text>

      {/* Office Doorway (Width: 30, Height: 240) */}
      <g transform="translate(560, 200)">
        <rect x="0" y="0" width="35" height="230" fill="#475569" stroke="#292833" strokeWidth="4" />
        <rect x="0" y="0" width="35" height="20" fill="#334155" />
        <text x="17" y="115" fill="#FFF2DC" fontSize="11" fontWeight="bold" textAnchor="middle" transform="rotate(-90 17 115)">
          CLEARANCE: 72u
        </text>
      </g>

      {/* Toaster CEO at Desk */}
      <g transform="translate(750, 310)">
        {/* CEO Desk */}
        <rect x="-40" y="90" width="160" height="60" rx="4" fill="#854D0E" stroke="#292833" strokeWidth="4" />
        {/* Coaster */}
        <circle cx="20" cy="90" r="18" fill="#F8FAFC" stroke="#292833" strokeWidth="2" />
        <foreignObject x="30" y="0" width="100" height="100">
          <ToasterCEOAvatar pose={fitsThrough && t > 0.85 ? 'toast' : impact ? 'panic' : 'normal'} size={90} />
        </foreignObject>
      </g>

      {/* Delivery Robot carrying Coffee Mug */}
      <g transform={`translate(${currentX}, ${360 + robotBounce})`}>
        {/* Robot Body */}
        <rect x="-40" y="20" width="80" height="70" rx="12" fill="#54C8D8" stroke="#292833" strokeWidth="4" />
        {/* Screen Eyes */}
        <rect x="-28" y="32" width="56" height="25" rx="6" fill="#1E293B" stroke="#292833" strokeWidth="2" />
        {impact ? (
          <>
            <text x="-12" y="50" fill="#EF4444" fontSize="16" fontWeight="black">✕</text>
            <text x="12" y="50" fill="#EF4444" fontSize="16" fontWeight="black">✕</text>
          </>
        ) : (
          <>
            <circle cx="-12" cy="44" r="5" fill="#FFD65A" />
            <circle cx="12" cy="44" r="5" fill="#FFD65A" />
          </>
        )}
        {/* Treads */}
        <rect x="-45" y="85" width="90" height="18" rx="8" fill="#334155" stroke="#292833" strokeWidth="3" />
        <circle cx="-30" cy="94" r="5" fill="#94A3B8" />
        <circle cx="0" cy="94" r="5" fill="#94A3B8" />
        <circle cx="30" cy="94" r="5" fill="#94A3B8" />

        {/* Coffee Mug on Robot Tray */}
        <g
          transform={`translate(0, 15) scale(${mugScale})`}
          className="transition-transform duration-300"
        >
          {/* Coffee Mug Cup */}
          <rect x="-35" y="-60" width="70" height="60" rx="6" fill="#FF6B70" stroke="#292833" strokeWidth="4" />
          {/* Mug Handle */}
          <path d="M 35 -50 Q 55 -30 35 -10" stroke="#292833" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Coffee Steam */}
          <path d="M -15 -75 Q -5 -85 -10 -95" stroke="#94A3B8" strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M 10 -75 Q 20 -85 15 -95" stroke="#94A3B8" strokeWidth="3" fill="none" opacity="0.6" />
          {/* Mug Label */}
          <text x="0" y="-25" fill="#FFF2DC" fontSize="12" fontWeight="bold" textAnchor="middle">
            COFFEE
          </text>
        </g>
      </g>

      {/* Spill Splat if crashed */}
      {impact && (
        <g transform="translate(560, 430)">
          <ellipse cx="0" cy="0" rx="60" ry="20" fill="#78350F" />
          <circle cx="40" cy="-10" r="10" fill="#78350F" />
          <circle cx="-50" cy="10" r="14" fill="#78350F" />
          <text x="0" y="-30" fill="#ED6666" fontSize="24" fontWeight="black" textAnchor="middle">
            *SPLOOOSH!*
          </text>
        </g>
      )}
    </g>
  );
}

function renderLevel2(t: number, isPigeonFrozen: boolean, impact: boolean) {
  // Pigeon starts on overhead pipe at x=250, y=140.
  // Alarm lever is at x=620, y=280. CEO is presenting chart at x=780.
  const pigeonX = isPigeonFrozen ? 250 : 250 + (600 - 250) * Math.min(t / 0.7, 1.0);
  const pigeonY = isPigeonFrozen ? 140 : 140 + (260 - 140) * Math.min(t / 0.7, 1.0);
  const alarmPulled = !isPigeonFrozen && t >= 0.7;

  return (
    <g>
      {/* Overhead Pipe */}
      <rect x="100" y="160" width="300" height="15" rx="4" fill="#64748B" stroke="#292833" strokeWidth="3" />

      {/* Alarm Wall Box */}
      <g transform="translate(620, 240)">
        <rect x="-35" y="-10" width="70" height="90" rx="8" fill="#DC2626" stroke="#292833" strokeWidth="4" />
        <text x="0" y="15" fill="#FFFFFF" fontSize="11" fontWeight="black" textAnchor="middle">
          ALARM
        </text>
        {/* Switch Lever */}
        <line
          x1="0"
          y1="35"
          x2={alarmPulled ? 30 : -20}
          y2={alarmPulled ? 65 : 20}
          stroke="#292833"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle
          cx={alarmPulled ? 30 : -20}
          cy={alarmPulled ? 65 : 20}
          r="8"
          fill="#FFD65A"
          stroke="#292833"
          strokeWidth="2"
        />
      </g>

      {/* Sirens flashing if alarm pulled */}
      {alarmPulled && (
        <g transform="translate(620, 160)">
          <circle cx="0" cy="0" r="30" fill="#EF4444" fillOpacity="0.4" className="animate-ping" />
          <polygon points="-25,10 0,-30 25,10" fill="#EF4444" stroke="#292833" strokeWidth="3" />
          <text x="0" y="-40" fill="#EF4444" fontSize="22" fontWeight="black" textAnchor="middle">
            WEE-WOO!
          </text>
        </g>
      )}

      {/* Presentation Chart & Toaster CEO */}
      <g transform="translate(760, 260)">
        {/* Presentation Board */}
        <rect x="0" y="-20" width="130" height="90" rx="6" fill="#F8FAFC" stroke="#292833" strokeWidth="4" />
        <polyline points="20,50 50,35 80,40 110,10" fill="none" stroke="#10B981" strokeWidth="4" />
        <polygon points="110,6 116,16 104,14" fill="#10B981" />
        <text x="65" y="-5" fill="#292833" fontSize="12" fontWeight="bold" textAnchor="middle">
          PROFITS ▲
        </text>

        {/* CEO */}
        <foreignObject x="30" y="60" width="100" height="100">
          <ToasterCEOAvatar pose={alarmPulled ? 'panic' : isPigeonFrozen && t > 0.8 ? 'toast' : 'normal'} size={95} />
        </foreignObject>
      </g>

      {/* Pigeon */}
      <g transform={`translate(${pigeonX}, ${pigeonY})`}>
        {isPigeonFrozen && (
          <g transform="translate(-15, -20)">
            <rect x="-30" y="-30" width="100" height="90" rx="16" fill="url(#ice_grad)" stroke="#54C8D8" strokeWidth="3" opacity="0.8" />
            <text x="20" y="70" fill="#0284C7" fontSize="14" fontWeight="black" textAnchor="middle">
              FROZEN ❄️
            </text>
          </g>
        )}
        <foreignObject x="-40" y="-40" width="80" height="80">
          <PigeonAvatar pose={isPigeonFrozen ? 'normal' : 'panic'} size={75} />
        </foreignObject>
      </g>
    </g>
  );
}

function renderLevel3(t: number, activeSignId: string, impact: boolean) {
  // If activeSignId is 'sign_spare' (the charging sign), robot turns UP to charging dock at x=800, y=260.
  // If activeSignId is 'sign_active' (the recycle sign), robot turns DOWN into recycling bin at x=800, y=480.
  const isCharging = activeSignId === 'sign_spare';
  const progress = Math.min(t, 1.0);
  let rx = 150;
  let ry = 420;

  if (progress < 0.45) {
    rx = 150 + (480 - 150) * (progress / 0.45);
    ry = 420;
  } else {
    const sub = (progress - 0.45) / 0.55;
    rx = 480 + (800 - 480) * sub;
    ry = isCharging ? 420 - 140 * sub : 420 + 70 * sub;
  }

  return (
    <g>
      {/* Route lines */}
      <path d="M 150 420 L 480 420 L 780 280" stroke="#54C8D8" strokeWidth="8" strokeDasharray="12 8" fill="none" />
      <path d="M 480 420 L 780 490" stroke="#EF4444" strokeWidth="8" strokeDasharray="12 8" fill="none" />

      {/* Charging Dock */}
      <g transform="translate(800, 270)">
        <rect x="-40" y="-40" width="80" height="90" rx="10" fill="#10B981" stroke="#292833" strokeWidth="4" />
        <text x="0" y="5" fill="#FFFFFF" fontSize="24" fontWeight="black" textAnchor="middle">
          ⚡
        </text>
        <text x="0" y="32" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
          CHARGER
        </text>
      </g>

      {/* Recycling Bin */}
      <g transform="translate(800, 480)">
        <rect x="-45" y="-35" width="90" height="85" rx="8" fill="#475569" stroke="#292833" strokeWidth="4" />
        <text x="0" y="5" fill="#CBD5E1" fontSize="26" textAnchor="middle">
          🗑️
        </text>
        <text x="0" y="32" fill="#ED6666" fontSize="11" fontWeight="black" textAnchor="middle">
          CRUSHER
        </text>
      </g>

      {/* Sign Junction Socket (Active) */}
      <g transform="translate(480, 310)">
        <rect x="-10" y="40" width="20" height="70" fill="#64748B" stroke="#292833" strokeWidth="3" />
        <rect x="-55" y="-10" width="110" height="55" rx="8" fill={isCharging ? '#10B981' : '#EF4444'} stroke="#292833" strokeWidth="4" />
        <text x="0" y="24" fill="#FFFFFF" fontSize="14" fontWeight="black" textAnchor="middle">
          {isCharging ? '⚡ CHARGE ➔' : '🗑️ RECYCLE ➔'}
        </text>
      </g>

      {/* Spare Rack Socket */}
      <g transform="translate(180, 220)">
        <rect x="-50" y="-10" width="100" height="50" rx="8" fill={!isCharging ? '#10B981' : '#EF4444'} stroke="#292833" strokeWidth="3" opacity="0.8" />
        <text x="0" y="22" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">
          {!isCharging ? '⚡ SPARE' : '🗑️ SPARE'}
        </text>
        <text x="0" y="-18" fill="#64748B" fontSize="11" fontWeight="bold" textAnchor="middle">
          UTILITY RACK
        </text>
      </g>

      {/* Delivery Robot */}
      <g transform={`translate(${rx}, ${ry})`}>
        <rect x="-35" y="-30" width="70" height="60" rx="10" fill="#54C8D8" stroke="#292833" strokeWidth="4" />
        <circle cx="-12" cy="-10" r="4" fill="#FFD65A" />
        <circle cx="12" cy="-10" r="4" fill="#FFD65A" />
        <text x="0" y="16" fill="#1E293B" fontSize="10" fontWeight="black" textAnchor="middle">
          {isCharging && progress > 0.8 ? '100% ⚡' : '5% 🪫'}
        </text>
      </g>

      {/* Crash particles if recycled */}
      {impact && (
        <g transform="translate(800, 480)">
          <text x="0" y="-50" fill="#ED6666" fontSize="24" fontWeight="black" textAnchor="middle">
            *CRUNCH!*
          </text>
        </g>
      )}
    </g>
  );
}

function renderLevel4(t: number, isFanFrozen: boolean, impact: boolean) {
  // Desk extends x=200 to x=850. Fan at x=200. Contract starts at x=450. Shredder at x=820.
  // If fan is not frozen, wind lines appear and contract slides right to x=820.
  const windActive = !isFanFrozen;
  const paperX = isFanFrozen ? 450 : 450 + (820 - 450) * Math.min(t / 0.7, 1.0);

  return (
    <g>
      {/* Desk */}
      <rect x="180" y="380" width="670" height="40" rx="6" fill="#B45309" stroke="#292833" strokeWidth="4" />

      {/* Fan */}
      <g transform="translate(220, 310)">
        <ellipse cx="0" cy="70" rx="35" ry="10" fill="#475569" stroke="#292833" strokeWidth="3" />
        <line x1="0" y1="70" x2="0" y2="10" stroke="#292833" strokeWidth="6" />
        {/* Fan Housing */}
        <circle cx="0" cy="0" r="45" fill="#E2E8F0" stroke="#292833" strokeWidth="4" />
        {/* Fan Blades (spins if not frozen) */}
        <g className={windActive ? 'animate-spin origin-center' : ''}>
          <polygon points="0,0 -15,-35 15,-35" fill="#3B82F6" />
          <polygon points="0,0 -35,15 -35,-15" fill="#3B82F6" />
          <polygon points="0,0 15,35 -15,35" fill="#3B82F6" />
          <polygon points="0,0 35,-15 35,15" fill="#3B82F6" />
        </g>
        {isFanFrozen && (
          <g transform="translate(-40, -40)">
            <rect width="80" height="80" rx="12" fill="url(#ice_grad)" stroke="#54C8D8" strokeWidth="3" opacity="0.8" />
            <text x="40" y="95" fill="#0284C7" fontSize="12" fontWeight="black" textAnchor="middle">
              FROZEN ❄️
            </text>
          </g>
        )}
      </g>

      {/* Wind airflow lines */}
      {windActive && (
        <g stroke="#94A3B8" strokeWidth="3" strokeDasharray="16 8" opacity="0.8">
          <line x1="280" y1="280" x2="680" y2="280" />
          <line x1="290" y1="310" x2="720" y2="310" />
          <line x1="280" y1="340" x2="680" y2="340" />
        </g>
      )}

      {/* Paper Contract */}
      <g transform={`translate(${paperX}, 350) rotate(${windActive ? (t * 40) % 20 : 0})`}>
        <rect x="-30" y="-40" width="60" height="70" rx="3" fill="#FFFFFF" stroke="#292833" strokeWidth="2.5" />
        <line x1="-20" y1="-25" x2="20" y2="-25" stroke="#CBD5E1" strokeWidth="3" />
        <line x1="-20" y1="-12" x2="20" y2="-12" stroke="#CBD5E1" strokeWidth="3" />
        <line x1="-20" y1="2" x2="10" y2="2" stroke="#CBD5E1" strokeWidth="3" />
        <circle cx="12" cy="18" r="6" fill="#FF6B70" />
        <text x="0" y="-30" fill="#292833" fontSize="8" fontWeight="bold" textAnchor="middle">
          CONTRACT
        </text>
      </g>

      {/* Paper Shredder */}
      <g transform="translate(820, 310)">
        <rect x="-40" y="0" width="80" height="70" rx="8" fill="#334155" stroke="#292833" strokeWidth="4" />
        <rect x="-30" y="-5" width="60" height="8" rx="2" fill="#0F172A" />
        <text x="0" y="40" fill="#EF4444" fontSize="12" fontWeight="black" textAnchor="middle">
          SHREDDER
        </text>
        {impact && (
          <g transform="translate(0, -30)">
            <text x="0" y="0" fill="#ED6666" fontSize="22" fontWeight="black" textAnchor="middle">
              *SHRED!*
            </text>
            {/* Confetti paper strips */}
            <line x1="-20" y1="10" x2="-25" y2="-10" stroke="#FFF" strokeWidth="4" />
            <line x1="0" y1="10" x2="5" y2="-15" stroke="#FFF" strokeWidth="4" />
            <line x1="20" y1="10" x2="22" y2="-8" stroke="#FFF" strokeWidth="4" />
          </g>
        )}
      </g>

      {/* Raccoon Manager */}
      <g transform="translate(100, 310)">
        <foreignObject x="-40" y="-40" width="90" height="90">
          <RaccoonAvatar pose={isFanFrozen && t > 0.8 ? 'celebrate' : impact ? 'panic' : 'normal'} size={85} />
        </foreignObject>
      </g>
    </g>
  );
}

function renderLevel5(t: number, umbrellaScale: number, impact: boolean) {
  // Rain storm street. Umbrella scale: 1.0 (70u coverage), 1.6 (112u coverage).
  // Need >= 1.4 scale to protect both Raccoon & Goblin!
  const isProtected = umbrellaScale >= 1.4;
  const progress = Math.min(t, 1.0);
  const charX = 260 + (650 - 260) * progress;

  return (
    <g>
      {/* Dark Rain Clouds */}
      <g fill="#64748B" opacity="0.85">
        <circle cx="200" cy="80" r="60" />
        <circle cx="280" cy="65" r="75" />
        <circle cx="380" cy="80" r="65" />
        <circle cx="500" cy="70" r="70" />
        <circle cx="620" cy="80" r="60" />
      </g>

      {/* Falling Rain streaks */}
      <g stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
        {[150, 220, 290, 360, 440, 520, 600, 680, 750].map((rx, idx) => (
          <line
            key={idx}
            x1={rx}
            y1={140 + ((idx * 30 + t * 400) % 300)}
            x2={rx - 15}
            y2={180 + ((idx * 30 + t * 400) % 300)}
          />
        ))}
      </g>

      {/* Waiting Yellow Taxi */}
      <g transform="translate(780, 360)">
        <rect x="-80" y="20" width="160" height="70" rx="14" fill="#FACC15" stroke="#292833" strokeWidth="4" />
        {/* Cab Top */}
        <polygon points="-50,20 -30,-15 30,-15 50,20" fill="#FDE047" stroke="#292833" strokeWidth="3" />
        {/* Taxi Checker Sign */}
        <rect x="-25" y="-30" width="50" height="15" rx="3" fill="#292833" />
        <text x="0" y="-19" fill="#FACC15" fontSize="10" fontWeight="black" textAnchor="middle">
          TAXI
        </text>
        {/* Wheels */}
        <circle cx="-45" cy="90" r="20" fill="#1E293B" stroke="#292833" strokeWidth="3" />
        <circle cx="45" cy="90" r="20" fill="#1E293B" stroke="#292833" strokeWidth="3" />
      </g>

      {/* Walking Characters under Umbrella */}
      <g transform={`translate(${charX}, 340)`}>
        {/* Umbrella */}
        <g
          transform={`translate(0, -60) scale(${umbrellaScale})`}
          className="transition-transform duration-300"
        >
          {/* Canopy */}
          <path d="M -50 0 Q 0 -50 50 0 Z" fill="#FF6B70" stroke="#292833" strokeWidth="3.5" />
          <line x1="0" y1="0" x2="0" y2="45" stroke="#292833" strokeWidth="3.5" />
          <path d="M 0 45 Q 8 55 12 48" stroke="#292833" strokeWidth="3.5" fill="none" />
          <text x="0" y="-15" fill="#FFF2DC" fontSize="10" fontWeight="bold" textAnchor="middle">
            {umbrellaScale >= 1.4 ? '112u' : '70u'}
          </text>
        </g>

        {/* Characters side by side */}
        <foreignObject x="-55" y="-10" width="70" height="70">
          <RaccoonAvatar pose={isProtected ? 'smug' : impact ? 'panic' : 'normal'} size={65} />
        </foreignObject>
        <foreignObject x="0" y="-5" width="65" height="65">
          <GoblinAvatar pose={isProtected ? 'normal' : impact ? 'panic' : 'normal'} size={60} />
        </foreignObject>

        {/* Wet Splash if failed */}
        {impact && (
          <g transform="translate(0, -20)">
            <text x="0" y="-20" fill="#0284C7" fontSize="22" fontWeight="black" textAnchor="middle">
              *SOAKED!*
            </text>
          </g>
        )}
      </g>
    </g>
  );
}

function renderLevel6(t: number, laneAItemId: string, laneBItemId: string, impact: boolean) {
  // Lane A (top) leads to Café. Lane B (bottom) leads to Plant Shop.
  // Correct match: Pizza goes to Café, Cactus goes to Plant Shop.
  // laneAItemId starts as 'parcel_cactus', laneBItemId starts as 'parcel_pizza'.
  const isLaneACorrect = laneAItemId === 'parcel_pizza';
  const progress = Math.min(t, 1.0);
  const px = 220 + (680 - 220) * progress;

  return (
    <g>
      {/* Conveyor Lane A */}
      <g transform="translate(450, 240)">
        <rect x="-300" y="0" width="600" height="25" fill="#475569" stroke="#292833" strokeWidth="3" />
        <text x="-260" y="-10" fill="#292833" fontSize="13" fontWeight="bold">
          LANE A (➔ CAFÉ)
        </text>
      </g>

      {/* Conveyor Lane B */}
      <g transform="translate(450, 420)">
        <rect x="-300" y="0" width="600" height="25" fill="#475569" stroke="#292833" strokeWidth="3" />
        <text x="-260" y="-10" fill="#292833" fontSize="13" fontWeight="bold">
          LANE B (➔ BOTANICAL PLANT SHOP)
        </text>
      </g>

      {/* Café Destination */}
      <g transform="translate(850, 240)">
        <rect x="-50" y="-60" width="100" height="90" rx="10" fill="#EA580C" stroke="#292833" strokeWidth="4" />
        <text x="0" y="-15" fill="#FFFFFF" fontSize="26" textAnchor="middle">
          👨‍🍳
        </text>
        <text x="0" y="15" fill="#FFFFFF" fontSize="13" fontWeight="black" textAnchor="middle">
          CAFÉ
        </text>
      </g>

      {/* Plant Shop Destination */}
      <g transform="translate(850, 420)">
        <rect x="-50" y="-60" width="100" height="90" rx="10" fill="#16A34A" stroke="#292833" strokeWidth="4" />
        <text x="0" y="-15" fill="#FFFFFF" fontSize="26" textAnchor="middle">
          🌿
        </text>
        <text x="0" y="15" fill="#FFFFFF" fontSize="13" fontWeight="black" textAnchor="middle">
          PLANTS
        </text>
      </g>

      {/* Item on Lane A */}
      <g transform={`translate(${px}, 215)`}>
        {laneAItemId === 'parcel_pizza' ? renderPizzaBox() : renderCactusPot()}
      </g>

      {/* Item on Lane B */}
      <g transform={`translate(${px}, 395)`}>
        {laneBItemId === 'parcel_pizza' ? renderPizzaBox() : renderCactusPot()}
      </g>

      {impact && (
        <g transform="translate(850, 240)">
          <text x="0" y="-80" fill="#ED6666" fontSize="22" fontWeight="black" textAnchor="middle">
            *OUCH!*
          </text>
        </g>
      )}
    </g>
  );
}

function renderPizzaBox() {
  return (
    <g>
      <rect x="-35" y="-25" width="70" height="50" rx="4" fill="#FEF08A" stroke="#292833" strokeWidth="3" />
      <polygon points="0,-15 15,10 -15,10" fill="#EF4444" stroke="#292833" strokeWidth="2" />
      <circle cx="-2" cy="0" r="3" fill="#FEF08A" />
      <circle cx="5" cy="5" r="3" fill="#FEF08A" />
      <text x="0" y="20" fill="#B91C1C" fontSize="10" fontWeight="black" textAnchor="middle">
        PIZZA 🍕
      </text>
    </g>
  );
}

function renderCactusPot() {
  return (
    <g>
      <polygon points="-20,20 20,20 15,-5 -15,-5" fill="#EA580C" stroke="#292833" strokeWidth="3" />
      {/* Cactus Body */}
      <ellipse cx="0" cy="-25" rx="16" ry="24" fill="#22C55E" stroke="#292833" strokeWidth="3" />
      {/* Prickles */}
      <line x1="-12" y1="-30" x2="-22" y2="-32" stroke="#292833" strokeWidth="2" />
      <line x1="12" y1="-25" x2="22" y2="-22" stroke="#292833" strokeWidth="2" />
      <text x="0" y="32" fill="#15803D" fontSize="10" fontWeight="black" textAnchor="middle">
        CACTUS 🌵
      </text>
    </g>
  );
}

function renderLevel7(t: number, isCartFrozen: boolean, impact: boolean) {
  // Supermarket ramp: cart starts at x=250, y=260. Slides down to cake display at x=800, y=440.
  const progress = isCartFrozen ? 0 : Math.min(t / 0.65, 1.0);
  const cartX = 250 + (780 - 250) * progress;
  const cartY = 260 + (430 - 260) * progress;

  return (
    <g>
      {/* Ramp Incline */}
      <polygon points="180,310 820,490 820,530 180,530" fill="#CBD5E1" stroke="#292833" strokeWidth="4" />
      <line x1="180" y1="310" x2="820" y2="490" stroke="#94A3B8" strokeWidth="4" strokeDasharray="12 6" />

      {/* Cashier at top */}
      <g transform="translate(140, 240)">
        <rect x="-25" y="30" width="50" height="70" rx="8" fill="#3B82F6" stroke="#292833" strokeWidth="3" />
        <circle cx="0" cy="15" r="18" fill="#FDE047" stroke="#292833" strokeWidth="3" />
        <text x="0" y="115" fill="#292833" fontSize="11" fontWeight="bold" textAnchor="middle">
          CLERK
        </text>
      </g>

      {/* 5-Tier Royal Wedding Cake */}
      <g transform="translate(820, 390)">
        <rect x="-55" y="60" width="110" height="30" rx="4" fill="#F8FAFC" stroke="#292833" strokeWidth="3" />
        <rect x="-45" y="30" width="90" height="30" rx="4" fill="#FECDD3" stroke="#292833" strokeWidth="3" />
        <rect x="-35" y="5" width="70" height="25" rx="4" fill="#F8FAFC" stroke="#292833" strokeWidth="3" />
        <rect x="-25" y="-15" width="50" height="20" rx="4" fill="#FECDD3" stroke="#292833" strokeWidth="3" />
        <circle cx="0" cy="-22" r="8" fill="#EF4444" stroke="#292833" strokeWidth="2" />
        <text x="0" y="105" fill="#E11D48" fontSize="12" fontWeight="black" textAnchor="middle">
          $2,000 CAKE 🎂
        </text>
      </g>

      {/* Shopping Cart */}
      <g transform={`translate(${cartX}, ${cartY}) rotate(${isCartFrozen ? 0 : progress * 5})`}>
        {/* Cart Wire Basket */}
        <polygon points="-35,-20 35,-20 25,20 -25,20" fill="none" stroke="#292833" strokeWidth="4" />
        <line x1="-15" y1="-20" x2="-10" y2="20" stroke="#64748B" strokeWidth="2" />
        <line x1="5" y1="-20" x2="10" y2="20" stroke="#64748B" strokeWidth="2" />
        {/* Wheels */}
        <circle cx="-20" cy="25" r="7" fill="#475569" stroke="#292833" strokeWidth="2" />
        <circle cx="20" cy="25" r="7" fill="#475569" stroke="#292833" strokeWidth="2" />

        {isCartFrozen && (
          <g transform="translate(-45, -40)">
            <rect width="90" height="75" rx="12" fill="url(#ice_grad)" stroke="#54C8D8" strokeWidth="3" opacity="0.8" />
            <text x="45" y="90" fill="#0284C7" fontSize="12" fontWeight="black" textAnchor="middle">
              FROZEN ❄️
            </text>
          </g>
        )}
      </g>

      {/* Cake Explosion if crashed */}
      {impact && (
        <g transform="translate(820, 420)">
          <text x="0" y="-60" fill="#ED6666" fontSize="28" fontWeight="black" textAnchor="middle">
            *SPLATTT!*
          </text>
          <ellipse cx="0" cy="0" rx="70" ry="25" fill="#FECDD3" />
        </g>
      )}
    </g>
  );
}

function renderLevel8(t: number, stoolScale: number, impact: boolean) {
  // Stool at x=520, y=420. Elevator button at x=600, y=280.
  // Large stool (scale 1.6) allows cat to reach the button!
  const reachesButton = stoolScale >= 1.4;
  const progress = Math.min(t, 1.0);
  const catLeap = Math.sin(progress * Math.PI) * 50;

  return (
    <g>
      {/* Elevator Doors */}
      <g transform="translate(740, 260)">
        <rect x="-80" y="0" width="160" height="200" fill="#94A3B8" stroke="#292833" strokeWidth="5" />
        <line x1="0" y1="0" x2="0" y2="200" stroke="#292833" strokeWidth="4" />
        {/* Elevator Floor Arrow */}
        <polygon points="-10,-20 10,-20 0,-35" fill="#10B981" />
      </g>

      {/* Call Button Box */}
      <g transform="translate(620, 270)">
        <rect x="-18" y="-25" width="36" height="50" rx="6" fill="#1E293B" stroke="#292833" strokeWidth="3" />
        <circle cx="0" cy="0" r="10" fill={reachesButton && progress > 0.6 ? '#10B981' : '#EF4444'} stroke="#FFFFFF" strokeWidth="2" />
        <text x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
          {reachesButton && progress > 0.6 ? 'ON' : 'HOLD'}
        </text>
      </g>

      {/* Step Stool */}
      <g
        transform={`translate(520, ${440 - (stoolScale - 1) * 30}) scale(${stoolScale})`}
        className="transition-transform duration-300"
      >
        <rect x="-25" y="-10" width="50" height="15" rx="3" fill="#D97706" stroke="#292833" strokeWidth="2.5" />
        <line x1="-18" y1="5" x2="-22" y2="25" stroke="#292833" strokeWidth="4" />
        <line x1="18" y1="5" x2="22" y2="25" stroke="#292833" strokeWidth="4" />
        <text x="0" y="3" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
          {stoolScale >= 1.4 ? '56u' : '35u'}
        </text>
      </g>

      {/* Cat */}
      <g
        transform={`translate(${380 + progress * (reachesButton ? 210 : 160)}, ${
          420 - (stoolScale - 1) * 20 - catLeap
        })`}
      >
        <ellipse cx="0" cy="0" rx="22" ry="16" fill="#F97316" stroke="#292833" strokeWidth="3" />
        <circle cx="18" cy="-10" r="14" fill="#F97316" stroke="#292833" strokeWidth="3" />
        {/* Ears */}
        <polygon points="12,-20 18,-30 22,-20" fill="#F97316" stroke="#292833" strokeWidth="2" />
        {/* Tail */}
        <path d="M -20 0 Q -35 -15 -25 -25" stroke="#F97316" strokeWidth="5" fill="none" />

        {reachesButton && progress > 0.6 && (
          <text x="25" y="-30" fill="#10B981" fontSize="16" fontWeight="black">
            *BOOP!*
          </text>
        )}
      </g>

      {impact && (
        <g transform="translate(560, 430)">
          <text x="0" y="0" fill="#ED6666" fontSize="22" fontWeight="black" textAnchor="middle">
            *MISS! TOO SHORT!*
          </text>
        </g>
      )}
    </g>
  );
}

function renderLevel9(t: number, chairRedSpot: string, chairBlueSpot: string, impact: boolean) {
  // Red chair (Raccoon assigned) vs Blue stool (Pigeon assigned).
  // chairRedSpot must be 'chair_raccoon' and chairBlueSpot must be 'chair_pigeon'.
  const isCorrect = chairRedSpot === 'chair_raccoon';

  return (
    <g>
      {/* Boardroom Conference Table */}
      <ellipse cx="500" cy="350" rx="300" ry="80" fill="#78350F" stroke="#292833" strokeWidth="5" />
      <ellipse cx="500" cy="350" rx="260" ry="60" fill="#92400E" />

      {/* CEO at head of table */}
      <g transform="translate(500, 230)">
        <foreignObject x="-45" y="-45" width="90" height="90">
          <ToasterCEOAvatar pose={isCorrect && t > 0.8 ? 'toast' : impact ? 'panic' : 'normal'} size={85} />
        </foreignObject>
      </g>

      {/* Red Spot (Left, x=320) */}
      <g transform="translate(320, 390)">
        <ellipse cx="0" cy="0" rx="45" ry="20" fill="#FEE2E2" stroke="#EF4444" strokeWidth="3" strokeDasharray="6 4" />
        <text x="0" y="32" fill="#EF4444" fontSize="11" fontWeight="black" textAnchor="middle">
          RACCOON SPOT (RED)
        </text>
        {/* Chair on Red Spot */}
        {chairRedSpot === 'chair_raccoon' ? renderRaccoonChair() : renderPigeonStool()}
      </g>

      {/* Blue Spot (Right, x=680) */}
      <g transform="translate(680, 390)">
        <ellipse cx="0" cy="0" rx="45" ry="20" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" strokeDasharray="6 4" />
        <text x="0" y="32" fill="#0284C7" fontSize="11" fontWeight="black" textAnchor="middle">
          PIGEON SPOT (BLUE)
        </text>
        {/* Chair on Blue Spot */}
        {chairBlueSpot === 'chair_pigeon' ? renderPigeonStool() : renderRaccoonChair()}
      </g>

      {/* Approaching Characters */}
      <g transform={`translate(${160 + t * 90}, 330)`}>
        <foreignObject x="-35" y="-35" width="70" height="70">
          <RaccoonAvatar pose={isCorrect ? 'smug' : impact ? 'panic' : 'normal'} size={65} />
        </foreignObject>
      </g>

      <g transform={`translate(${840 - t * 90}, 330)`}>
        <foreignObject x="-35" y="-35" width="70" height="70">
          <PigeonAvatar pose={isCorrect ? 'celebrate' : impact ? 'panic' : 'normal'} size={65} />
        </foreignObject>
      </g>

      {impact && (
        <g transform="translate(500, 350)">
          <text x="0" y="0" fill="#ED6666" fontSize="24" fontWeight="black" textAnchor="middle">
            *WRONG CHAIRS! SEATING DISASTER!*
          </text>
        </g>
      )}
    </g>
  );
}

function renderRaccoonChair() {
  return (
    <g transform="translate(0, -25)">
      <rect x="-25" y="-40" width="50" height="45" rx="6" fill="#EF4444" stroke="#292833" strokeWidth="3" />
      <rect x="-28" y="0" width="56" height="15" rx="4" fill="#DC2626" stroke="#292833" strokeWidth="3" />
      <line x1="0" y1="15" x2="0" y2="30" stroke="#292833" strokeWidth="5" />
      <circle cx="0" cy="30" r="5" fill="#475569" />
      <text x="0" y="-18" fill="#FFF" fontSize="10" fontWeight="bold" textAnchor="middle">
        RACCOON
      </text>
    </g>
  );
}

function renderPigeonStool() {
  return (
    <g transform="translate(0, -25)">
      <ellipse cx="0" cy="0" rx="22" ry="10" fill="#0284C7" stroke="#292833" strokeWidth="3" />
      <line x1="-15" y1="5" x2="-18" y2="28" stroke="#292833" strokeWidth="3" />
      <line x1="15" y1="5" x2="18" y2="28" stroke="#292833" strokeWidth="3" />
      <text x="0" y="3" fill="#FFF" fontSize="9" fontWeight="bold" textAnchor="middle">
        PIGEON
      </text>
    </g>
  );
}

function renderLevel10(t: number, tileOnRunway: string, spareTile: string, impact: boolean) {
  // Runway is at y=480. Center tile is at x=500. Spare slot is at x=200, y=260.
  // tileOnRunway must be 'tile_carpet' to prevent Raccoon from slipping!
  const hasCarpet = tileOnRunway === 'tile_carpet';
  const progress = Math.min(t, 1.0);
  const racX = 160 + (680 - 160) * (hasCarpet ? progress : Math.min(progress / 0.6, 1.0));
  const spinAngle = !hasCarpet && progress >= 0.6 ? (progress - 0.6) * 1440 : 0;

  return (
    <g>
      {/* Keynote Stage Lights */}
      <polygon points="150,0 220,400 380,400" fill="#FEF08A" opacity="0.15" />
      <polygon points="850,0 780,400 620,400" fill="#FEF08A" opacity="0.15" />

      {/* Red Carpet Runway Track */}
      <rect x="150" y="450" width="650" height="60" rx="8" fill="#475569" stroke="#292833" strokeWidth="4" />

      {/* Center Tile on Runway (x=500) */}
      <g transform="translate(500, 480)">
        {tileOnRunway === 'tile_carpet' ? (
          <g>
            <rect x="-45" y="-25" width="90" height="50" rx="4" fill="#DC2626" stroke="#292833" strokeWidth="3" />
            <text x="0" y="5" fill="#FEF08A" fontSize="12" fontWeight="black" textAnchor="middle">
              CARPET 🌟
            </text>
          </g>
        ) : (
          <g>
            <rect x="-45" y="-25" width="90" height="50" rx="4" fill="#FEF08A" stroke="#292833" strokeWidth="3" />
            <text x="0" y="5" fill="#854D0E" fontSize="12" fontWeight="black" textAnchor="middle">
              BANANA 🍌
            </text>
          </g>
        )}
      </g>

      {/* Spare Display Socket (x=200, y=260) */}
      <g transform="translate(200, 260)">
        <rect x="-55" y="-30" width="110" height="60" rx="6" fill="#334155" stroke="#292833" strokeWidth="3" />
        <text x="0" y="-38" fill="#64748B" fontSize="11" fontWeight="bold" textAnchor="middle">
          SPARE TILE RACK
        </text>
        {spareTile === 'tile_carpet' ? (
          <g>
            <rect x="-45" y="-20" width="90" height="40" rx="4" fill="#DC2626" stroke="#292833" strokeWidth="2" />
            <text x="0" y="5" fill="#FEF08A" fontSize="11" fontWeight="bold" textAnchor="middle">
              CARPET 🌟
            </text>
          </g>
        ) : (
          <g>
            <rect x="-45" y="-20" width="90" height="40" rx="4" fill="#FEF08A" stroke="#292833" strokeWidth="2" />
            <text x="0" y="5" fill="#854D0E" fontSize="11" fontWeight="bold" textAnchor="middle">
              BANANA 🍌
            </text>
          </g>
        )}
      </g>

      {/* Stage Keynote Podium */}
      <g transform="translate(780, 420)">
        <rect x="-30" y="0" width="60" height="80" rx="4" fill="#1E293B" stroke="#292833" strokeWidth="4" />
        <line x1="0" y1="0" x2="0" y2="-25" stroke="#94A3B8" strokeWidth="4" />
        <circle cx="0" cy="-28" r="6" fill="#EF4444" stroke="#292833" strokeWidth="2" />
        <text x="0" y="35" fill="#FFF2DC" fontSize="10" fontWeight="bold" textAnchor="middle">
          PODIUM
        </text>
      </g>

      {/* Raccoon Keynote Speaker */}
      <g
        transform={`translate(${racX}, ${430 - (hasCarpet ? 0 : Math.sin(progress * Math.PI) * 60)}) rotate(${spinAngle})`}
      >
        <foreignObject x="-45" y="-45" width="90" height="90">
          <RaccoonAvatar pose={hasCarpet && progress > 0.8 ? 'celebrate' : impact ? 'panic' : 'normal'} size={85} />
        </foreignObject>
      </g>

      {impact && (
        <g transform="translate(560, 400)">
          <text x="0" y="0" fill="#ED6666" fontSize="28" fontWeight="black" textAnchor="middle">
            *WHOOOOSH! SLIP!*
          </text>
        </g>
      )}
    </g>
  );
}
