# Copilot / Agent Instructions for Aim Trainer 🎯

Purpose: provide concise, actionable context so an AI coding agent can be immediately productive working on this repository.

## Quick start (commands) ⚡
- Install: `npm i`
- Dev server: `npm run dev` (Vite — use this for iterative changes and fast reloads)
- Build (production): `npm run build`
- Build dev-mode: `npm run build:dev`
- Preview production build: `npm run preview`
- Lint: `npm run lint`

> Note: the repo is also editable via Lovable and GitHub Codespaces as described in `README.md`.

---

## Big picture / architecture 🏗️
- Tech: **Vite + React + TypeScript** with **@react-three/fiber** (three.js) for the 3D game and **Tailwind / shadcn-ui** for UI.
- Entry points: `src/main.tsx` → `src/App.tsx` → routes (see `src/pages/Index.tsx`).
- Domain split:
  - `src/components/game/` — core game UI and 3D components (Game, Arena, Target, HUD, Controls)
  - `src/hooks/` — most game logic and state (e.g., `useGameState`, `useTargets`, `useGameAudio`)
  - `src/components/ui/` — reusable shadcn-style UI components
  - `src/lib/utils.ts` — generic utilities
- Import alias: `@/*` is configured in `tsconfig.json` and used across imports (use it in edits).

---

## Key hotspots & examples (read before editing) 🔎
- Game orchestration: `src/components/game/Game.tsx`
  - Starts and ends game sessions, coordinates hooks, spawns targets, and wires UI overlays.
- Controls & pointer lock: `src/components/game/FirstPersonControls.tsx`
  - Handles pointer lock, camera rotation, movement, shooting; calling `onShoot` with a `THREE.Raycaster`.
- Target & hit detection: `src/components/game/Target.tsx`
  - Invisible collision meshes set `userData.hitType` (`'body' | 'head'`) so raycasts can determine hit type.
  - Example: Game's shoot handler uses `raycaster.intersectObjects(scene.children, true)` and checks `intersect.object.userData.hitType`.

- State: `src/hooks/useGameState.ts` — holds authoritative game session state (settings, score, shots, hits, timeRemaining)
- Spawn logic: `src/hooks/useTargets.ts` — generates positions, spawns/destroys targets, and updates movement
- Audio: `src/hooks/useGameAudio.ts` — wraps Web Audio API; **initAudio must be called in response to a user gesture** (important for browser audio policies).

Quick example to check for hits (from `Game.tsx`):
```ts
const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
for (const intersect of intersects) {
  const hitType = intersect.object.userData?.hitType;
  if (hitType === 'head' || hitType === 'body') {
    // handle head/body hit
  }
}
```

---

## Conventions & patterns ✅
- Keep game *logic* inside hooks (`useGameState`, `useTargets`) and keep components focused on rendering and wiring UI/3D. This pattern is used throughout the repo.
- Use `@/` alias for imports (don't replace with long relative paths).
- Use TypeScript interfaces exported from hooks for consistent typing (e.g., `Target` interface in `useTargets.ts`).
- No tests or test runner are configured by default — add tests with an explicit PR describing why and how.

---

## Developer workflows & debugging tips 🐞
- Start `npm run dev` and use browser devtools + React DevTools. Vite provides fast HMR and source maps.
- For three.js debugging: inspect `scene` initialization in `Canvas` (in `Game.tsx`) and use `console.log` or breakpoints in `FirstPersonControls` and `Target` for camera & raycast behavior.
- Audio: fail cases often stem from calling `initAudio` without a user gesture — test audio in interactive sessions.
- Lint with `npm run lint` (ESLint config present).

---

## Integration & dependencies ⚙️
- 3D: `three`, `@react-three/fiber`, `@react-three/drei`
- State/queries: `@tanstack/react-query` (client is created in `App.tsx`)
- UI: `shadcn`-style components (under `src/components/ui`) + Tailwind CSS
- Be careful when updating major library versions; demos and behavior rely on `react-three` API and Web Audio semantics.

---

## When submitting changes ✍️
- Provide concise PR description explaining the motivation and note any manual testing steps (e.g., "start dev server, open /, spawn target and verify hit logic").
- For game changes, include the specific scenario tested (pointer lock flow, shooting, headshot vs body hit).

---

If anything here is unclear or you want more examples (e.g., common change patterns or a sample test to add), tell me which area to expand. 🙋‍♂️
