---
kind: execution-log
cycle: C002-hypodoc-rendering-quality-performance
updated: 2026-08-09
---

# HypoDoc 渲染质量与性能优化执行记录

## 2026-08-09 - M1 获准开始

- **计划项：** `M1`
- **决定：** 用户选择“确认并开始”，接受完整 Proposal，授权建立审计与性能/视觉基线。
- **边界：** M1 只产生诊断、基线、审计报告和必要的验证 harness；到达 `S1` 后停止等待审阅，
  不提前进入 M2-M8 产品实现。
- **下一步：** 复现 LaTeX 主题/模板问题，盘点跨 renderer 差异，采集性能和视觉证据。

## 2026-08-09 - M1 完成，S1 等待审阅

- **计划项：** `M1` → `S1`
- **动作：** 审计 parser/render-model/render-web、公开 Skill/template、LaTeX Python/Pandoc/Lua/TeX
  边界；运行全量 TS 与 pinned/unpinned LaTeX 验证；复现 theme capability、template compatibility、
  toolchain、resource containment 与 raw metadata 问题；新增 rendering/Desktop performance 与 slides
  gap harness；生成 Desktop/PDF 视觉证据和正式审计报告。
- **结果：** `M1` completed；`S1` waiting-review。确认 5 个 High、5 个 Medium finding；不建议
  推翻 LaTeX renderer，也暂不需要修改 Spec，建议以 canonical source、renderer-owned SlideDeck、
  capability manifest、明确 trust boundary 和 visual-role mapping 推进。
- **验证：** TypeScript typecheck/build/27 tests 全绿；Desktop Playwright desktop/mobile smoke 通过；
  pinned Pandoc 3.10 下 LaTeX 254 passed/12 skipped；Beamer PDF 8 页 16:9、37,613 bytes；所有
  baseline JSON 可解析、截图非空、`git diff --check` 通过。
- **性能基线：** 1MiB parser+model p95 15.060ms；projection p95 6.024ms；Desktop edit-to-preview
  median 179.657ms/p95 456.935ms；initial JS gzip 315,125B；Mermaid gzip 817,697B；代表性 Beamer
  build 4.51s。
- **问题与处置：** 首次 LaTeX test 用系统 Pandoc 3.1.3 出现 snapshot failure，改用项目 pinned
  3.10 后全绿并将 doctor version gap 记为 F6；首次 browser perf fixture 不确定导致 Mermaid timeout，
  固定 localStorage 后成功；根 harness 不合法导入 React，收缩为 parser/model，真实 render 交给
  Playwright 测量。
- **证据：** `Docs/audits/rendering-architecture-audit.md`、`reports/*baseline.json`、
  `reports/visual-baseline/`、`Apps/Desktop/test/playwright_*baseline.py`、
  `tools/rendering-audit-baseline.mts`。
- **下一步：** 用户接受 S1 后进入 M2，并行推进 M4 的 capability/config 安全修复；拒绝则按具体
  反馈修订架构与阈值。

## 2026-08-09 - S1 接受，M2 开始

- **计划项：** `S1` → `M2`
- **决定：** 用户接受审计结论、目标架构与性能阈值，授权按 Plan 自动推进至 S2。
- **接受范围：** canonical source、renderer-owned SlideDeck、LaTeX capability manifest/结构化配置、
  trusted-local trust boundary、cross-renderer visual-role mapping，以及审计报告中的量化 gates。
- **下一步：** 在 `Packages/render-model` 实现 SlideDeck 与 located diagnostics，并用 canonical
  Beamer fixture 验证 frame membership。

## 2026-08-09 - M2 SlideDeck 投影完成，M3 开始

- **计划项：** `M2` → `M3`
- **动作：** 新增 `hypodoc.slide-deck/v1`、SlideContext/SlideFrame 数据合同与 renderer-owned
  projection；实现 H1/H2 context/divider、H3 content frame、separator continuation、preamble 保留、
  located diagnostics 和非-Beamer拒绝；避免对已隔离 render nodes 进行重复深拷贝。
- **结果：** `M2` completed，`M3` in_progress。
- **验证：** render-model 6 tests、parser 18 tests、typecheck 全绿；显式 separator membership 与
  invalid fallback 有回归测试；纯 SlideDeck sample p95 0.056ms、1MiB p95 3.332ms，完整 1MiB
  slide pipeline p95 10.349ms。
- **下一步：** render-web 提供 waterfall/presentation frame surface，Desktop 接入视图选择、导航、
  全屏与源码返回。

