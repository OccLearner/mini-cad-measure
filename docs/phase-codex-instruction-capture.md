# Phase: Codex Instruction Capture

## Status

Done

## Task Definition

目标：建立并遵守 Codex 指令沉淀规则，让后续 Phase 和子任务的目标、执行要求、验收标准、结果记录都能沉淀到项目文档中。

范围：

- 更新长期执行规则，让 Codex 在开始新 Phase 或子任务前先维护对应 `docs/phase-*.md`。
- 建立可复用 prompt 的保存位置 `docs/codex-prompts.md`。
- 建立长期规则和反复问题的记录位置 `docs/review.md`。
- 不保存完整聊天记录，只保存可复用、可执行、可验收的指令。

技术要求：

- 使用 Markdown 文档，不引入代码依赖。
- 将长期行为规则写入 `AGENTS.md`，确保后续任务可见。
- 文档结构应便于持续追加，不绑定某一次聊天上下文。

测试要求：

- 对修改或新增的 Markdown 文件运行 Prettier。
- 运行 `pnpm format:check`，如果本地 `pnpm` 不可用则使用 `corepack pnpm format:check` 复核并记录。

验收标准：

- `AGENTS.md` 明确包含 Codex 指令沉淀流程。
- `docs/codex-prompts.md` 存在，并保存本规则对应的可复用 prompt。
- `docs/review.md` 存在，可记录长期规则和反复问题。
- 本 phase 文档包含状态、完成记录、修改文件、测试结果、失败项和下一步建议。

## Completion Log

完成内容：

- 在 `AGENTS.md` 中新增 Codex 指令沉淀长期规则。
- 新增 `docs/codex-prompts.md`，保存可复用 prompt 的写法和本规则 prompt。
- 新增 `docs/review.md`，作为长期规则和反复问题的沉淀入口。
- 新增本 phase 文档，记录任务定义、状态、验收标准和完成结果。

修改文件：

- `AGENTS.md`
- `docs/codex-prompts.md`
- `docs/review.md`
- `docs/phase-codex-instruction-capture.md`

测试：

- `corepack pnpm prettier AGENTS.md docs/phase-codex-instruction-capture.md docs/codex-prompts.md docs/review.md --write`
- `pnpm format:check`（未启动，见失败项）
- `corepack pnpm format:check`（通过）

失败项：

- `pnpm format:check`：当前 PowerShell 无法识别 `pnpm` 命令。已使用 `corepack pnpm format:check` 复核通过。

下一步建议：

- 后续每个 Phase 或子任务开始前，先维护对应 `docs/phase-*.md`。
- 如果 prompt 可复用或代表长期工作流，追加到 `docs/codex-prompts.md`。
