#!/usr/bin/env bash
set -euo pipefail

APP_URL="${TEST_URL:-http://localhost:3000}"
export NO_UPDATE_NOTIFIER=1

# Resolve pinned @playwright/cli (0.1.22) from local node_modules first, then global PATH
if [ -x "./node_modules/.bin/playwright-cli" ]; then
  PW_CLI="./node_modules/.bin/playwright-cli"
elif command -v playwright-cli >/dev/null 2>&1; then
  PW_CLI="playwright-cli"
else
  echo "Error: playwright-cli (@playwright/cli@0.1.22) is not installed. Run 'npm ci' first." >&2
  exit 1
fi

STARTED_SERVER_PID=""

cleanup() {
  "$PW_CLI" close >/dev/null 2>&1 || true
  if [ -n "$STARTED_SERVER_PID" ] && kill -0 "$STARTED_SERVER_PID" >/dev/null 2>&1; then
    kill "$STARTED_SERVER_PID" >/dev/null 2>&1 || true
    wait "$STARTED_SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "============================================================"
echo "Project Punchline — Browser E2E Campaign & Daily Verification"
echo "Target URL: $APP_URL"
echo "Browser CLI: $PW_CLI ($("$PW_CLI" --version 2>/dev/null || echo '0.1.22'))"
echo "============================================================"

# Automatically start the development server if not already listening on APP_URL
if ! curl -sf "$APP_URL" >/dev/null 2>&1; then
  echo "[Setup] Dev server not detected at $APP_URL; starting Vite server on port 3000..."
  npx vite --port 3000 --host 127.0.0.1 >/tmp/punchline-e2e-vite.log 2>&1 &
  STARTED_SERVER_PID=$!

  READY=0
  for _ in $(seq 1 40); do
    if curl -sf "$APP_URL" >/dev/null 2>&1; then
      READY=1
      break
    fi
    sleep 0.5
  done

  if [ "$READY" -ne 1 ]; then
    echo "Error: Dev server failed to start at $APP_URL within 20 seconds." >&2
    cat /tmp/punchline-e2e-vite.log >&2 || true
    exit 1
  fi
  echo "  ✓ Dev server started (PID $STARTED_SERVER_PID)"
fi

"$PW_CLI" close >/dev/null 2>&1 || true
"$PW_CLI" open "$APP_URL" >/dev/null

# Attach browser helpers on window so each batch can invoke them cleanly inside page.evaluate
attach_helpers() {
  "$PW_CLI" eval '(() => {
    const LEVEL_SOLUTIONS = {
      1: { tool: "RESIZE", targetA: "mug", targetB: null, resizeOpt: "SMALL" },
      2: { tool: "FREEZE", targetA: "pigeon", targetB: null, resizeOpt: null },
      3: { tool: "SWAP", targetA: "sign_active", targetB: "sign_spare", resizeOpt: null },
      4: { tool: "FREEZE", targetA: "fan", targetB: null, resizeOpt: null },
      5: { tool: "RESIZE", targetA: "umbrella", targetB: null, resizeOpt: "LARGE" },
      6: { tool: "SWAP", targetA: "parcel_cactus", targetB: "parcel_pizza", resizeOpt: null },
      7: { tool: "FREEZE", targetA: "cart", targetB: null, resizeOpt: null },
      8: { tool: "RESIZE", targetA: "stool", targetB: null, resizeOpt: "LARGE" },
      9: { tool: "SWAP", targetA: "chair_raccoon", targetB: "chair_pigeon", resizeOpt: null },
      10: { tool: "SWAP", targetA: "tile_banana", targetB: "tile_carpet", resizeOpt: null },
    };

    window.__applyAndRunSolution = async (expectedId, tool, targetA, targetB, resizeOpt) => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const waitFor = async (fn, label, timeout = 12000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
          const res = fn();
          if (res) return res;
          await wait(50);
        }
        throw new Error("Timeout waiting for " + label + " in level " + expectedId + " (state=" + document.body.dataset.state + ")");
      };

      const levelPad = String(expectedId).padStart(2, "0");
      await waitFor(
        () => document.body.dataset.state === "playing" && (document.body.innerText || "").includes("LEVEL " + levelPad),
        "level " + expectedId + " playing state"
      );

      const buttons = Array.from(document.querySelectorAll("button"));
      const toolBtn = buttons.find((b) => (b.textContent || "").toUpperCase().includes(tool));
      if (!toolBtn) throw new Error("Tool button not found: " + tool);
      toolBtn.click();
      await wait(80);

      const elA = document.querySelector("[data-testid=\"target-" + targetA + "\"]");
      if (!elA) throw new Error("Target not found: target-" + targetA);
      elA.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await wait(80);

      if (tool === "SWAP" && targetB) {
        const elB = document.querySelector("[data-testid=\"target-" + targetB + "\"]");
        if (!elB) throw new Error("Secondary target not found: target-" + targetB);
        elB.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        await wait(80);
      }

      if (tool === "RESIZE" && resizeOpt) {
        const optBtn = Array.from(document.querySelectorAll("button")).find(
          (b) => (b.textContent || "").toUpperCase().includes(resizeOpt)
        );
        if (!optBtn) throw new Error("Resize option button not found: " + resizeOpt);
        optBtn.click();
        await wait(80);
      }

      const runBtn = document.querySelector("[data-testid=\"run-button\"]");
      if (!runBtn || runBtn.disabled) {
        throw new Error("RUN SCENE button missing or disabled on level " + expectedId);
      }
      runBtn.click();

      await waitFor(() => document.body.dataset.state === "gameover", "ResultModal on level " + expectedId, 12000);

      const bodyText = document.body.innerText || "";
      if (!bodyText.includes("PUNCHLINE DELIVERED!")) {
        throw new Error("Expected PUNCHLINE DELIVERED! on level " + expectedId);
      }
      return bodyText;
    };

    window.__solveLevelE2E = async (expectedId, tool, targetA, targetB, resizeOpt, isLastLevel) => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const bodyText = await window.__applyAndRunSolution(expectedId, tool, targetA, targetB, resizeOpt);

      if (!isLastLevel) {
        const nextBtn = Array.from(document.querySelectorAll("button")).find((b) =>
          (b.textContent || "").toUpperCase().includes("NEXT LEVEL")
        );
        if (!nextBtn) throw new Error("NEXT LEVEL button not found on level " + expectedId);
        nextBtn.click();
        await wait(120);
      } else {
        if (!bodyText.includes("CAMPAIGN CLEARED!")) {
          throw new Error("Expected CAMPAIGN CLEARED! banner on level 10");
        }
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        await wait(150);
      }
      return true;
    };

    window.__solveActiveDailyE2E = async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      if (document.body.dataset.mode !== "daily") {
        throw new Error("Expected document.body.dataset.mode === daily, got " + document.body.dataset.mode);
      }
      const match = /LEVEL\s+(\d+)\s*\/\s*10/i.exec(document.body.innerText || "");
      if (!match) {
        throw new Error("Could not detect active daily level ID from HUD");
      }
      const lvlId = Number(match[1]);
      const sol = LEVEL_SOLUTIONS[lvlId];
      if (!sol) throw new Error("No solution table entry for level " + lvlId);

      const bodyText = await window.__applyAndRunSolution(lvlId, sol.tool, sol.targetA, sol.targetB, sol.resizeOpt);
      if (!bodyText.includes("DAILY CHALLENGE FIXED")) {
        throw new Error("Expected DAILY CHALLENGE FIXED banner in ResultModal for daily mode");
      }

      const backBtn = Array.from(document.querySelectorAll("button")).find((b) =>
        (b.textContent || "").toUpperCase().includes("BACK TO TITLE")
      );
      if (!backBtn) throw new Error("BACK TO TITLE button not found in daily ResultModal");
      backBtn.click();
      await wait(150);
      return lvlId;
    };

    return true;
  })()' >/dev/null
}

