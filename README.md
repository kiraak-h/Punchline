# Project Punchline

**One ridiculous situation. One clever fix. One unexpected punchline.**

Project Punchline is a single-player HTML5 cartoon visual-logic puzzle game built with React 19, TypeScript, Tailwind CSS, and SVG/Web Audio animation. Players inspect absurd office and delivery disasters and repair reality using exactly **one patch operation** from three reality-altering tools:

- **🔄 SWAP (`1`)**: Exchange the positions of two compatible objects while preserving their individual identities and routing properties.
- **❄️ FREEZE (`2`)**: Stop one active object's movement or environmental output throughout the simulation run.
- **📐 RESIZE (`3`)**: Scale a target object to `SMALL (0.6×)` or `LARGE (1.6×)` to resolve clearance, coverage, or reach constraints.

---

## Features

- **10 Handcrafted Campaign Levels**: Complete Chapter 1 (*The First Fix*) featuring recurring original cast members (**Raccoon Manager**, **Toaster CEO**, **NPC Pigeon**, and **Goblin Intern**).
- **Authoritative Deterministic Simulation**: Shared validation logic (`validatePatch`) ensures identical inputs always produce identical, testable outcomes.
- **3-Stage Progressive Hint System**: Direction clue (Stage 1), target highlight (Stage 2), and full solution reveal (Stage 3).
- **Mastery Medals**: Earn **Gold** (first attempt, no solution hint), **Silver** (solved after retry), or **Bronze** (solved using Stage 3 solution hint).
- **Global Daily Challenge**: Deterministic UTC calendar day puzzles (`YYYY-MM-DD`) with consecutive day numbering anchored to `2026-01-01`, streak tracking, and isolated daily completion records.
- **Versioned Save System**: Schema-validated `localStorage` persistence (`project_punchline_save_v2`) with automatic migration from legacy v1 saves, corruption recovery, and confirmed progress reset.
- **Procedural Web Audio Synthesizer**: Zero-latency cartoon sound effects and optional bouncy background music loop.

---

## Prerequisites

- **Node.js**: v20+ (v22 recommended)
- **npm**: v10+

---

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/kiraak-h/Punchline.git
   cd Punchline
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure local environment variables by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

---

## Environment Variables

Environment variables are documented in `.env.example`. Note that **Project Punchline runs 100% client-side** with deterministic puzzle logic and requires no external API keys for gameplay.

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | No | Optional platform-injected secret for AI Studio runtime environments. Not used by core puzzle gameplay. |
| `APP_URL` | No | Optional base URL where the application is hosted (defaults to `http://localhost:3000` in local development). |

---

## Development Instructions

Start the local Vite development server on port `3000`:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.
- Append `?autostart=1` (`http://localhost:3000?autostart=1`) to skip the title screen and boot directly into gameplay.

### Keyboard Controls

| Key | Action |
| :--- | :--- |
| `Enter` / `Space` | Start campaign (on Title Screen) or advance/retry (on Result Modal) |
| `1` | Select **SWAP** tool |
| `2` | Select **FREEZE** tool |
| `3` | Select **RESIZE** tool |
| `Space` | **RUN SCENE** simulation |
| `Z` | **UNDO** applied patch |
| `H` | Open 3-stage **HINT** modal |
| `R` | **RESTART** current level |
| `M` | Toggle sound effects mute |
| `B` | Toggle background cartoon music |
| `Esc` / `P` | Toggle **PAUSE** menu |

---

## Build Instructions

Compile and bundle the application for production:

```bash
npm run build
```

The production build artifacts are output to the `dist/` directory. To preview the production build locally:

```bash
npm run preview
```

---

## Testing Instructions

### 1. TypeScript Type Checking

Verify that all TypeScript types compile without errors:

```bash
npm run lint
```

### 2. Automated Unit Tests

Run the unit test suite (`src/game/logic.test.ts`) using Node's test runner via `tsx`:

```bash
npm test
```

The unit tests verify:
- All 10 campaign levels and their intended solutions
- All three patch tools (`RESIZE`, `FREEZE`, `SWAP`)
- Invalid target and capability rejection
- Swap group compatibility enforcement
- Gold, Silver, and Bronze medal calculation rules
- Consecutive UTC day numbering and deterministic daily puzzle selection
- Daily streak progression (first solve, same-day replay idempotency, consecutive day increment, missed-day reset)
- Strict separation between Campaign progress and Daily Challenge progress
- Versioned save schema validation, v1-to-v2 migration, corrupted JSON recovery, and progress reset

### 3. Browser-Level End-to-End Campaign Tests

With the dev server running on `http://localhost:3000`, run the automated headless Chromium E2E test suite across all 10 campaign levels:

```bash
npm run test:browser
```
