# AGENTS.md

## Project Rules

- This project is a lightweight internal 2D CAD measuring demo named `mini-cad-measure`.
- Keep the scope intentionally small: no backend, no file import, and no 3D.
- Use Vite, React, TypeScript, SVG, Zustand, Vitest, Playwright, and pnpm.
- Prefer small, typed modules over large component files.
- Keep geometry and state transitions testable outside React components.
- Do not introduce canvas/WebGL rendering unless the project direction changes explicitly.
- Do not add broad CAD features without a task that names the specific workflow.

## Code Style

- Keep TypeScript strict.
- Use existing layout and state patterns before adding new abstractions.
- Use SVG elements for CAD rendering.
- Keep UI text concise and utilitarian.
- Use Prettier for formatting and ESLint for static checks.

## Verification

Before handing off code changes, run:

```sh
pnpm test
pnpm lint
pnpm build
```

If a command cannot run because dependencies or browsers are missing, state the exact blocker and the command that failed.
