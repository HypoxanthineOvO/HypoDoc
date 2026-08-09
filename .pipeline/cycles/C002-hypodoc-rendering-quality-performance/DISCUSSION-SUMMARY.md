---
kind: discussion-summary
cycle: C002-hypodoc-rendering-quality-performance
updated: 2026-08-09
raw_discussion: local/discussions/C002-hypodoc-rendering-quality-performance/
---

# HypoDoc 渲染质量与性能优化讨论摘要

## 已确认需求

- 本轮优化包括 HypoDoc Skill 编写、Render 幻灯片支持、预览/导出视觉一致性、性能优化，
  以及重点检查模板定义的 LaTeX renderer 代码审计。

## Proposal 中的默认解释

- 幻灯片支持包括 waterfall 与可交互 presentation，而不只是静态卡片。
- 导出指现有 LaTeX/PDF 路径的视觉结果；不把 Python/Pandoc/TeX 加入 Desktop/Web runtime。
- 视觉一致性指共享语义结构和设计角色一致，并保留显式媒介例外，不要求像素相同。
- 本 Cycle 不含版本发布或远端发布副作用。

## 仓库勘察结论

- 已有 ADR 接受 renderer-owned SlideDeck，但 Web/Desktop 尚未实现。
- LaTeX 主题 registry 未按 document type 限制，且配置在 Python 正则解析、Pandoc template、
  Lua filter 与 TeX package 中重复表达；这与用户记忆中的模板定义设计问题高度吻合。
- 是否还有其他模板、资源、并发或缓存缺陷留给 M1 以可复现证据确认，当前不提前定论。

## 等待决定

- 用户已选择“确认并开始”，完整 Proposal 获得接受；M1 已完成。
- 用户已接受 S1 的核心方向：canonical HypoDoc source、renderer-owned SlideDeck、LaTeX capability
  manifest/结构化配置、trusted-local trust boundary、跨 renderer visual-role mapping 与性能阈值。
- 用户已接受 S2：固定 canvas、Desktop UI、品牌/文件工作流与默认隐藏行号均通过；当前进入 M9 收尾，不发布。
- 用户在首次 S2 gate 选择“暂时保留审阅状态”；当前不进入 M9，也没有新增修订反馈。
- 随后用户明确拒绝当前 S2：mobile presentation 不能因窄屏改变 slide 形状或内部布局；Desktop APP 当前视觉质量不可接受，希望研究 Typora 界面后重做。
- 修订解释：slide 使用固定 16:9 逻辑画布并整体 contain 缩放；app chrome 采用 Typora 启发的内容优先、轻边界方向，但不复制品牌。
- 修订结果：slide 使用固定 `960x540` 逻辑画布；Fit 完整 contain，Readable Zoom 放大同一画布并允许受控平移；移动 portrait/landscape 不再改变内部排版。Desktop 已合并为一条安静工具栏与轻量 rail，保留 HypoDoc 专有工作流。
- 第二次拒绝反馈：品牌区需要 image-generated 图标；Open 必须明确支持文件与文件夹；Save 视觉尺寸需要收紧；顶栏要有真实可用的 Import、Export、Settings。核验确认旧 Open 只有 `openFile`，其余三类入口不存在。
- 第二次修订结果：用户授权 `hypo-image` GPT-Image-2 fallback，最终 256px RGBA mark 已用于顶栏/favicon；Open file/folder、compact Save、Import/Export/Print/Settings 均实现。native folder 读取保持 dialog-approved、Markdown-only、有深度/数量/realpath/symlink 防护。
- 第三次拒绝反馈：内容优先 editor 默认不应显示行号；保留能力时应在 Settings 中 opt-in，而不是默认 gutter。
- 第三次修订结果：fresh profile 无 `.cm-lineNumbers`；Settings 开启时安装 gutter 并持久化，关闭后立即移除；production build/smoke 与 Playwright 往返通过。
- S2 最终决定：接受并进入 M9；接受不包含发布、版本变更或远端副作用。
- M9 已完成证据/版本/ID/no-publish 核对并写入 `SUMMARY.md`；C002 closed，后续候选不自动延续。

## M1 新证据

- 用户记忆中的模板问题已具体化为 capability/config/template 多重权威，而不是单一模板 typo。
- 公开 Beamer template 不能通过 strict portable renderer；最小 canonical 修复后仍无 frame surface。
- LaTeX theme mismatch、Pandoc version gap、resource symlink escape、raw metadata TeX boundary、
  silent placeholder/PNG substitution 和 nondeterministic date 已有代码或运行证据。

## S2 新证据与边界

- canonical slide 在 Web/Desktop/PDF 为 9/9/9 同序；public Beamer template 同时通过 portable strict parse 与 LaTeX strict build。
- 新 Skill 18/18 assertions，旧 snapshot 16/18；新入口 102 行，详细材料渐进加载。
- LaTeX 269 passed/12 skipped；TS 33 tests、typecheck/build、性能 gates 全过。
- M7 实际任务发现 task-list `\\square` 缺定义，M8 已用 `amssymb`、doctor dependency 与双 profile regression 修复。
- 未承诺 non-Beamer C3/C5 portable parity；bundle 和 Desktop latency 仍是后续优化候选；LaTeX 不作为任意 raw TeX sandbox。
- 第一轮修订验证的 7 张 `m3r1-*` 截图、固定几何/字体 DOM 断言、dark palette 与全量通过结果继续有效；第二轮需新增 native bridge/security、菜单交互、文件夹与导入/导出/设置证据后再回 S2。
- 第二轮新增 `m5r2-*` 菜单/设置/响应式证据、Electron security contract、34 tests、production smoke 和 toolbar Playwright；当前已回到 S2 waiting-review。