## 2026-08-09 - M3 Web/Desktop 幻灯片体验完成，M4 开始

- **计划项：** `M3` → `M4`
- **动作：** render-web 新增共享 waterfall/presentation frame surface；Desktop 增加
  Document/Slides/Present segmented mode、8-frame filmstrip、方向键/PageUp/PageDown/Home/End/Escape、
  前后页、源码返回与 Fullscreen API；VS Code Webview 对合法 Beamer 自动使用 waterfall；新增
  canonical cross-renderer deck fixture 与 Playwright slides flow。
- **结果：** `M3` completed，`M4` in_progress。
- **验证：** render-web 3 tests、Desktop 3 tests、相关 typecheck 全绿；canonical fixture strict parse
  与 SlideDeck 8 frames/0 diagnostics；Playwright desktop 1440x900、mobile 375x812 waterfall/
  presentation、filmstrip、keyboard、fullscreen、source navigation、overflow、console checks 全过；
  4 张 M3 截图人工检查无遮挡。
- **设计处置：** 保留现有工作台 token 与紧凑层级；拒绝与产品不符的营销式 oversized UI；移动
  controls 使用独立 grid row，不覆盖 slide；所有 icon 来自 Lucide，支持 reduced-motion 与可见 focus。
- **下一步：** 建 LaTeX capability manifest/结构化 config，修复 theme mismatch、pinned Pandoc、
  resource containment、raw metadata、silent placeholder 和 nondeterministic date。

## 2026-08-09 - M4 LaTeX renderer 重构完成，M5 开始

- **计划项：** `M4` → `M5`
- **动作：** 新增 PyYAML 结构化 frontmatter parser；将 `profile` 设为 canonical、保留受控 legacy aliases；
  theme registry 增加 profile capability；convert/build 在 Pandoc 前拒绝不兼容组合；doctor 与 convert
  强制 Pandoc 3.10；资源解析拒绝 absolute/parent/symlink escape，损坏 PNG 默认失败，missing asset 仅在
  `--allow-placeholders` 下兼容；Lua metadata path 先验证再 `\\detokenize{}`；LaTeX 环境固定构建时间。
- **结果：** `M4` completed，`M5` in_progress。
- **验证：** pinned Pandoc 3.10 下完整 LaTeX suite `265 passed, 12 skipped`；新增 malformed YAML、
  profile alias conflict、theme mismatch、Pandoc mismatch、resource escape/corrupt/missing、metadata path
  与 date 负例；相同 Beamer 输入两次 PDF 构建 byte-identical。
- **兼容处置：** 仅对明确描述 missing placeholder 的 fixture 增加 `--allow-placeholders`；测试中的
  corrupt `TINY_PNG` 改为 CRC 正确 PNG，不放松产品校验。
- **下一步：** 用 canonical deck 生成 Web/Desktop 与 PDF 同源视觉证据并对齐 visual roles。

## 2026-08-09 - M5 预览/PDF 视觉对齐完成，M6 开始

- **计划项：** `M5` → `M6`
- **动作：** canonical SlideDeck 增加 metadata title frame；LaTeX 增加 opt-in subsection divider page；
  Web slide palette 对齐 LaTeX red/blue/yellow/gray/mono，并移除 title/divider 的导出型 footer；同源生成
  desktop/mobile waterfall/presentation 和 9 页 PDF 证据；记录 visual consistency matrix。
- **结果：** `M5` completed，`M6` in_progress。
- **验证：** canonical Web 9 frames、PDF 9 pages，title/H1/H2/content/continuation/math/code/table/callout
  membership 一一对应；Playwright keyboard/fullscreen/source/overflow/console checks 全过；PDF 16:9、文本可提取；
  新增真实 PDF 回归确认 title + H1 + H2 + content = 4 pages。
- **证据：** `Docs/audits/visual-consistency-matrix.md`、`reports/visual-baseline/m5-*`。
- **下一步：** 优化 render projection 的无条件 deep clone，重测 CPU、Desktop latency、bundle 与 PDF build。

## 2026-08-09 - M6 性能优化完成，M7 开始

- **计划项：** `M6` → `M7`
- **动作：** render-model 对不可变 AST/outline 结构共享，只在 answer-mode filtering 改变 directive tree 时
  复制祖先；performance harness 支持独立 optimized 输出；重建 Desktop/VS Code bundles，并重测 Desktop
  cold/edit latency 与代表性 PDF 三次构建。
