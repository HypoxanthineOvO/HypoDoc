# HypoDoc Rendering Architecture Audit

Date: 2026-08-09
Cycle: `C002-hypodoc-rendering-quality-performance` / `M1`

## 结论

当前 LaTeX/Beamer renderer 本身有较完整的功能与测试，但它和 portable renderer、公开
Skill/template 之间没有形成一个一致的产品合同。用户记忆中的“模板定义设计问题”可以被更准确地
描述为：**document/profile、theme capability、metadata 和 visual role 被重复定义在 Python、
Pandoc template、Lua filter、TeX package、TypeScript parser 与 Skill 中，校验发生得太晚或根本
没有发生。**

这不是要求推翻 LaTeX renderer。建议保留 Pandoc/Lua/TeX 实现，先建立 canonical source、
capability manifest 和跨 renderer fixture map，再逐步把 raw Markdown preprocessing 收缩到
结构化边界。`Spec/` 现有 canonical `profile: beamer` 与严格/兼容模式已经足够，本轮暂不需要
修改 Spec。

## Findings

### F1 High - 公开 Beamer Skill/template 不是跨 renderer 的合法 HypoDoc 源

- `Skills/LaTeX/templates/beamer.md` 使用兼容字段 `document_type: beamer`，并依赖 `.table`
  内嵌 YAML 的 LaTeX compatibility decoder；portable parser 只读取 canonical `profile`，且要求
  `.table` 有稳定 `#identifier`。
- 真实结果：原模板在 Desktop/Web fail-closed，报
  `REQUIRED_IDENTIFIER: .table requires a stable #identifier`；renderer profile 保持 `core`。
- 只做最小 canonical 修复（`profile: beamer` + table ID）后文档可渲染，但
  `frameSurfaceCount=0`，`---` 仍只是普通 `<hr>`。
- 影响：当前 Skill 声称的 Beamer 模板只能在 LaTeX 私有兼容路径使用，不能成为 HypoDoc
  跨 renderer 的示例或未来 SlideDeck fixture。
- 证据：`reports/slides-gap-baseline.json` 及 `reports/visual-baseline/web-beamer-*.png`。

### F2 High - Theme registry 不表达 document type capability

- `Renderers/LaTeX/src/hypolatex/themes.py` 将 longform 与 Beamer-only theme 放在同一合法列表。
- longform `--theme glass` 在 Python/Pandoc convert 阶段成功，直到 XeLaTeX 才报
  `Unknown theme`；Beamer `--theme classic-readable` 则成功输出 PDF，但
  `hypolatex-beamer.sty` 对不存在的 style 静默使用 base style。
- 影响：同一 CLI 参数有“晚失败”和“成功但不是请求样式”两种错误语义，自动化无法可靠判断
  导出是否符合视觉意图。
- 建议：一个 manifest 同时声明 theme ID、支持的 document profiles、style resource、tokens、
  fallback policy；在启动 Pandoc 前 fail-fast，禁止静默视觉 fallback。

### F3 High - 配置与模板职责重复，缺少单一解析/校验边界

- `themes.py`、`document_options.py` 和 `slides.py` 分别用行正则读取 frontmatter；Pandoc 再解析
  YAML；template 重新列出 metadata；Lua `Meta()` 又特判 path metadata；TeX package 再校验
  theme/answer/palette。
- 这些路径对 alias、quoted/comment scalar、unknown key、document capability 和错误位置的处理不同。
- 影响：新增一个字段或主题需要同步多个注册点，且测试容易只覆盖“生成了字符串”，没有覆盖
  最终选择了正确实现。
- 建议：Python 侧使用结构化 YAML/Pandoc metadata 得到一个 validated document config；template
  只保留 document skeleton；Lua 只做 AST semantic mapping；TeX 只消费已验证的 visual config。

### F4 High - LaTeX resource containment 可被 symlink 绕过

- `_resolve_resource()` 将 `(root / reference).resolve()` 后只检查 `is_file()`，未确认 resolved path
  仍在声明的 root 内；`_destination_path()` 只约束输出路径。
- 最小负例将 `root/assets/outside.txt` 链接到 `/etc/hosts`，解析结果为 `/etc/hosts`，同时得到合法
  的 build destination。因此 root 外文件可被复制进构建目录。