echo "[1/6] Starting campaign from Title Screen and solving Levels 1–3..."
"$PW_CLI" eval '(() => {
  localStorage.clear();
  return true;
})()' >/dev/null

"$PW_CLI" reload >/dev/null

"$PW_CLI" eval '(() => {
  const startBtn = Array.from(document.querySelectorAll("button")).find((b) =>
    (b.textContent || "").toUpperCase().includes("CAMPAIGN")
  );
  if (!startBtn) throw new Error("START CAMPAIGN button not found");
  startBtn.click();
  return document.body.dataset.state;
})()' >/dev/null

attach_helpers

"$PW_CLI" run-code 'async (page) => {
  await page.evaluate(async () => {
    await window.__solveLevelE2E(1, "RESIZE", "mug", null, "SMALL", false);
    await window.__solveLevelE2E(2, "FREEZE", "pigeon", null, null, false);
    await window.__solveLevelE2E(3, "SWAP", "sign_active", "sign_spare", null, false);
  });
}' >/dev/null
echo "  ✓ Levels 1, 2, 3 solved!"

echo "[2/6] Solving Levels 4–6..."
"$PW_CLI" run-code 'async (page) => {
  await page.evaluate(async () => {
    await window.__solveLevelE2E(4, "FREEZE", "fan", null, null, false);
    await window.__solveLevelE2E(5, "RESIZE", "umbrella", null, "LARGE", false);
    await window.__solveLevelE2E(6, "SWAP", "parcel_cactus", "parcel_pizza", null, false);
  });
}' >/dev/null
echo "  ✓ Levels 4, 5, 6 solved!"