- **结果：** `M6` completed，`M7` in_progress。
- **验证：** 1 MiB projection p95 6.271→0.046 ms（-99.3%），slide pipeline 10.349→2.984 ms
  （-71.2%）；Desktop edit p95 +7.2% < +10% gate；initial gzip 318216 B < 400000，Mermaid
  817697 B < 900000；PDF 4.47-4.48 s 对比 4.51 s；model identity-sharing test 通过。
- **证据：** `Docs/audits/performance-optimization-report.md`、`reports/*optimized.json`。
- **下一步：** snapshot 旧 Skill，重写渐进披露入口与 canonical templates，做至少 3 个 old/new eval。

## 2026-08-09 - M7 Skill 编写与评测完成，M8 开始

- **计划项：** `M7` → `M8`
- **动作：** snapshot 507 行旧 Skill；建立 102 行产品入口和 authoring/slides/export 三个渐进 references；迁移五个模板到 canonical `profile`/compatible `theme`，移除 longform 默认缺失 logo/figure；建立 3 个真实任务、18 条 assertions 和 20 个 trigger 正负样例；并行运行 6 个 old/new Skill agents。
- **结果：** new Skill 18/18 assertions，old snapshot 16/18；旧版两次失败均为新建 deck/article 继续输出 legacy `document_type`。所有 6 个 PDF build 和内容证据通过。生成 `benchmark.json/.md` 与 static `review.html`。
- **人工视觉：** 检查 6 页 deck、4 页 project、4 页 repair montage；未见 clipping、overlap、blank page 或假 placeholder。
- **新发现：** Markdown task-list marker 生成 `\\square`，但 TeX 包未定义；列入 M8 renderer 修复。

## 2026-08-09 - M8 集成验证完成，S2 等待审阅

- **计划项：** `M8` → `S2`
- **动作：** longform/Beamer 加载并由 doctor 检查 `amssymb`，增加 checked/unchecked task-list strict-build regression；public docs/templates 迁移 canonical profile；public Beamer controlled table 改为 portable stable ID + attribute form；新增 integration closeout。
- **结果：** public Beamer portable parse `profile=beamer`, `valid=true`, zero diagnostics；strict PDF template build 通过。LaTeX 全量 `269 passed, 12 skipped`，最后模板 targeted `19 passed`；JS/TS 33 tests、workspace typecheck/build 全通过；`pnpm perf` 四项 checks 为 true；`hypolatex doctor` 全绿；Skill quick validation、JSON 和 `git diff --check` 通过。
- **性能：** sample average/max 0.228/1.050ms；约 1MiB average/max 9.588/12.581ms；initial/Mermaid gzip 318216/817697B，均在 gate 内。
- **剩余风险：** non-Beamer C3/C5 portable parity 未实现；bundle 较大但在预算内；Desktop latency 只满足相对 gate；LaTeX 非 raw-TeX sandbox；paired eval 每配置仅一 run 且 runner 未暴露 token/duration。
- **证据：** `Skills/LaTeX-workspace/iteration-1/review.html`、`Docs/audits/integration-closeout-2026-08-09.md`、visual/performance reports。
- **下一步：** 等待 S2 用户接受或提出具体修订；不提前进入 M9。

## 2026-08-09 - S2 保留审阅状态

- **计划项：** `S2`
- **决定：** 用户选择“暂时保留审阅状态”。
- **结果：** Cycle 保持 `waiting-review`；不进入 M9、不关闭 Cycle、不发布版本，也不对当前交付作额外修改。
- **恢复入口：** `PROGRESS.md`、`Skills/LaTeX-workspace/iteration-1/review.html`、`Docs/audits/integration-closeout-2026-08-09.md`。

## 2026-08-09 - S2 拒绝，返回 M3 修订

- **反馈：** 移动端 slide 因 viewport 变窄发生内部 reflow 和形状变化；用户明确要求不能缩成细长形状。Desktop APP 视觉观感不足，希望研究 Typora 的真实界面。
- **失败原因：** 先前验收把“无横向溢出”错误等同于“移动端 slide 正确”，没有把固定 aspect ratio/内部坐标不变作为硬断言；UI 设计优先功能证明，chrome、边框、tabs 和 panels 过重。
- **状态：** `S2` → `pending`；`M3` → `in_progress`；`M5`/`M8` → `pending`；M4/M6/M7 的非 UI 结果保留；M9 未开始。
- **修订：** 固定 16:9 stage + contain scale；controls/filmstrip 不进入 slide 坐标；Typora 启发的内容优先 Desktop shell；重做多 viewport/视觉/性能验证后返回 S2。

