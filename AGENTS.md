# AGENTS.md
Guidance for coding agents working in this repository.
Current stack: Next.js 14 (App Router) + React 18 + TypeScript + Supabase.

## 1) Project Snapshot
- Frontend app lives in `src/app` and `src/components`.
- Data/auth is handled via Supabase client SDK (no custom backend API routes in repo).
- Shared domain logic is in `src/lib` (`incidents.ts`, `types.ts`, `supabase-client.ts`).
- Styling is mixed: global CSS vars/utilities in `src/app/globals.css` + inline style objects in TSX.
- Main UI libraries: `recharts`, `react-datepicker`, `date-fns` locale `es`.
- TypeScript is strict: `strict`, `noImplicitAny`, `strictNullChecks` are enabled.

## 2) Rule Files (Cursor/Copilot)
Checked for additional local instruction files:
- `.cursorrules`: not present
- `.cursor/rules/`: not present
- `.github/copilot-instructions.md`: not present
If these files are added later, treat them as higher-priority instructions.

## 3) Build, Lint, Typecheck, Test Commands
Run all commands from repo root:
`C:\Users\sebas\OneDrive\Desktop\historyapp\historyapp`

### Install
```bash
npm install
```

### Dev
```bash
npm run dev
```

### Production Build + Start
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

### Lint a Single File
```bash
npm run lint -- --file src/components/incident-form.tsx
```

### Typecheck
```bash
npm run type-check
```

### Tests (important)
Current state of this repository:
- No `npm test` script in `package.json`.
- No Jest/Vitest/Playwright config files are present.
- There is no automated unit/integration test runner configured.

Meaning of "run a single test" right now:
- Run one manual scenario from `TESTING.md` while app is running in dev.

Manual single-scenario flow:
1. Start app with `npm run dev`.
2. Execute one case from `TESTING.md` (for example: "Test 3: Buscar incidencia").
3. Record pass/fail plus browser console or network errors.

### Database Setup
- SQL source of truth: `scripts/schema.sql`.
- Helper script with setup steps: `scripts/setup-instructions.sh`.
- `npm run setup-db` is currently broken because `scripts/setup-db.js` is missing.

## 4) Agent Workflow Expectations
1. Read relevant files first (`src/app`, `src/components`, `src/lib`).
2. Keep changes minimal and scoped; avoid broad refactors unless requested.
3. After edits, run `npm run lint` and `npm run type-check`.
4. Run `npm run build` if changes can affect runtime behavior.
5. For UI/data-flow changes, run at least one manual scenario from `TESTING.md`.

## 5) Code Style Guidelines
These rules are based on current code conventions.

### 5.1 Imports and Modules
- Prefer alias imports with `@/` for app code.
  - Example: `import { createClient } from '@/lib/supabase-client'`
- Same-folder relative imports are acceptable.
  - Example: `import Logo from './logo'`
- Keep import groups ordered: React/third-party first, internal modules second.
- Prefer explicit type imports when useful.

### 5.2 TypeScript
- Keep strict typing intact; do not relax TS config.
- Prefer explicit interfaces/types for domain models in `src/lib/types.ts`.
- Use `Partial<T>` only for actual partial update payloads.
- Avoid new `any`; if unavoidable, isolate and document the reason.
- Handle nullables explicitly and guard before operations.
- Keep DB-oriented fields in snake_case where schema already uses it.

### 5.3 Naming
- Components: PascalCase (`IncidentForm`, `IncidentsChart`).
- Variables/functions: camelCase (`loadSession`, `saveTechnicianName`).
- React state setter pairs: `x` with `setX`.
- Props interfaces: `<ComponentName>Props`.
- Entity types/interfaces: singular nouns (`Incident`, `CreateIncidentInput`).

### 5.4 React Patterns
- Use functional components + hooks.
- Add `'use client'` to components using hooks/browser APIs.
- Keep side effects in `useEffect` with correct dependency arrays.
- Use `useMemo` for derived collections when sorting/filtering is non-trivial.
- Keep UI state local unless sharing is required.

### 5.5 Formatting and Styling
- Follow existing style: single quotes, no semicolons, readable multiline JSX.
- Reuse CSS vars from `src/app/globals.css` (`--bg-*`, `--text-*`, `--accent-*`).
- Reuse utility classes (`btn`, `btn-primary`, `btn-secondary`, `card`) when possible.
- Keep Spanish UI copy consistent with existing wording.

### 5.6 Data and Supabase
- Use `createClient()` from `src/lib/supabase-client.ts`.
- Keep query/mutation logic in `src/lib/incidents.ts` (or similarly scoped lib files).
- Preserve RLS assumptions and ownership boundaries (`user_id`).
- Do not trust client-editable `responsible`; enforce from authenticated user metadata.
- Preserve existing list filtering/sorting behavior unless change is requested.

### 5.7 Error Handling
- Use `try/catch/finally` around async UI/data operations.
- Convert unknown errors safely:
  - `err instanceof Error ? err.message : 'fallback message'`
- Surface user-friendly messages via component state (`error`, `listError`, etc.).
- Fail fast for missing auth/session prerequisites (e.g., `Not authenticated`).
- Do not silently swallow errors without explicit UX reason.

### 5.8 Security and Secrets
- Never commit real credentials.
- Keep public client vars prefixed with `NEXT_PUBLIC_`.
- Do not bypass RLS assumptions in frontend logic.

## 6) Folder Conventions
- `src/app/*`: app entry, layout, global styles.
- `src/components/*`: interactive/presentational components.
- `src/lib/*`: data access and typed domain helpers.
- `scripts/schema.sql`: DB schema + RLS policies source of truth.

## 7) Common Pitfalls
- Do not document or run test commands that do not exist in this repo.
- Do not rely on `npm run setup-db` until `scripts/setup-db.js` exists.
- Do not rename DB fields to camelCase without a full migration plan.
- Do not replace the existing inline-style/CSS-variable approach unless requested.
- Do not weaken TypeScript strictness for convenience.

## 8) If You Add Automated Tests Later
When adding a test framework, update this file with:
- exact full-suite command,
- exact single-test command syntax,
- test file location conventions,
- expected CI verification behavior.
Until then, manual scenarios in `TESTING.md` are the official test baseline.

## 9) Custom Frontend Reviewer Agent (Advisor)
Use the custom advisory agent spec for UI compliance reviews:
- Agent definition: `docs/agents/frontend-compliance-reviewer.md`
- Rule catalog (110 checks): `docs/agents/ui-ruleset-v1.md`
- Report format: `docs/agents/ui-review-report-template.md`

Operating mode requirements:
- Advisory only: do not block merges.
- Always include evidence with file paths and line numbers.
- Always score by category (A11y/Perf/UX) and provide top 5 quick wins.
- For high-severity findings, suggest at least one manual validation scenario from `TESTING.md`.