echo "[3/6] Solving Levels 7–9..."
"$PW_CLI" run-code 'async (page) => {
  await page.evaluate(async () => {
    await window.__solveLevelE2E(7, "FREEZE", "cart", null, null, false);
    await window.__solveLevelE2E(8, "RESIZE", "stool", null, "LARGE", false);
    await window.__solveLevelE2E(9, "SWAP", "chair_raccoon", "chair_pigeon", null, false);
  });
}' >/dev/null
echo "  ✓ Levels 7, 8, 9 solved!"

echo "[4/6] Solving Level 10 & Verifying Campaign Save State Isolation..."
CAMPAIGN_RESULT=$("$PW_CLI" run-code 'async (page) => {
  return await page.evaluate(async () => {
    await window.__solveLevelE2E(10, "SWAP", "tile_banana", "tile_carpet", null, true);
    const raw = localStorage.getItem("project_punchline_save_v2");
    const parsed = JSON.parse(raw);
    if (Object.keys(parsed.completedLevels).length !== 10) {
      throw new Error("Expected 10 completed campaign levels, got " + Object.keys(parsed.completedLevels).length);
    }
    if (parsed.dailyStreak !== 0) {
      throw new Error("Expected dailyStreak to remain 0 after campaign completion, got " + parsed.dailyStreak);
    }
    if (Object.keys(parsed.dailyCompletions || {}).length !== 0) {
      throw new Error("Expected 0 dailyCompletions after campaign completion");
    }
    return {
      state: document.body.dataset.state,
      version: parsed.version,
      completedCount: Object.keys(parsed.completedLevels).length,
      dailyStreak: parsed.dailyStreak,
      dailyCompletionsCount: Object.keys(parsed.dailyCompletions || {}).length,
    };
  });
}')
echo "$CAMPAIGN_RESULT"
echo "  ✓ Level 10 solved! 10/10 campaign levels recorded and 0 daily streak contamination!"

