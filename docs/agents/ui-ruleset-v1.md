# UI Ruleset v1 (110 Rules)

Use this ruleset for advisory frontend compliance reviews.

## Accessibility (45 rules)

### Semantics and structure
- A11Y-001: Page has one primary `h1` and logical heading order.
- A11Y-002: Landmark regions are present (`header`, `main`, `nav`, `footer` when applicable).
- A11Y-003: Interactive controls use semantic elements (`button`, `a`, `input`).
- A11Y-004: Clickable non-semantic elements have keyboard support and role.
- A11Y-005: Lists and tables use semantic containers and child tags correctly.
- A11Y-006: Modal/dialog content is identifiable as a dialog pattern.
- A11Y-007: Language attribute is set on root document.
- A11Y-008: Decorative icons/images are hidden from assistive tech when appropriate.

### Keyboard and focus
- A11Y-009: All interactive elements are reachable by keyboard.
- A11Y-010: Focus order matches visual and reading order.
- A11Y-011: No keyboard trap in modal, menu, or custom widgets.
- A11Y-012: Visible focus indicator is present and high contrast.
- A11Y-013: Focus is moved into modal on open and restored on close.
- A11Y-014: Escape key closes dismissible overlays.
- A11Y-015: Hover-only affordances have keyboard equivalents.
- A11Y-016: Disabled controls are not focus traps.

### Forms and input
- A11Y-017: Every input has an associated label.
- A11Y-018: Required fields are indicated programmatically and visually.
- A11Y-019: Error messages are specific and tied to relevant fields.
- A11Y-020: Error state is not conveyed by color alone.
- A11Y-021: Placeholder text is not the only source of instruction.
- A11Y-022: Input purpose and format hints are clear for date/time/email fields.
- A11Y-023: Form submission feedback is announced and visible.
- A11Y-024: Validation does not erase user-entered data unexpectedly.

### Names, roles, values
- A11Y-025: Controls have accessible names matching visible labels.
- A11Y-026: Icon-only buttons have `aria-label`.
- A11Y-027: State toggles expose current state (`aria-pressed`, `aria-expanded`).
- A11Y-028: Custom components expose role and value semantics.
- A11Y-029: Table headers map to data cells.
- A11Y-030: Links describe destination without relying on context alone.

### Contrast, readability, motion
- A11Y-031: Text contrast meets WCAG AA (normal and large text).
- A11Y-032: UI component boundaries have sufficient contrast.
- A11Y-033: Focus ring contrast is sufficient on all backgrounds.
- A11Y-034: Error/success/warning colors remain readable on backgrounds.
- A11Y-035: Text is resizable without loss of content/function.
- A11Y-036: Line height and spacing are readable for paragraphs.
- A11Y-037: Animations do not trigger vestibular issues unnecessarily.
- A11Y-038: Respect reduced motion preference where animation is significant.

### Media and dynamic updates
- A11Y-039: Images have meaningful `alt` text or empty alt when decorative.
- A11Y-040: Data visualizations include text alternative/summary.
- A11Y-041: Loading state is communicated to screen readers.
- A11Y-042: Empty states provide clear next action.
- A11Y-043: Status updates are announced politely when needed.
- A11Y-044: Time-sensitive actions provide enough time or extension.
- A11Y-045: No content flashes at unsafe frequencies.

## Performance (35 rules)

### Rendering and React behavior
- PERF-001: Avoid unnecessary re-renders from unstable inline functions/objects when costly.
- PERF-002: Use `useMemo`/`useCallback` for expensive derived computations.
- PERF-003: Avoid state updates that can be derived from props in render.
- PERF-004: Avoid duplicate fetches from overlapping effects.
- PERF-005: Effect dependencies are accurate; no stale closure bugs.
- PERF-006: Large lists/tables are optimized for rendering cost.
- PERF-007: Avoid blocking synchronous work on input handlers.
- PERF-008: Avoid repeated date parsing in tight render loops.

