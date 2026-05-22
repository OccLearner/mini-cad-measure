# Codex Prompts

This file stores repeatable or important Codex prompts for this project. Keep entries concise, executable, and verifiable. Do not paste full chat transcripts.

## Prompt Entry Template

```md
## <Prompt Name>

Use when: <when to reuse this prompt>

Prompt:
<reusable instruction text>

Acceptance:

- <observable result>
```

## Codex Instruction Capture Rules

Use when: establishing or reinforcing project rules for preserving Codex task intent, reusable prompts, and execution results.

Prompt:

```text
请在本项目中建立并遵守 Codex 指令沉淀规则。

要求：
1. 每次开始新的 Phase 或子任务前，先把任务目标、范围、技术要求、测试要求、验收标准写入对应 docs/phase-*.md。
2. 每个可重复执行或重要的 Codex Prompt，都要保存到 docs/codex-prompts.md。
3. 每次完成一个子任务后，更新对应 phase 文档中的状态：Not Started、In Progress、Done、Blocked。
4. 每次完成一个子任务后，记录完成内容、修改文件、测试命令、失败项和下一步建议。
5. 如果开发过程中发现长期规则或反复问题，更新 docs/review.md 或 AGENTS.md。
6. 一次性 bug 修复 prompt 不必保存，除非它代表长期规则。
7. 不要把所有聊天内容原样复制进文档，只保存可复用、可执行、可验收的指令。
```

Acceptance:

- `AGENTS.md` contains the long-term instruction capture workflow.
- The relevant `docs/phase-*.md` records task definition and completion status.
- `docs/codex-prompts.md` stores reusable prompts in a concise format.
- `docs/review.md` exists for long-term rules and repeated issues.