echo "[5/6] Verifying Confirmed Progress Reset..."
RESET_RESULT=$("$PW_CLI" run-code 'async (page) => {
  return await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const levelsBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toUpperCase().includes("LEVELS")
    );
    if (!levelsBtn) throw new Error("LEVELS button not found on Title Screen");
    levelsBtn.click();
    await wait(150);

    const resetBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toUpperCase().includes("RESET PROGRESS")
    );
    if (!resetBtn) throw new Error("RESET PROGRESS button not found in LevelSelectModal");
    resetBtn.click();
    await wait(100);

    const confirmBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toUpperCase().includes("YES, RESET")
    );
    if (!confirmBtn) throw new Error("YES, RESET confirmation button not found");
    confirmBtn.click();
    await wait(150);

    const closeBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.getAttribute("aria-label") || "").includes("Close Level Select")
    );
    if (closeBtn) {
      closeBtn.click();
      await wait(150);
    }

    const afterReset = JSON.parse(localStorage.getItem("project_punchline_save_v2"));
    if (Object.keys(afterReset.completedLevels).length !== 0 || afterReset.highestUnlockedLevel !== 1) {
      throw new Error("Progress reset failed to clear completedLevels or reset highestUnlockedLevel");
    }
    return {
      afterResetCompletedCount: Object.keys(afterReset.completedLevels).length,
      afterResetHighestUnlockedLevel: afterReset.highestUnlockedLevel,
      afterResetDailyStreak: afterReset.dailyStreak,
    };
  });
}')
echo "$RESET_RESULT"
echo "  ✓ Confirmed Progress Reset verified!"

echo "[6/6] Solving Daily Challenge in Daily Mode & Verifying Campaign/Daily Save Isolation..."
DAILY_RESULT=$("$PW_CLI" run-code 'async (page) => {
  return await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // Open Daily Challenge modal from Title Screen
    const dailyBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toUpperCase().includes("DAILY PUZZLE")
    );
    if (!dailyBtn) throw new Error("DAILY PUZZLE button not found on Title Screen");
    dailyBtn.click();
    await wait(150);

    const modalText = document.body.innerText || "";
    if (!modalText.includes("GLOBAL DAILY PUZZLE #")) {
      throw new Error("Expected GLOBAL DAILY PUZZLE # header in DailyChallengeModal");
    }

    // Start Daily Challenge play session
    const playDailyBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toUpperCase().includes("TODAY’S CHALLENGE") ||
      (b.textContent || "").toUpperCase().includes("TODAY\x27S CHALLENGE")
    );
    if (!playDailyBtn) throw new Error("Play Daily Challenge button not found");
    playDailyBtn.click();
    await wait(150);

    const solvedDailyLevelId = await window.__solveActiveDailyE2E();

    const afterDaily = JSON.parse(localStorage.getItem("project_punchline_save_v2"));
    if (afterDaily.dailyStreak !== 1) {
      throw new Error("Expected dailyStreak === 1 after first daily solve, got " + afterDaily.dailyStreak);
    }
    if (Object.keys(afterDaily.dailyCompletions || {}).length !== 1) {
      throw new Error("Expected 1 dailyCompletions record after daily solve");
    }
    if (Object.keys(afterDaily.completedLevels || {}).length !== 0 || afterDaily.highestUnlockedLevel !== 1) {
      throw new Error("Daily Challenge completion must NEVER write to campaign completedLevels or unlock campaign levels");
    }

    return {
      solvedDailyLevelId,
      dailyStreak: afterDaily.dailyStreak,
      lastDailyDate: afterDaily.lastDailyDate,
      dailyCompletionsCount: Object.keys(afterDaily.dailyCompletions).length,
      campaignCompletedCount: Object.keys(afterDaily.completedLevels).length,
      campaignHighestUnlocked: afterDaily.highestUnlockedLevel,
    };
  });
}')
echo "$DAILY_RESULT"
echo "  ✓ Daily Challenge solved end-to-end with strict campaign/daily save isolation!"

echo "============================================================"
echo "ALL 10 CAMPAIGN LEVELS + DAILY MODE + RESET E2E TESTS PASSED!"
echo "============================================================"
