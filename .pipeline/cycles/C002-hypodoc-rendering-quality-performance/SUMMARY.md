---
kind: cycle-summary
cycle: C002-hypodoc-rendering-quality-performance
closed: 2026-08-09
---

# HypoDoc 渲染质量、性能与产品体验 Cycle Summary

## 交付结果

C002 把 HypoDoc 的 portable source 从连续文档预览扩展为可编写、预览、放映和导出的统一产品面，
并完成 LaTeX renderer 的配置/主题/资源边界修复、性能优化与产品级 Skill 重写。本 Cycle 没有修改
`0.1.0` 版本，没有创建 tag、Release 或远端发布。

- **Slides：** `hypodoc.slide-deck/v1` 由 render-model 投影；Web/Desktop/VS Code 支持 waterfall，
  Desktop 支持 filmstrip、键盘导航、源码返回、全屏、Fit 与 Readable Zoom。
- **固定画布：** 所有 slide 使用 `960x540` 逻辑 canvas；375px portrait、812px landscape 与 desktop
  只整体缩放，不改变内部排版。canonical Web/PDF 保持 9/9 同序 membership。
- **Desktop：** Typora-inspired content-first shell；GPT-Image-2 品牌 mark；file/folder Open、compact
  Save、Import Markdown、Export Markdown、Print/PDF、Settings；source line numbers 默认 off、可 opt-in。
- **Native boundary：** folder bridge 只读取 dialog-approved Markdown，限制深度/数量，跳过 symlink，
  并在读取前复核枚举时 `realpath`。
- **LaTeX：** structured YAML config、canonical `profile`、theme capability、Pandoc 3.10、资源 containment、
  raw path metadata、placeholder policy、deterministic build 与 task-list package 回归均已修复。
- **性能：** projection p95 降低 99.3%，完整 slide pipeline 降低 71.2%；最终 parser 与 Desktop bundle
  gates 全为 true。
- **Skill：** 507 行旧入口收敛为 102 行产品入口 + 3 个渐进 references；5 个 canonical templates；
  new Skill eval 18/18，旧 snapshot 16/18。

## 里程碑记录

- `M1` 建立 5 High/5 Medium 架构审计、性能/视觉基线与可复现缺陷。
- `S1` 接受 canonical source、renderer-owned SlideDeck、capability manifest 与量化 gates。
- `M2` 实现 SlideDeck、located diagnostics 与 frame membership tests。
- `M3` 实现 Web/Desktop slides；S2 反馈后改为固定 16:9 logical canvas。
- `M4` 重构 LaTeX config/theme/resource/toolchain/determinism 边界。
- `M5` 对齐 9/9 Web/PDF visual roles；三轮反馈后完成 low-chrome UI、品牌/文件工作流与默认无行号。
- `M6` 优化 projection copy 热点并固化性能预算。
- `M7` 重写/评测 HypoDoc Skill 与 templates。
- `M8` 完成 docs、task-list regression、integration/visual/performance evidence。
- `S2` 用户最终接受固定画布、Desktop UI、品牌/文件工作流与默认隐藏行号。
- `M9` 核对版本、证据、Plan/Progress ID、工作树与 no-publish 边界，并归档本 Summary。

## 验证证据

- JavaScript/TypeScript：workspace typecheck；34 tests；Desktop production build；VS Code production build；
  Electron production smoke；cold-start Playwright toolbar/slides/line-number flow。
- LaTeX：pinned Pandoc 3.10 下 `269 passed, 12 skipped`；public-template targeted `19 passed`；
  doctor 与 representative PDF evidence 通过。
- Slides/PDF：canonical 9 Web frames / 9 PDF pages；PDF 16:9；`m3r1-*`、`m5r2-*`、
  `m5r3-editor-default.png` 与 PDF page rasters 已人工检查。
- 性能：最终 `pnpm perf` `valid=true`；sample average/max 0.242/1.120 ms；约 1 MiB
  average/max 8.702/11.472 ms；Desktop initial/Mermaid gates 为 true。
- Skill：new 18/18 vs old 16/18；6 个任务 PDF 与 static review viewer 可复核。
- 收口：所有声明证据非空；Plan/Progress 的 M1-S2-M9 ID 一致；所有 package version 仍为 `0.1.0`；
  `git diff --check` 通过。

## 重要决定与经验

- 移动端“无页面横向溢出”不能替代 slide 几何正确性；必须断言 logical size、rendered ratio、字体与
  Fit/Zoom 行为。
- low chrome 不等于删除产品能力。核心命令可以 progressive disclosure，但必须有真实行为与功能测试。
- Desktop folder access 必须由 native dialog 授权并在主进程 fail-closed，renderer 不获得通用文件系统 API。
- Typora 只作为 content hierarchy 研究参照，不复制品牌；HypoDoc 保留 slides/evidence 工作流。
- 视觉审阅必须覆盖 light/dark、portrait/landscape、菜单/dialog 与默认偏好，不能只截主画布。

## 已知限制

- Portable rendering 对 canonical Beamer surface 完整，但不承诺所有 non-Beamer C3/C5 LaTeX 扩展 parity。
- Desktop main bundle约 324.48 kB gzip、Mermaid约 831.02 kB gzip，均通过 gate，但仍需依赖级拆分才能明显下降。
- Desktop edit-to-preview 只满足相对回归 gate，未达到早期 aspirational absolute target。
- LaTeX renderer 在声明的 config/resource 边界上加固，但不是任意不可信 raw TeX 的 sandbox。
- M7 每个配置只有一次 paired run；runner 没有 token/duration counters。
- folder workspace 当前是打开时枚举，没有 file watcher；生成 mark 已用于 Web/Desktop chrome，但未生成发行安装器图标集。

## 后续候选（不在本 Cycle）

- 建立 folder watcher、文件新增/删除刷新与多文档 dirty-state 管理。
- 继续拆分 Mermaid/Shiki 与主 bundle，建立更稳定的 browser update latency lab。
- 为 non-Beamer C3/C5 constructs 设计 portable parity 范围，而不是隐式承诺。
- 发布前生成 Linux/Windows/macOS 安装器图标矩阵，并单独计划版本、签名、notarization 与 Release。