- 风险取决于威胁模型：若 LaTeX CLI 只编译用户自己完全信任的本地项目，风险较低；若 Desktop、
  agent 或 CI 未来编译外来仓库，则属于 workspace escape/data exposure。
- 建议：声明 LaTeX 为 trusted-local-only 直到修复；resolved path 必须 `relative_to` 某个允许 root，
  并测试 symlink、absolute path、`..` 和 TOCTOU 行为。

### F5 High - Raw path metadata 可突破 template 命令参数边界

- Lua `Meta()` 把 `logo`、`logolong`、`logonegative` 改为 raw LaTeX，以避免文件名下划线被转义；
  template 直接放入 `\HypoSetMetadata{key}{...}`。
- `logo: 'x}{BROKEN'` 生成 `\HypoSetMetadata{logo}{x}{BROKEN}`；带控制序列的值也原样进入 TeX。
- 这说明 metadata 不是“路径值”，而是可改变 TeX 语法的 raw fragment。结合 XeLaTeX 的本地文件
  能力，不能把该 pipeline 当成不可信输入沙箱。
- 建议：路径 metadata 只允许规范化后的相对路径字符集；不要用 `RawInline` 解决 escaping；编译
  外来内容时还需禁用/限制 raw TeX 和 shell/file capabilities。

### F6 Medium - Renderer 自身未执行 pinned Pandoc contract

- 根 `scripts/validate-all.sh` 会把 Pandoc 3.10 放到 PATH，但 `hypolatex doctor` 只检查 executable
  是否存在。系统 Pandoc 3.1.3 被报告为“All required checks passed”。
- 使用 3.1.3 跑 renderer tests 得到 `253 passed / 12 skipped / 1 snapshot failed`；使用 pinned
  3.10 得到 `254 passed / 12 skipped`。
- 建议：doctor 和 convert/build 读取根 toolchain contract 或 renderer 自身的精确兼容范围，报告
  actual/expected version；测试失败不应是用户首次知道版本不兼容的地方。

### F7 Medium - Slides normalizer 混合语义、lint 与 LaTeX code generation

- `slides.py` 逐行解析 Markdown、用布尔值切换 code fence、推断 frame、做密度 lint，并把图片
  重写为 raw `\includegraphics`/`center` 字符串。
- 该实现没有 AST/source map，也无法与 TypeScript `SlideDeck` 共享 frame membership；可变 fence
  marker、fenced div 内结构、复杂 Markdown 与 located diagnostics 都容易产生分歧。
- 建议：M2 的 SlideDeck 从 portable AST 投影；LaTeX 侧至少以 Pandoc AST/filter 处理结构和图片，
  raw Markdown normalizer 只作为 legacy adapter 并由同源 fixtures 约束。

### F8 Medium - 资源错误会被静默变成“成功但视觉错误”

- `prepare_markdown_resources()` 返回 `missing`，但 `build_pdf()` 忽略返回值；TeX 可能渲染
  placeholder 后仍成功。
- `_copy_resource()` 发现无效 `.png` 时直接写入 1x1 minimal PNG，没有 warning/error。
- 影响：PDF build success 不能证明图片导出正确，直接破坏视觉一致性与 evidence 可信度。
- 建议：默认 fail on corrupt resources；missing resource 至少产生 structured warning，并允许显式
  `--allow-placeholders` 才继续。报告必须列出 placeholder/missing 数量。

### F9 Medium - Beamer 未提供 date 时导出不确定

- template 只在 metadata 有 `date` 时调用 `\date{...}`；否则 Beamer 使用 `\today`。
- 当前公开模板没有 `date`，2026-08-09 构建的封面自动出现当天日期。
- 影响：相同 source 在不同日期生成不同 PDF，视觉 snapshot、cache 与 reproducible build 不稳定。
- 建议：无 date 时显式 `\date{}`；需要 build date 时由 source 或 CLI 明确提供。

### F10 Medium - Skill 与性能基线仍是组件级，而不是产品级

- `Skills/LaTeX/SKILL.md` 为 507 行，超过 skill-creator 建议的 `<500 lines ideal`，同时还需加载
  多个大模板；没有产品级 HypoDoc 入口来选择 portable authoring、slides 或 PDF evidence。
