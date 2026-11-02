import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CAMPAIGN_LEVELS } from './game/levels';
import {
  DailyChallengeSession,
  GameMode,
  GameScreen,
  MedalType,
  PatchAction,
  ToolType,
} from './game/types';
import {
  calculateMedal,
  completeDailyChallengeSession,
  createDailyChallengeSession,
  loadSavedGameState,
  recordCampaignCompletion,
  resetSavedGameState,
  saveGameState,
  SavedGameState,
} from './game/logic';
import { sound } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { CartoonStage } from './components/CartoonStage';
import { GameHUD } from './components/GameHUD';
import { ResultModal } from './components/ResultModal';
import { HintModal } from './components/HintModal';
import { PauseModal } from './components/PauseModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';

export default function App() {
  const [savedState, setSavedState] = useState<SavedGameState>(() => loadSavedGameState());
  const [screen, setScreen] = useState<GameScreen>('title');
  const [gameMode, setGameMode] = useState<GameMode>('campaign');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [dailySession, setDailySession] = useState<DailyChallengeSession | null>(null);
  const dailySessionRef = useRef<DailyChallengeSession | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [patch, setPatch] = useState<PatchAction | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [resultState, setResultState] = useState<{
    show: boolean;
    success: boolean;
    medal: MedalType;
    timeSpentSec: number;
    attempts: number;
  }>({
    show: false,
    success: false,
    medal: 'bronze',
    timeSpentSec: 0,
    attempts: 1,
  });

  const [hintOpen, setHintOpen] = useState<boolean>(false);
  const [hintStage, setHintStage] = useState<number>(1);
  const [maxHintStageViewed, setMaxHintStageViewed] = useState<number>(0);
  const [pauseOpen, setPauseOpen] = useState<boolean>(false);
  const [levelSelectOpen, setLevelSelectOpen] = useState<boolean>(false);
  const [dailyModalOpen, setDailyModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  const levelStartTimeRef = useRef<number>(Date.now());
  const attemptsRef = useRef<number>(1);

  const currentLevel =
    gameMode === 'daily' && dailySession
      ? dailySession.level
      : CAMPAIGN_LEVELS.find((l) => l.id === currentLevelId) || CAMPAIGN_LEVELS[0];

  // Sync state machine to document.body.dataset.state
  useEffect(() => {
    let stateVal = 'title';
    if (screen === 'playing') {
      if (pauseOpen) stateVal = 'paused';
      else if (resultState.show) stateVal = 'gameover';
      else stateVal = 'playing';
    }
    document.body.dataset.state = stateVal;
    document.body.dataset.mode = gameMode;
  }, [screen, pauseOpen, resultState.show, gameMode]);

  // Handle ?autostart=1 query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        const modeParam = params.get('mode') === 'daily' ? 'daily' : 'campaign';
        if (modeParam === 'daily') {
          const captured = createDailyChallengeSession();
          dailySessionRef.current = captured;
          setDailySession(captured);
          setCurrentLevelId(captured.level.id);
        } else {
          dailySessionRef.current = null;
          setDailySession(null);
        }
        setGameMode(modeParam);
        setScreen('playing');
        levelStartTimeRef.current = Date.now();
        attemptsRef.current = 1;
        document.body.dataset.state = 'playing';
      }
    }
  }, []);

  // Save state whenever it updates
  useEffect(() => {
    saveGameState(savedState);
  }, [savedState]);

  // Restart / setup level (preserves active dailySession when restarting a daily puzzle)
  const initLevel = useCallback((lvlId: number, mode: GameMode = 'campaign') => {
    setGameMode(mode);
    setCurrentLevelId(lvlId);
    if (mode === 'campaign') {
      dailySessionRef.current = null;
      setDailySession(null);
    }
    setPatch(null);
    setActiveTool(null);
    setIsRunning(false);
    setResultState({
      show: false,
      success: false,
      medal: 'bronze',
      timeSpentSec: 0,
      attempts: 1,
    });
    setHintOpen(false);
    setHintStage(1);
    setMaxHintStageViewed(0);
    setPauseOpen(false);
    levelStartTimeRef.current = Date.now();
    attemptsRef.current = 1;
  }, []);

  const handleStartCampaign = () => {
    setScreen('playing');
    initLevel(savedState.highestUnlockedLevel || 1, 'campaign');
  };

  const handleStartDailyChallenge = () => {
    const captured = createDailyChallengeSession();
    dailySessionRef.current = captured;
    setDailySession(captured);
    initLevel(captured.level.id, 'daily');
    setScreen('playing');
  };

  const handleResetProgress = () => {
    const fresh = resetSavedGameState();
    setSavedState(fresh);
    initLevel(1, 'campaign');
  };

  const handleApplyPatch = (newPatch: PatchAction) => {
    setPatch(newPatch);
  };

  const handleUndoPatch = () => {
    setPatch(null);
  };

  const handleRunSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
  };

  const handleSimulationFinish = (success: boolean) => {
    setIsRunning(false);
    const timeSpent = Math.max(1, Math.round((Date.now() - levelStartTimeRef.current) / 1000));
    const currentAttempts = attemptsRef.current;
    const medal = calculateMedal(currentAttempts, maxHintStageViewed);

    if (success) {
      sound.playVictoryFanfare();
      if (gameMode === 'daily') {
        const activeSession =
          dailySessionRef.current ?? dailySession ?? createDailyChallengeSession();
        setSavedState((prev) =>
          completeDailyChallengeSession(
            prev,
            activeSession,
            medal,
            timeSpent,
            currentAttempts
          )
        );
      } else {
        setSavedState((prev) =>
          recordCampaignCompletion(
            prev,
            currentLevel.id,
            medal,
            timeSpent,
            currentAttempts
          )
        );
      }
    } else {
      sound.playFailPunchline();
      attemptsRef.current += 1;
    }

    setResultState({
      show: true,
      success,
      medal,
      timeSpentSec: timeSpent,
      attempts: currentAttempts,
    });
  };

  const handleNextLevel = () => {
    if (gameMode === 'daily') {
      dailySessionRef.current = null;
      setDailySession(null);
      setScreen('title');
      return;
    }
    if (currentLevel.id < CAMPAIGN_LEVELS.length) {
      initLevel(currentLevel.id + 1, 'campaign');
    } else {
      setScreen('title');
    }
  };

  const handleRetry = () => {
    setPatch(null);
    setIsRunning(false);
    setResultState((prev) => ({ ...prev, show: false }));
  };

  // Sound and music controls
  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    if (nextMuted) setIsMusicPlaying(false);
  };

  const handleToggleMusic = () => {
    const playing = sound.toggleMusic();
    setIsMusicPlaying(playing);
  };

  // Keyboard navigation & Shortcuts hub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();

      // Title screen controls
      if (screen === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartCampaign();
        }
        return;
      }

      // Playing screen controls
      if (screen === 'playing') {
        // Outcome modal active
        if (resultState.show) {
          if (e.key === 'Enter' || (e.key === ' ' && !resultState.success)) {
            e.preventDefault();
            if (resultState.success) handleNextLevel();
            else handleRetry();
          } else if (key === 'r') {
            e.preventDefault();
            handleRetry();
          } else if (key === 'h' && !resultState.success) {
            e.preventDefault();
            setResultState((prev) => ({ ...prev, show: false }));
            setHintOpen(true);
          }
          return;
        }

        // Pause toggle
        if (e.key === 'Escape' || key === 'p') {
          e.preventDefault();
          if (hintOpen) setHintOpen(false);
          else if (levelSelectOpen) setLevelSelectOpen(false);
          else setPauseOpen((prev) => !prev);
          return;
        }

        if (pauseOpen || hintOpen || levelSelectOpen) return;

        // Tool selection shortcuts
        if (key === '1') {
          e.preventDefault();
          if (currentLevel.eligibleTools.includes('SWAP')) {
            sound.playToolSelect('SWAP');
            setActiveTool('SWAP');
          }
        } else if (key === '2') {
          e.preventDefault();
          if (currentLevel.eligibleTools.includes('FREEZE')) {
            sound.playToolSelect('FREEZE');
            setActiveTool('FREEZE');
          }
        } else if (key === '3') {
          e.preventDefault();
          if (currentLevel.eligibleTools.includes('RESIZE')) {
            sound.playToolSelect('RESIZE');
            setActiveTool('RESIZE');
          }
        } else if (e.key === ' ') {
          // Space to RUN
          e.preventDefault();
          handleRunSimulation();
        } else if (key === 'z') {
          // Undo patch
          e.preventDefault();
          sound.playUndo();
          handleUndoPatch();
        } else if (key === 'h') {
          // Open hints
          e.preventDefault();
          sound.playSelect();
          setHintOpen(true);
        } else if (key === 'r') {
          // Restart level
          e.preventDefault();
          sound.playSelect();
          initLevel(currentLevel.id, gameMode);
        } else if (key === 'm') {
          // Mute toggle
          e.preventDefault();
          handleToggleMute();
        } else if (key === 'b') {
          // Music toggle
          e.preventDefault();
          handleToggleMusic();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    screen,
    resultState,
    pauseOpen,
    hintOpen,
    levelSelectOpen,
    currentLevel,
    gameMode,
    initLevel,
  ]);

  // Clean blur release
  useEffect(() => {
    const handleBlur = () => {
      // Reset active transient keys if needed
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  const hintHighlightTargetId =
    maxHintStageViewed >= 2
      ? (currentLevel.intendedSolution as { targetId?: string; targetAId?: string })?.targetId ||
        (currentLevel.intendedSolution as { targetAId?: string })?.targetAId ||
        null
      : null;

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#FFF2DC] font-sans text-[#292833] select-none">
      {screen === 'title' ? (
        <TitleScreen
          onStartCampaign={handleStartCampaign}
          onOpenDailyChallenge={() => setDailyModalOpen(true)}
          onOpenLevelSelect={() => setLevelSelectOpen(true)}
          completedLevelsCount={Object.keys(savedState.completedLevels).length}
          totalLevels={CAMPAIGN_LEVELS.length}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      ) : (
        <main className="relative w-full h-full overflow-hidden flex items-center justify-center">
          {/* 60fps Cartoon Simulation Viewport */}
          <CartoonStage
            level={currentLevel}
            activeTool={activeTool}
            patch={patch}
            onApplyPatch={handleApplyPatch}
            isRunning={isRunning}
            onRunFinished={handleSimulationFinish}
            highlightTargetId={hintHighlightTargetId}
          />

          {/* Low-Occlusion HUD Overlay (<15% screen coverage) */}
          <GameHUD
            level={currentLevel}
            totalLevels={CAMPAIGN_LEVELS.length}
            activeTool={activeTool}
            onSelectTool={(tool) => setActiveTool((prev) => (prev === tool ? null : tool))}
            patch={patch}
            onUndoPatch={handleUndoPatch}
            onRunSimulation={handleRunSimulation}
            isRunning={isRunning}
            onOpenHint={() => {
              setMaxHintStageViewed((prev) => Math.max(prev, 1));
              setHintOpen(true);
            }}
            onRestartLevel={() => initLevel(currentLevel.id, gameMode)}
            onPause={() => setPauseOpen(true)}
            onOpenLevelSelect={() => setLevelSelectOpen(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            isMusicPlaying={isMusicPlaying}
            onToggleMusic={handleToggleMusic}
            hintsUsedCount={maxHintStageViewed}
          />

          {/* Outcome / Result Modal */}
          {resultState.show && (
            <ResultModal
              success={resultState.success}
              level={currentLevel}
              timeSpentSec={resultState.timeSpentSec}
              attempts={resultState.attempts}
              hintsUsedCount={maxHintStageViewed}
              medal={resultState.medal}
              onNextLevel={handleNextLevel}
              onRetry={handleRetry}
              onOpenHint={() => {
                setResultState((prev) => ({ ...prev, show: false }));
                setMaxHintStageViewed((prev) => Math.max(prev, 1));
                setHintOpen(true);
              }}
              hasNextLevel={gameMode === 'campaign' && currentLevel.id < CAMPAIGN_LEVELS.length}
              gameMode={gameMode}
              dailyDayNumber={dailySession?.dayNumber}
            />
          )}

          {/* 3-Stage Hint Modal */}
          {hintOpen && (
            <HintModal
              level={currentLevel}
              hintStage={hintStage}
              onAdvanceHint={() => {
                const next = Math.min(3, hintStage + 1);
                setHintStage(next);
                setMaxHintStageViewed((prev) => Math.max(prev, next));
              }}
              onClose={() => setHintOpen(false)}
            />
          )}

          {/* Pause Modal */}
          {pauseOpen && (
            <PauseModal
              onResume={() => setPauseOpen(false)}
              onRestart={() => initLevel(currentLevel.id, gameMode)}
              onOpenLevelSelect={() => {
                setPauseOpen(false);
                setLevelSelectOpen(true);
              }}
              onGoToTitle={() => {
                setPauseOpen(false);
                dailySessionRef.current = null;
                setDailySession(null);
                setScreen('title');
              }}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onResetProgress={handleResetProgress}
            />
          )}
        </main>
      )}

      {/* Level Select Modal */}
      {levelSelectOpen && (
        <LevelSelectModal
          currentLevelId={currentLevelId}
          savedState={savedState}
          onSelectLevel={(lvlId) => {
            initLevel(lvlId, 'campaign');
            setScreen('playing');
          }}
          onClose={() => setLevelSelectOpen(false)}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* Daily Challenge Modal */}
      {dailyModalOpen && (
        <DailyChallengeModal
          savedState={savedState}
          onPlayDailyLevel={() => {
            handleStartDailyChallenge();
          }}
          onClose={() => setDailyModalOpen(false)}
        />
      )}
    </div>
  );
}
