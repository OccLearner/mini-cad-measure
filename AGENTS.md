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
- After adding or modifying files, run Prettier on the touched files before handoff.

## Codex Instruction Capture

- Before starting a new Phase or subtask, create or update the corresponding `docs/phase-*.md` with the task goal, scope, technical requirements, test requirements, acceptance criteria, and current status.
- Track subtask status in the relevant phase document using only: `Not Started`, `In Progress`, `Done`, or `Blocked`.
- After completing a subtask, update the relevant phase document with what was completed, files changed, tests run, failures or blockers, and recommended next steps.
- Save repeatable or important Codex prompts in `docs/codex-prompts.md`; one-off bug-fix prompts do not need to be saved unless they establish a long-term rule.
- When development reveals a long-term rule or repeated issue, update `docs/review.md` or this `AGENTS.md`.
- Do not copy whole chat transcripts into docs. Keep only reusable, executable, and verifiable instructions.

## Verification

Before handing off code changes, run:

```sh
pnpm format:check
pnpm test
pnpm lint
pnpm build
```

If a command cannot run because dependencies or browsers are missing, state the exact blocker and the command that failed.
