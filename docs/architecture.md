# mini-cad-measure Architecture

## Stack

- Vite for local development and production bundling.
- React and TypeScript for UI composition and type safety.
- SVG as the rendering surface for CAD entities.
- Zustand for client-side UI and document state.
- Vitest for unit tests.
- Playwright for future browser-level smoke and interaction tests.

## Current Structure

- `src/main.tsx` mounts the React app.
- `src/App.tsx` composes the application shell.
- `src/cad/entities.ts` defines supported CAD entity types and drawing draft validation.
- `src/cad/hitTest.ts` contains pure hit-testing utilities for selection.
- `src/cad/measurements.ts` defines two-point distance measurements.
- `src/components/*` contains layout-level UI pieces.
- `src/geometry/viewport.ts` contains pure viewport math for coordinate conversion, zoom, pan, and visible bounds.
- `src/store/documentPersistence.ts` serializes and parses local document saves.
- `src/store/useDocumentStore.ts` holds document entities and the active drawing draft.
- `src/store/useUiStore.ts` holds UI and viewport state for the shell.
- `docs/*` captures product, architecture, and task planning notes.

## State Direction

UI state is kept separate from CAD document state. `useUiStore` owns active tool, viewport, zoom, pan center, and cursor coordinates. `useDocumentStore` owns committed entities, distance measurements, active drafts, selected entity id, undo/redo stacks, and save status.

Recommended future state boundaries:

- UI state: active tool, panels, viewport, cursor.
- Document state: entities, selection, layers, drawing defaults.
- History state: undo and redo stacks.
- Persistence state: local save/load serialization.

Selection is implemented through pure hit testing in world coordinates. The canvas converts pointer positions into world points, applies a zoom-adjusted tolerance, and selects the topmost hit entity.

Distance measurement is represented separately from CAD entities. Measurements are annotations with start/end points and a computed distance, so future entity editing does not need to special-case measurement objects.

Local persistence uses `localStorage` with a versioned payload. Undo/redo stores bounded document snapshots for this demo; this is simple and adequate for the current learning scope.

## Rendering Direction

SVG should remain the primary render surface. Geometry calculations should be kept in TypeScript utility modules so they can be tested without a browser.

The viewport uses a fixed SVG viewBox as screen space and maps it to CAD-style world coordinates with a y-up convention. The initial world origin is centered in the canvas.

## Testing Direction

- Unit-test pure geometry utilities and state transitions with Vitest.
- Add focused component tests only when UI behavior becomes non-trivial.
- Use Playwright for smoke coverage and important pointer workflows once CAD interactions are implemented.

Playwright is configured to run against the system Microsoft Edge channel to avoid depending on Playwright-managed browser downloads in this local Windows environment.