## 2026-08-09 - M3/M5/M8 修订完成，S2 重新等待审阅

- **计划项：** `M3` → `M5` → `M8` → `S2`
- **动作：** render-web 建立 `960x540` 逻辑 canvas 与 `ResizeObserver` 测量的整体缩放；移除所有 mobile slide typography/padding/reflow 规则；presentation 增加 Fit/Readable Zoom；Desktop 合并双层 header/tabbar 为安静的单工具栏，简化 rail、filmstrip、controls 与 status bar；theme 转为中性轻层级，并补齐暗色 slide palette 对比。
- **结果：** mobile waterfall/Fit 完整显示 16:9 frame，Readable Zoom 保持内部坐标并通过滚动平移；Desktop light/dark shell 达到内容优先、低 chrome 的修订目标。`M3`、`M5`、`M8` completed，`S2` waiting-review；`M9` 未开始。
- **验证：** workspace typecheck、test、production build 通过；render-web 3 tests、Desktop 3 tests 通过；Playwright waterfall/presentation flow 通过，断言 960x540 logical size、16:9 ratio、字体不变、Fit/Zoom、portrait/landscape、dark mode；`pnpm perf` `valid=true`，sample average/max 0.225/0.812ms、约 1MiB 9.861/14.271ms；`git diff --check` 通过。
- **视觉证据：** `reports/visual-baseline/m3r1-*` 七张截图与更新后的 `Docs/audits/visual-consistency-matrix.md`；PDF 仍复用已验证的 9 页 16:9 canonical evidence。
- **问题与处置：** 首次 Playwright 与全量 build 并行时在 `page.goto` 超时；build 完成后独占重跑通过。人工检查发现暗色 callout 的浅粉背景/浅字对比不足，改为 dark-aware palette 后重跑截图与测试通过。Typora WebBridge 超时，研究证据使用 Typora 官方页面与静态截图，不声称品牌/像素一致。
- **下一步：** 用户审阅桌面 light/dark、mobile Fit/Zoom 与 landscape 证据；接受后才进入 M9，拒绝则按具体反馈继续修订。

## 2026-08-09 - S2 第二次拒绝，返回 M5 修订

- **反馈：** 品牌位置仍是文字而非生成式图标；当前 Open 是否支持文件夹不清楚；Save 控件视觉尺寸偏大；顶栏缺少基本 Import、Export 与 Settings。
- **失败原因：** 上轮把低 chrome 误解为减少产品动作，且未逐项核对顶栏命令的真实 native/browser 行为。实际 Electron `Open` 仅配置 `openFile`，不支持 folder；Import/Export/Settings 尚未实现。
- **状态：** `S2` → `pending`；`M5` → `in_progress`；`M8` → `pending`。固定 slide geometry 的 M3 与其他已完成 Milestone 保持不变；M9 未开始。
- **假设变化：** 顶栏应采用 progressive disclosure，但不能缺失核心文件工作流；次级命令进入可访问菜单，按钮必须对应可测试行为。
- **修订方案：** 生成并集成 compact brand mark；Open 提供 file/folder 分流并在 native bridge 受限枚举 Markdown；Save 改为紧凑 icon command；Import/Export/Settings 进入有键盘/关闭语义的菜单或 dialog；补 Electron security contract 与 Playwright 功能验证。

## 2026-08-09 - M5/M8 第二次修订完成，S2 第三次等待审阅

- **计划项：** `M5` → `M8` → `S2`
- **品牌资产：** 当前会话无 built-in `image_gen`，用户明确授权 `hypo-image` fallback；使用隔离 `gpt_image_cli` 与 GPT-Image-2 生成两版，淘汰近似 Save 的 v2，选择 document/presentation 分体 v1。通过 chroma-key helper 去背、裁切/缩放为 256x256 RGBA，保存 `Apps/Desktop/public/brand/hypodoc-mark.png`，并用于顶栏与 favicon；暗色用单色高对比处理。
- **最终 prompt：** compact desktop app brand mark for HypoDoc；one source rendered into document and presentation views；flat vector-friendly silhouette；charcoal and cyan-blue；centered, readable at 18-32px；no words, letters, gradients, shadows, texture, mockup, border, or watermark；flat green chroma background for removal。
- **文件工作流：** Open menu 分为 file/folder；Electron folder bridge 仅枚举 `.md/.markdown`，深度 8、最多 250 个、跳过 symlink，并在读取前复核枚举时 `realpath`；browser 使用 directory file input。Save 为 icon-only；actions menu 实现 Import Markdown、separate Markdown export、system Print/PDF 与 theme/autosave Settings。
- **验证：** workspace typecheck、34 tests、node syntax checks、`pnpm perf` 四项 gate、冷启动 Playwright toolbar + fixed geometry、production Electron smoke 与 `git diff --check` 通过。VS Code production build 完成；首次 root build 在 Desktop transform 后被外部 SIGTERM 终止，随后 isolated Desktop build 2m48s 通过，无编译错误。
- **视觉证据：** `reports/visual-baseline/m5r2-*` 10 张截图覆盖 desktop light/dark、mobile Fit/Zoom/landscape、Open/actions menus 与 Settings；人工检查无重叠、空白或暗色品牌丢失。
- **下一步：** 等待用户审阅品牌与完整文件工作流；接受后进入 M9，拒绝则继续同一 S2 修订。

