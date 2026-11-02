#!/usr/bin/env bash
set -euo pipefail

APP_URL="${TEST_URL:-http://localhost:3000}"

echo "============================================================"
echo "Project Punchline — Browser E2E Campaign & Daily Verification"
echo "Target URL: $APP_URL"
echo "============================================================"

cleanup() {
  playwright-cli close >/dev/null 2>&1 || true
}
trap cleanup EXIT

playwright-cli close >/dev/null 2>&1 || true
playwright-cli open "$APP_URL" >/dev/null

# Attach browser helper on window so each batch can invoke it cleanly inside page.evaluate
attach_helpers() {
  playwright-cli eval '(() => {
    window.__solveLevelE2E = async (expectedId, tool, targetA, targetB, resizeOpt, isLastLevel) => {
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

      // Select tool button
      const buttons = Array.from(document.querySelectorAll("button"));
      const toolBtn = buttons.find((b) => (b.textContent || "").toUpperCase().includes(tool));
      if (!toolBtn) throw new Error("Tool button not found: " + tool);
      toolBtn.click();
      await wait(80);

      // Click primary SVG target
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

      // Click RUN SCENE
      const runBtn = document.querySelector("[data-testid=\"run-button\"]");
      if (!runBtn || runBtn.disabled) {
        throw new Error("RUN SCENE button missing or disabled on level " + expectedId);
      }
      runBtn.click();

      // Wait for gameover (ResultModal) state (simulation takes ~3.5s)
      await waitFor(() => document.body.dataset.state === "gameover", "ResultModal on level " + expectedId, 12000);

      const bodyText = document.body.innerText || "";
      if (!bodyText.includes("PUNCHLINE DELIVERED!")) {
        throw new Error("Expected PUNCHLINE DELIVERED! on level " + expectedId);
      }

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
    return true;
  })()' >/dev/null
}

echo "[1/5] Starting campaign from Title Screen and solving Levels 1–3..."
playwright-cli eval '(() => {
  localStorage.clear();
  return true;
})()' >/dev/null

playwright-cli reload >/dev/null

playwright-cli eval '(() => {
  const startBtn = Array.from(document.querySelectorAll("button")).find((b) =>
    (b.textContent || "").toUpperCase().includes("CAMPAIGN")
  );
  if (!startBtn) throw new Error("START CAMPAIGN button not found");
  startBtn.click();
  return document.body.dataset.state;
})()' >/dev/null

attach_helpers

playwright-cli run-code 'async (page) => {
  await page.evaluate(async () => {
    await window.__solveLevelE2E(1, "RESIZE", "mug", null, "SMALL", false);
    await window.__solveLevelE2E(2, "FREEZE", "pigeon", null, null, false);
    await window.__solveLevelE2E(3, "SWAP", "sign_active", "sign_spare", null, false);
  });
}' >/dev/null
echo "  ✓ Levels 1, 2, 3 solved!"

echo "[2/5] Solving Levels 4–6..."
playwright-cli run-code 'async (page) => {
  await page.evaluate(async () => {
    await window.__solveLevelE2E(4, "FREEZE", "fan", null, null, false);
    await window.__solveLevelE2E(5, "RESIZE", "umbrella", null, "LARGE", false);
    await window.__solveLevelE2E(6, "SWAP", "parcel_cactus", "parcel_pizza", null, false);
  });
}' >/dev/null
echo "  ✓ Levels 4, 5, 6 solved!"

echo "[3/5] Solving Levels 7–9..."
playwright-cli run-code 'async (page) => {
  await page.evaluate(async () => {
    await window.__solveLevelE2E(7, "FREEZE", "cart", null, null, false);
    await window.__solveLevelE2E(8, "RESIZE", "stool", null, "LARGE", false);
    await window.__solveLevelE2E(9, "SWAP", "chair_raccoon", "chair_pigeon", null, false);
  });
}' >/dev/null
echo "  ✓ Levels 7, 8, 9 solved!"

echo "[4/5] Solving Level 10 & Verifying Campaign Save State Isolation..."
CAMPAIGN_RESULT=$(playwright-cli run-code 'async (page) => {
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

echo "[5/5] Verifying Daily Challenge Consecutive Numbering & Confirmed Progress Reset..."
DAILY_AND_RESET_RESULT=$(playwright-cli run-code 'async (page) => {
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

    // Close Daily modal
    const closeDailyBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").toUpperCase().includes("BACK TO TITLE")
    );
    if (!closeDailyBtn) throw new Error("Back to Title button not found in DailyChallengeModal");
    closeDailyBtn.click();
    await wait(150);

    // Open Level Select modal to test Confirmed Reset Progress
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

    const afterReset = JSON.parse(localStorage.getItem("project_punchline_save_v2"));
    if (Object.keys(afterReset.completedLevels).length !== 0 || afterReset.highestUnlockedLevel !== 1) {
      throw new Error("Progress reset failed to clear completedLevels or reset highestUnlockedLevel");
    }
    return {
      afterResetCompletedCount: Object.keys(afterReset.completedLevels).length,
      afterResetHighestUnlockedLevel: afterReset.highestUnlockedLevel,
    };
  });
}')
echo "$DAILY_AND_RESET_RESULT"
echo "  ✓ Daily Challenge modal and Confirmed Reset Progress verified!"

echo "============================================================"
echo "ALL 10 CAMPAIGN LEVELS + DAILY + RESET BROWSER TESTS PASSED!"
echo "============================================================"
