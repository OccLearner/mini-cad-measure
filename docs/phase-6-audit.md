# Phase 6 Audit

审计日期：2026-05-20

## 审计结论

当前实现与 `docs/product.md`、`docs/architecture.md`、`docs/codex-tasks.md` 的 Phase 1-5 目标总体一致：项目仍是无后端、无文件导入、无 3D 的轻量 2D SVG CAD 测量 demo，核心绘制、选择、测量、历史和本地保存流程已经可用。

主要差距集中在 CAD 常见交互完整性上：缺少键盘快捷键、删除、清空、Fit All、吸附和更符合 CAD 直觉的命中测试。代码结构上，`CadCanvas` 和 `useDocumentStore` 已经承担较多职责，后续继续扩展交互前建议先拆分。

## 已完成内容

| 项目                    | 状态           | 证据                                                                                                     |
| ----------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| SVG 画布                | 已完成         | `CadCanvas` 渲染 `<svg>`，使用固定 `viewBox` 和 SVG 图元。                                               |
| 世界坐标 / 屏幕坐标转换 | 已完成         | `src/geometry/viewport.ts` 提供 `screenToWorld`、`worldToScreen`、`toWorldTransform`，并有 Vitest 覆盖。 |
| 网格和坐标轴            | 已完成         | `CadCanvas` 根据可见世界边界生成网格刻度，并渲染 X/Y 轴与原点。                                          |
| 鼠标坐标显示            | 已完成         | `CadCanvas` 更新 `cursorWorld`，`StatusBar` 显示当前 X/Y。                                               |
| 平移和缩放              | 已完成         | 支持 pan 工具、鼠标中键平移、滚轮缩放、工具栏缩放和重置视图。                                            |
| 绘制直线、矩形、圆      | 已完成         | `cad/entities.ts` 定义实体与 draft 创建逻辑，`CadCanvas` 实现绘制流程，`CadEntities` 渲染。              |
| 选择对象                | 已完成         | select 工具调用 `hitTestEntities`，选中对象有 selection halo。                                           |
| 属性面板                | 已完成         | `PropertiesPanel` 显示类型、ID、几何信息，并支持线宽和颜色编辑。                                         |
| 两点距离测量            | 已完成         | `cad/measurements.ts` 创建测量，`CadMeasurements` 渲染测量线、端点和距离标签。                           |
| 撤销 / 重做             | 基础可用       | `useDocumentStore` 有 undo/redo 栈，顶部工具栏有按钮；缺少键盘快捷键。                                   |
| 本地保存 / 加载         | 基础可用       | `documentPersistence.ts` 使用版本化 `localStorage` payload，App 启动时尝试加载。                         |
| Playwright E2E 测试     | 已具备基础覆盖 | `e2e/app.spec.ts` 覆盖 shell 渲染、绘制、选择、测量、历史和保存加载 smoke flow。                         |

与文档的一致性：

- `docs/product.md` 的目标能力大多已有基础实现，非目标仍被遵守：未发现后端、文件导入、3D、canvas 或 WebGL。
- `docs/architecture.md` 描述的模块基本存在，UI state 与 document state 已分离，几何与命中测试逻辑可在 React 外测试。
- `docs/codex-tasks.md` Phase 1-5 均标记完成，当前代码能支撑这些阶段的基础验收。

## 缺失内容

- `Esc` 取消当前绘制/测量：未发现 `keydown`、`Escape` 或全局键盘处理；当前只能通过切换工具间接取消部分 measurement draft。
- `Delete` 删除选中对象：未发现删除实体 action 或键盘处理。
- `Ctrl+Z` / `Ctrl+Shift+Z`：store 和工具栏按钮可 undo/redo，但未发现键盘快捷键。
- 清空画布：`clearDocument` 已存在且有单测，但没有 UI 入口；当前用户无法从界面触发。
- 删除测量：measurement 只能创建、保存、加载和撤销；没有选择或删除测量的 workflow。
- Fit All / Zoom to Fit：当前只有 reset view、zoom in、zoom out，没有基于实体和测量包围盒的视图适配。
- 网格吸附：未发现 snap 相关模块、状态或 pointer 处理。
- 端点 / 中点 / 圆心捕捉：未发现实体特征点捕捉逻辑。
- CAD 直觉命中测试：当前线段按距离命中；矩形命中整个填充边界；圆命中整个圆盘半径范围。对 `fill: none` 的 CAD 图元来说，矩形和圆更应优先按可见边线、控制点或特征点命中。

## 风险点

