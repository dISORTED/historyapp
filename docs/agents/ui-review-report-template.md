# UI Compliance Review Report Template

Use this structure for consistent advisory reports.

## Executive Summary
- Scope reviewed: `<full repo | files | PR diff>`
- Overall score: `<0-100>`
- Accessibility score: `<0-100>`
- Performance score: `<0-100>`
- UX score: `<0-100>`
- Recommendation: `<ready with caveats | prioritize fixes | high-risk areas>`

## Findings

| Rule ID | Severity | Evidence | Impact | Recommendation |
|---|---|---|---|---|
| A11Y-017 | high | `src/components/incident-form.tsx:210` | Input lacks robust labeling context in some flows | Ensure explicit label association and `aria-describedby` for hints/errors |
| PERF-012 | medium | `src/components/incident-list.tsx:67` | Search triggers frequent requests while typing | Add debounce before data fetch |
| UX-009 | medium | `src/components/auth.tsx:45` | Errors are shown but not always actionable | Add recovery instruction for common auth errors |

## Top 5 Quick Wins
1. `<quick win 1>`
2. `<quick win 2>`
3. `<quick win 3>`
4. `<quick win 4>`
5. `<quick win 5>`

## Category Breakdown

### Accessibility
- Passed checks: `<count>`
- Violations: `<count>`
- Critical notes: `<short bullets>`

### Performance
- Passed checks: `<count>`
- Violations: `<count>`
- Critical notes: `<short bullets>`

### UX
- Passed checks: `<count>`
- Violations: `<count>`
- Critical notes: `<short bullets>`

## Suggested Manual Verification
- Run app: `npm run dev`
- Scenario 1: pick one relevant case from `TESTING.md`
- Scenario 2: keyboard-only navigation on affected screen
- Scenario 3: mobile viewport check for impacted components

## Release Risk Notes (Advisory)
- `blocker`: `<count>`
- `high`: `<count>`
- `medium`: `<count>`
- `low`: `<count>`
- Advisory call: `<proceed with caveats | fix highs first | deep follow-up needed>`
