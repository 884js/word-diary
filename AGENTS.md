# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

「一言日記」 — Expo / React Native app for one-line-per-day journaling. Local-only (no network), SQLite-backed, Japanese UI.

## Common commands

| | |
| --- | --- |
| `npm run dev` | Start Expo dev server (Metro). |
| `npm run ios` / `npm run android` | Native build + run on simulator/device. Requires `expo prebuild` first if `ios/` or `android/` are stale. |
| `npm run prebuild:ios` / `npm run prebuild:android` | Regenerate native projects from `app.json` plugins. |
| `npm run typecheck` | `tsc --noEmit`. No separate test runner is configured. |
| `npm run lint` / `npm run fix` | Biome check + autofix. `npm run format` for formatting only. |
| `npm run db:generate` | Generate a new Drizzle migration into `drizzle/` from `src/lib/database/schema.ts`. After generating, also append the new migration file to `drizzle/migrations.js` (the hand-maintained imports map — `drizzle-kit` does not update it). |
| `npm run db:migrate` | drizzle-kit migrate (rarely used at runtime — see "Database lifecycle"). |

There is no test suite. When verifying changes, run `npm run typecheck` and `npm run lint`.

## Architecture

### Routing & entry point

- Expo Router with file-based routes under `src/app/` (`expo-router/entry` is the main). `_layout.tsx` is the root provider tree.
- `app.json` has `experiments.reactCompiler: true` and `experiments.typedRoutes: true` — assume the React Compiler is on; do not add manual memoization unless there is a measured reason.
- Provider order in `_layout.tsx` matters: `GestureHandlerRootView` → `QueryClientProvider` → `ThemeProvider` → `DatabaseProvider` → `KeyboardProvider` → `TamaguiProvider` → `PortalProvider` → `NavigationThemeProvider` → `Stack`.
- Splash screen is held until **both** fonts and DB (migrations + seed) are ready. `DatabaseProvider` calls `onReady` once it can render; `_layout` only calls `SplashScreen.hideAsync()` when both flags flip.

### Data layer

- **Drizzle + expo-sqlite** (`src/lib/database/`). Single table `entries` with `date` (YYYY-MM-DD) as a UNIQUE column — one row per day. `id` is a UUID; mutations are upserts keyed by `date`.
- Migrations: `drizzle-kit generate` writes SQL into `drizzle/`. At runtime, `_layout` mounts `DatabaseProvider`, which calls `useMigrations(db, migrations)` from `drizzle-orm/expo-sqlite/migrator`. `drizzle/migrations.js` imports the generated SQL via the `babel-plugin-inline-import` plugin (configured in `babel.config.js` for `.sql`) — **add new migrations to that file by hand** when running `db:generate`.
- Dev-only seeding: `seedIfEmpty()` runs from `DatabaseProvider` when `__DEV__` is true and the DB is empty. Production builds skip seeding.
- Repository functions (`repository.ts`) are the only place to touch `db` — feature code goes through the React Query hooks in `src/features/entry/hooks/useEntries.ts`.

### React Query conventions (important)

- All entry hooks share a **single query key** `['entries']`. `useTodayEntry` derives today's row via `select` from the same cached list — do **not** introduce a separate `['today']` key, that would force a second fetch and double-sync on writes.
- `useUpsertEntry.onMutate` is intentionally **synchronous** (no `await`, no `cancelQueries`). Adding `await` introduces a microtask boundary that causes a flicker before the optimistic value paints. If you change this, verify the Composer / EntryRow does not flash on save.
- `onSuccess` re-runs `upsertInList` with the server-confirmed entry to replace the optimistic id (`optimistic-${date}`) with the real UUID.

### Date / "today" model

- Date keys are local `YYYY-MM-DD` strings (`toDateKey` in `src/lib/dateUtils.ts`). They are compared lexicographically — never feed them through `new Date()` for sort/compare.
- `useToday()` in `src/lib/hooks/useToday.ts` keeps the current date key fresh through two layers: `AppState` 'active' transitions, and a `setTimeout` scheduled for the next 00:00:01. This is the fix for the cross-midnight bug; keep both layers if you touch this hook.
- `TodayComposer` clears its `draft` after a successful save so that a stale value cannot leak into the next day's input when `useToday` ticks over.

### Theme

- Two parallel theme systems coexist:
  1. `src/theme/colors.ts` + `ThemeContext` — the **primary** API. Most components use `const c = useColors()` and inline `StyleSheet`s. Add new palette entries here.
  2. Tamagui themes built from the same palette (`src/theme/themes.ts`, `tamagui.config.ts`) — fallback for the rare Tamagui component. Update both when you add a token that needs to be available to Tamagui-rendered UI.
- `ThemeProvider` persists user mode (`system` / `light` / `dark`) in `AsyncStorage` under key `word-diary.theme-mode`. The "resolved" scheme that components actually see is computed from mode + `useColorScheme()`.
- Fonts are Noto Serif JP loaded via `@expo-google-fonts/noto-serif-jp`. Family names used in `StyleSheet`: `'NotoSerifJP'`, `'NotoSerifJPMedium'`, `'NotoSerifJPSemiBold'`, `'NotoSerifJPBold'`. Spacing comes from `src/theme/tokens.ts`.

### Path aliases

`@/*` resolves to `src/*`. Configured in **two** places that must agree:
- `tsconfig.json` (`compilerOptions.paths`).
- `babel.config.js` (`babel-plugin-module-resolver`).

Update both if you change the alias.

### Tamagui / Metro

`metro.config.js` wraps the default Expo config with `withTamagui`. The `@tamagui/babel-plugin` runs with `disableExtraction: true` in development for faster reloads — production builds extract styles. `metro.config.js` also adds `sql` to `resolver.sourceExts` so the inline-import plugin can pick up migration files.

## Conventions

- Code comments and UI strings are in Japanese; keep that style when adding new code.
- Biome enforces single quotes, semicolons, 2-space indent. Run `npm run fix` before committing.
- Prefer React Native primitives + `useColors()` for new screens (matches the rest of the codebase). Reach for Tamagui only when its layout primitives buy you something concrete.
- App version lives in `app.json` (`expo.version` and `ios.buildNumber`). Bump both when cutting a release; `eas.json` production builds auto-increment build number.