- `CadCanvas.tsx` 约 388 行，混合了网格计算、坐标转换、pointer 事件、平移缩放、绘制、测量、选择和渲染装配；继续加入键盘、删除、吸附和 Fit All 会让组件更难维护。
- `useDocumentStore.ts` 约 319 行，承担实体、测量、draft、选择、历史、保存状态和 persistence 调用；后续若加入删除测量、批量清空和 snapping state，store 职责会继续膨胀。
- 渲染层已拆出 `CadEntities`、`CadMeasurements`，但交互层仍主要集中在 `CadCanvas`，缺少可独立测试的交互 hook。
- E2E 覆盖偏 smoke：没有覆盖键盘、取消、删除、清空、Fit All、吸附、复杂命中测试或失败路径。
- UI 文案和可访问名称在多个文件中显示为乱码，例如 toolbar、status bar、properties panel 和 E2E selector。虽然 lint/build 通过，但这会影响真实用户体验和测试可读性。
- Playwright 用例本身显示通过，但本次 `corepack pnpm test:e2e` 进程未正常退出，被 180 秒超时终止；需要单独排查 runner、webServer 或本地进程退出问题。
- 直接运行 `pnpm` 在当前 PowerShell 环境不可用；需要统一开发环境入口，否则 AGENTS.md 中要求的验证命令无法按原样执行。

## 推荐修复顺序

1. 修复验证入口和 E2E 退出问题。
   - 验收标准：在 PowerShell 中直接运行 `pnpm test`、`pnpm lint`、`pnpm build`、`pnpm test:e2e` 均可启动；E2E 两个用例通过后进程以 exit code 0 退出，不依赖手动超时。

2. 修复 UI 文案编码和可访问标签。
   - 验收标准：顶部工具栏、左侧工具栏、状态栏、属性面板和 canvas aria label 显示正常中文；E2E selector 不再依赖乱码文本；现有测试、lint、build 通过。

3. 增加键盘交互层。
   - 验收标准：`Esc` 取消当前 draw draft 或 measurement draft；`Ctrl+Z` 触发 undo；`Ctrl+Shift+Z` 触发 redo；输入框聚焦时快捷键不会误伤编辑；E2E 或单元测试覆盖这些路径。

4. 增加删除和清空 workflow。
   - 验收标准：`Delete` 删除选中实体；UI 有清空画布入口；测量可以被删除或通过明确的测量删除入口移除；删除和清空都会写入 undo/redo 历史，undo 可恢复。

5. 增加 Fit All / Zoom to Fit。
   - 验收标准：对所有实体和测量计算世界坐标包围盒并加入 padding；空文档时回到默认视图；缩放范围遵守现有 `MIN_ZOOM` / `MAX_ZOOM`；viewport math 有单元测试。

6. 增加吸附基础能力。
   - 验收标准：绘制和测量 pointer 点可吸附到网格、线端点、线中点、矩形角点/中点、圆心；吸附容差按屏幕像素换算到世界坐标；候选点和优先级在纯函数中测试。

7. 改进 CAD 命中测试。
   - 验收标准：矩形和圆默认按可见边线命中，而不是整块内部区域；线、矩形、圆都使用 zoom-adjusted tolerance；重叠实体仍选择最上层；测试覆盖内部点击、边线点击和近边容差。

8. 拆分 canvas 和 store 职责。
   - 验收标准：`CadCanvas` 只负责 SVG 容器装配和连接 hooks；pointer/drawing/measure/pan 逻辑拆成可测试 hook 或 helper；history/persistence 的 store 逻辑边界更清晰；现有功能无回归。

## 命令运行结果

按用户要求直接运行的命令：

| 命令            | 结果             | 失败原因 / 输出摘要                                                        |
| --------------- | ---------------- | -------------------------------------------------------------------------- |
| `pnpm test`     | 失败，命令未启动 | PowerShell 报错：无法将 `pnpm` 识别为 cmdlet、函数、脚本文件或可运行程序。 |
| `pnpm lint`     | 失败，命令未启动 | 同上，`pnpm` 不在当前 PATH / shim 不可用。                                 |
| `pnpm build`    | 失败，命令未启动 | 同上，`pnpm` 不在当前 PATH / shim 不可用。                                 |
| `pnpm test:e2e` | 失败，命令未启动 | 同上，`pnpm` 不在当前 PATH / shim 不可用。                                 |

环境补充：

- `node --version` 输出 `v22.12.0`。
- `corepack --version` 输出 `0.29.4`。
- `corepack pnpm --version` 输出 `10.12.1`。
- `npm --version` 在 PowerShell 中被执行策略拦截：`npm.ps1` 未数字签名，无法运行脚本。
- `git status --short` 因 dubious ownership 被 Git 拒绝，提示当前用户为 `CodexSandboxOffline`，仓库 owner 为 `immortalCodeSh`。

使用 Corepack 复核的等价命令：

| 命令                     | 结果               | 输出摘要                                                                       |
| ------------------------ | ------------------ | ------------------------------------------------------------------------------ |
| `corepack pnpm test`     | 通过               | Vitest 7 个测试文件、33 个测试全部通过。                                       |
| `corepack pnpm lint`     | 通过               | `eslint . --max-warnings=0` 无报错。                                           |
| `corepack pnpm build`    | 通过               | `tsc -b && vite build` 成功，Vite 构建完成。                                   |
| `corepack pnpm test:e2e` | 用例通过但命令超时 | Playwright 两个 msedge 用例均显示 `ok`，但进程 180 秒未退出，被 timeout 终止。 |