## 2026-08-09 - S2 第三次拒绝，返回 M5 行号偏好修订

- **反馈：** source editor 默认不要行号。
- **失败原因：** `Editor.tsx` 无条件加载 CodeMirror `lineNumbers()`，上轮 UI 审阅集中在顶栏和 slides，没有把编辑区 gutter 作为内容优先默认值审查。
- **状态：** `S2` → `pending`；`M5` → `in_progress`；`M8` → `pending`。M3 固定画布、第二次修订的品牌/文件工作流与其他 Milestone 证据保留；M9 未开始。
- **修订方案：** 默认不安装 line-number extension；Settings 增加持久化 opt-in；Playwright 断言 fresh profile 无 `.cm-lineNumbers`，启用后出现并可再次关闭。

## 2026-08-09 - M5/M8 第三次修订完成，S2 第四次等待审阅

- **动作：** `Editor` 新增 `showLineNumbers` prop，只有 opt-in 时才安装 CodeMirror `lineNumbers()`；App 以 `hypodoc.lineNumbers` 持久化，缺省为 off；Settings 新增 Show line numbers checkbox。
- **结果：** fresh profile 与默认 split editor 无 gutter；用户仍可开启并关闭行号。`M5`/`M8` completed，`S2` waiting-review，M9 未开始。
- **验证：** Desktop typecheck、4 tests、Playwright toolbar/slides + line-number off/on/off、production build、Electron production smoke、`git diff --check` 通过；`m5r3-editor-default.png` 人工检查内容区无 gutter、无布局异常。
- **下一步：** 等待用户确认默认编辑区；接受后进入 M9，拒绝则继续同一 S2 修订。

## 2026-08-09 - S2 接受，M9 开始

- **接受范围：** 用户接受固定 `960x540` slide canvas 与 Fit/Readable Zoom、Typora-inspired low-chrome Desktop、GPT-Image-2 品牌 mark、file/folder Open、compact Save、Import/Export/Print/Settings、受限 native folder bridge，以及默认隐藏/Settings opt-in 行号。
- **验证证据：** 34 个 workspace tests、workspace typecheck、performance gates、Desktop/VS Code production build、Electron production smoke、LaTeX 269 passed/12 skipped + targeted 19 passed、Skill eval 18/18、9/9 Web/PDF membership、`m5r2-*`/`m5r3-*` Playwright 与视觉证据。
- **剩余风险：** non-Beamer C3/C5 portable parity 未承诺；bundles 较大但在 gate 内；LaTeX 不作为 arbitrary raw-TeX sandbox；M7 eval 每配置仅一 run。
- **状态：** `S2` completed，`M9` in_progress。M9 只做最终核对、Summary 与关闭 Cycle；不修改版本、不发布、不推送。

## 2026-08-09 - M9 完成，C002 关闭

- **动作：** 核对全部 Plan/Progress ID、65 个 tracked diff 文件与新增证据目录、关键 evidence 非空、package versions、测试/构建/性能/视觉记录和 no-publish 边界；写入 `SUMMARY.md`。
- **结果：** `M9` completed；C002 closed。所有 package 保持 `0.1.0`，未创建 tag/Release，未推送远端。
- **验证：** Plan/Progress ID 集合一致；声明证据存在；`git diff --check` 通过；最终 Desktop production build/smoke 与 Playwright default-line-number flow 已在关闭前通过。
- **后续：** folder watcher、多文档 dirty state、bundle splitting、non-Beamer parity 与 installer icon/release 工作必须进入新 Cycle。
