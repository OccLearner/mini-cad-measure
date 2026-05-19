# Codex Task Plan

## Phase 1: Project Shell

- [x] Create Vite, React, TypeScript project skeleton.
- [x] Configure ESLint, Prettier, Vitest, and Playwright.
- [x] Create base layout: top toolbar, left toolbar, central canvas, right properties panel, bottom status bar.
- [x] Add project documentation and agent rules.
- [x] Verify with `pnpm test`, `pnpm lint`, and `pnpm build`.

## Phase 2: Viewport Basics

- [x] Implement canvas coordinate conversion.
- [x] Add pointer coordinate tracking.
- [x] Add zoom controls and mouse wheel zoom.
- [x] Add pan mode and middle-button pan.
- [x] Expand tests for viewport math.

## Phase 3: Drawing Entities

- [x] Define line, rectangle, and circle entity types.
- [x] Implement drawing workflows for each entity type.
- [x] Render SVG entities from document state.
- [x] Add basic validation and unit tests.

## Phase 4: Selection and Properties

- [x] Implement hit testing.
- [x] Add selection state.
- [x] Populate the properties panel from selected entities.
- [x] Support simple property edits where appropriate.

## Phase 5: Measurement and History

- [x] Implement two-point distance measurement.
- [x] Add undo and redo stacks.
- [x] Add local save/load through browser storage.
- [x] Add Playwright coverage for the main workflows.