- 当前 perf gate 只测 parser average 和两个 bundle 上限；1MiB parser 预算 600ms，而实测约 10ms，
  难以发现真实回归。没有 edit-to-preview、projection、optional module readiness 或 memory budget。
- 建议：M7 建 product entry skill + progressive references；M6 用 median/p95 和同机前后对比替换
  过宽的单点 gate。

## Architecture Proposal For S1

1. **Canonical source first**：新 Skill/template 只写 `profile: beamer` 和 canonical IDs/attributes；
   LaTeX legacy aliases 只在 compatibility adapter 接受并给 warning。
2. **Renderer-owned SlideDeck**：`render-model` 从 parsed nodes 投影 frame、section/subsection context、
   source range、semantic node membership 和 diagnostics；Web waterfall/presentation 共用此结构。
3. **Capability manifest**：LaTeX renderer 用一个结构化 manifest 表达 profile、theme、palette、layout、
   template/style assets 和 deterministic defaults；解析与校验先于 Pandoc。
4. **Cross-renderer fixture map**：同一 canonical deck 对照 SlideDeck JSON、Web DOM/frame IDs、generated
   TeX frame IDs 与 PDF page evidence；媒介差异写成允许项。
5. **Explicit trust boundary**：portable renderer 保持 fail-closed；LaTeX 标注 trusted-local-only，修复
   resource containment/raw metadata 后再讨论自动编译外来内容。
6. **Visual roles, not shared raw CSS/TeX**：建立 title/body/muted/accent/surface/border/success/warning 等
   role mapping；各媒体实现自己的 tokens，但测试要求 role 和层级映射完整。

## Proposed Acceptance Thresholds

这些阈值用于同一 Linux host/Node 版本的 before-after 比较，CI 采用多次采样，不把单次抖动当回归。

| Surface | M1 baseline | Proposed gate after implementation |
| --- | ---: | ---: |
| sample parser + render-model p95 | 0.459 ms | 不高于 baseline 1.20x |
| ~1MiB parser + render-model p95 | 15.060 ms | 不高于 18 ms |
| ~1MiB render projection p95 | 6.024 ms | 加入 SlideDeck 后不高于 8 ms |
| Desktop edit-to-preview median | 179.657 ms | 不高于 150 ms，且较 baseline 至少改善 15% |
| Desktop edit-to-preview p95 | 456.935 ms | 不高于 300 ms，且较 baseline 至少改善 25% |
| Desktop initial JS gzip | 315,125 B | 不高于 300,000 B |
| Mermaid optional chunk gzip | 817,697 B | 至少下降 15%，或用按 diagram lazy chunks 证明首用成本下降 |
| LaTeX representative Beamer build | 4.51 s single sample | 不回归超过 15%；M6 改为 3-run median |

Correctness/visual gates:

- canonical deck 在 SlideDeck、waterfall、presentation 与 LaTeX 中 frame 数、顺序、IDs、semantic
  membership 完全一致；不允许静默 drop。
- published Skill templates 在 strict portable parser 与 LaTeX build 均通过。
- theme/profile 不兼容在 Pandoc 前失败；无静默 fallback。
- desktop/mobile 无横向溢出、遮挡或不可达控制；presentation 支持键盘、全屏、页码和源码返回。
- 同 renderer screenshot diff 沿用稳健阈值；跨 renderer 不做 pixel equality，改验标题层级、visual
  role、spacing class、callout/table/image/answer-mode map，并由 S2 人工检查代表页。

## Baseline Evidence

- TypeScript: typecheck/build 全过；27 tests passed；Desktop build 约 98 s。
- LaTeX: pinned Pandoc 3.10 下 `254 passed, 12 skipped`；un-pinned 3.1.3 下 1 snapshot failure。
- Desktop smoke: desktop/mobile、light/dark、fail-closed 流程通过，无 console error。
- PDF: `reports/visual-baseline/beamer-plain.pdf`，8 pages，16:9，37,613 bytes；build 4.51 s。
- Performance: `reports/performance-baseline.json`、`reports/rendering-audit-baseline.json`、
  `reports/desktop-performance-baseline.json`。
- Visual gap: `reports/slides-gap-baseline.json` 与 `reports/visual-baseline/`。