### Network and data
- PERF-009: Fetch only required fields where practical.
- PERF-010: Avoid N+1 query patterns in UI loops.
- PERF-011: Use server-side filtering/sorting when data volume grows.
- PERF-012: Debounce high-frequency search/filter requests.
- PERF-013: Handle loading and retry to avoid repeated manual refresh loops.
- PERF-014: Cache or reuse stable data where sensible.
- PERF-015: Avoid redundant auth/session calls per render cycle.

### Asset and bundle hygiene
- PERF-016: Use Next.js optimized image/font patterns when applicable.
- PERF-017: Avoid oversized third-party packages for simple tasks.
- PERF-018: Dynamically import heavy components when not always needed.
- PERF-019: Keep chart components lean and avoid unnecessary chart redraws.
- PERF-020: Limit CSS bloat; remove dead utility classes where possible.
- PERF-021: Avoid duplicate style logic scattered across many components.
- PERF-022: Ensure source maps/build flags align with environment.

### Runtime and interaction
- PERF-023: Inputs remain responsive during async operations.
- PERF-024: Long tasks are minimized on page load.
- PERF-025: Skeletons/spinners are lightweight and not overused.
- PERF-026: Avoid expensive layout thrashing in animation.
- PERF-027: Prefer transform/opacity for animations over layout properties.
- PERF-028: Tables/charts remain usable on low-end devices.
- PERF-029: Modals do not trigger costly full-page rerenders.
- PERF-030: Avoid storing large transient payloads in component state.

### Core Web Vitals alignment
- PERF-031: Largest content appears quickly (LCP-friendly above-the-fold).
- PERF-032: Avoid layout shifts from late content insertion (CLS).
- PERF-033: First interaction remains responsive (INP/FID-friendly patterns).
- PERF-034: Keep hydration work reasonable for client-heavy pages.
- PERF-035: Production build path is verified after impactful UI changes.

## UX (30 rules)

### Information architecture and clarity
- UX-001: Primary actions are visually prominent and context-appropriate.
- UX-002: Secondary/destructive actions are clearly differentiated.
- UX-003: Screen title and section labels reflect user intent.
- UX-004: Terminology is consistent across forms, lists, and dialogs.
- UX-005: Dense screens are chunked into scannable sections.
- UX-006: Important metadata is visible without opening detail views.

### Feedback and system status
- UX-007: Every async action has loading feedback.
- UX-008: Success feedback is specific and time-appropriate.
- UX-009: Error feedback explains cause and recovery path.
- UX-010: Empty states suggest what to do next.
- UX-011: Retry actions are available for recoverable failures.
- UX-012: Disabled buttons explain why action is unavailable when needed.

### Forms and data entry
- UX-013: Forms request only necessary information.
- UX-014: Field order follows natural mental model.
- UX-015: Defaults are sensible and safe.
- UX-016: Date/time inputs use locale-appropriate format.
- UX-017: Inline hints reduce ambiguity before submit.
- UX-018: Prevent accidental destructive actions with confirmation.

### Consistency and visual system
- UX-019: Spacing follows consistent rhythm.
- UX-020: Typography hierarchy is clear and stable.
- UX-021: Color usage maps to semantic meaning consistently.
- UX-022: Button styles are reused instead of ad hoc one-offs.
- UX-023: Card/table/section patterns stay consistent across pages.
- UX-024: Microcopy tone is consistent (Spanish in this project).

### Navigation and discoverability
- UX-025: Key workflows are reachable in minimal steps.
- UX-026: Search and filters are discoverable and reversible.
- UX-027: Sorting controls reflect current state clearly.
- UX-028: Modal close affordances are obvious and redundant (button + backdrop + Escape).

### Responsive behavior
- UX-029: Layout adapts for mobile, tablet, desktop without broken interactions.
- UX-030: Horizontal scroll is avoided except where structurally necessary (e.g., data tables).

## Mapping notes
- Accessibility score uses only A11Y rules.
- Performance score uses only PERF rules.
- UX score uses only UX rules.
- Findings should always reference at least one rule ID.
