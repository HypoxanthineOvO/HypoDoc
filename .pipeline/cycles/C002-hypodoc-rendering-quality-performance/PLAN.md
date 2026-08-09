---
kind: plan
cycle: C002-hypodoc-rendering-quality-performance
mode: plan
status: completed
updated: 2026-08-09
progress: PROGRESS.md
execution: EXECUTION.md
---

# HypoDoc 渲染质量与性能优化 Plan

## Discover

### 用户需求

- 编写和整理 HypoDoc 的 `SKILL.md`，让 AI 能正确选择文档类型、主题、渲染与验证流程。
- 为 Render 补齐幻灯片渲染，并提高预览与导出成品的视觉一致性。
- 做有证据的性能优化，而非只维持当前宽松预算通过。
- 审计 LaTeX renderer，重点追查新版渲染器在模板定义附近的设计问题。

### 仓库事实

- v0.1.0 已具备 parser → render-model → render-web → Desktop/VS Code 链路；Web/Desktop
  当前只渲染连续文档流。
- `Docs/adr/0002-slides-projection.md` 已接受 renderer-owned `SlideDeck` 方向，但尚未实现。
- LaTeX 已支持 Beamer Slides DSL、主题、TeX/PDF 构建和 PDF evidence，现有测试覆盖较多。
- `Skills/Authoring/SKILL.md` 与 `Skills/LaTeX/SKILL.md` 职责割裂，后者仍以 Hypo-LaTeX
  品牌和一份很长的单文件说明为中心。
- 当前性能报告主要测 parser 与 bundle 体积，未覆盖投影、React 更新、Mermaid/Shiki
  冷启动、内存和 LaTeX 阶段耗时。

### 已确认缺陷与待证假设

- 已确认：`themes.py` 用同一 registry 接受长文与 Beamer-only 主题；长文选择 `glass` 等主题
  会延迟到 TeX 层报错，而 Beamer 选择无对应 Beamer 样式的长文主题会静默回退基础样式。
- 已确认：frontmatter/主题/文档选项分散在多个正则读取器、Pandoc 模板、Lua filter 和 TeX
  宏中，形成重复定义与不一致失败边界。
- 待审计：raw Markdown slides normalization、模板元数据注入、资源发现/复制、临时文件、
  TeX package 加载顺序和缓存策略是否还存在正确性、安全性或并发问题。

## Technical

- 以 `hypodoc.render-document/v1` 为输入，在 `Packages/render-model` 实现 renderer-owned
  `SlideDeck`；不把 Reveal.js 或 Beamer 私有状态写回 parser/Spec。
- Web renderer 提供共享 frame surface；Desktop 为 `profile: beamer` 提供 waterfall 与
  presentation 两种视图，含键盘导航、页码、缩略导航、全屏和窄屏适配。优先使用现有 React
  能力；只有原生能力不能满足可访问放映时才引入 Reveal.js。
- “视觉一致”定义为共享设计角色和可比较结构：标题层级、frame 边界、颜色角色、字体层级、
  间距、列表、表格、callout、图像约束和答案模式一致；HTML、屏幕放映与 PDF 的媒介差异写入
  明确例外，不追求像素相同。
- LaTeX 侧建立按 document type/capability 校验的主题 manifest 和单一配置解析入口；模板只负责
  文档骨架，语义转换留在 AST/filter 层，样式留在 package/theme 层，消除静默 fallback 和
  重复 frontmatter 解释。
- 扩充性能 harness：parser、render projection、server render/浏览器更新、可选模块冷启动、
  bundle、内存与 LaTeX convert/build 分阶段计时；M1 基线后再锁定有意义的回归预算。
- 新建产品级 HypoDoc Skill 作为入口，并把长说明拆到按需 references/templates；用真实
  authoring/slides/export/diagnosis prompts 做 with-skill 与旧 Skill baseline 对照和人工审阅。

## Architecture

```text
HypoDoc source
    -> parser-core
    -> render-model
       -> RenderDocument (continuous document)
       -> SlideDeck (beamer-only projection + located diagnostics)
          -> render-web frame surface
             -> Desktop waterfall / presentation
          -> cross-renderer fixture map
             -> LaTeX/Pandoc/Beamer -> PDF evidence

theme + document manifest
    -> validated options
       -> Pandoc template (document skeleton)
       -> Lua filter (semantic AST mapping)
       -> TeX package/theme (visual implementation)
```

`Spec/` owns shared syntax与语义；`parser-core` owns parsing；`render-model` owns view projection；
`render-web` owns safe HTML；host apps own interaction；LaTeX renderer owns Pandoc/TeX/PDF details；
Skill teaches the workflow but cannot become a competing semantic authority.

## 执行边界与默认决定

- 本轮默认交付 waterfall + 可用的 presentation，而不只是一组静态卡片。
- PDF 继续由 LaTeX CLI 产生；不把 Python/Pandoc/TeX 嵌入 Desktop 或 Web runtime。
- 导出一致性以代表性跨 renderer fixtures、截图/PDF 页面和结构清单验收；不承诺逐像素相同。
- 允许修复共享产品代码和 LaTeX renderer；只有确需变更共享语义时才提出独立 Spec 修订。
- 本 Cycle 不发布新版本；版本、Release 和远端副作用另行确认。

## 完整计划

ID 开始执行后不重排或复用。

| ID | 阶段 | 期望结果 | 验证方式 |
| --- | --- | --- | --- |
| `M1` | 建立审计与性能/视觉基线 | 形成 LaTeX 架构审计、主题兼容矩阵、跨 renderer 差异表、代表性 Beamer corpus 和覆盖真实关键路径的性能基线；区分已复现 bug、设计债与推测 | 运行现有全量验证；增加只读/诊断 harness；复现不兼容主题的早/晚失败行为；记录桌面/移动截图、PDF 页面、阶段耗时、bundle 和内存证据 |
| `S1` | 审计与目标架构审阅 | 用户看到真实审计报告、可复现 bug、视觉差异样本、性能基线、拟议 manifest/SlideDeck 数据合同和量化验收阈值 | 接受标准：缺陷有证据和优先级；幻灯片交互范围、一致性例外、性能目标及是否需 Spec 变更均明确；接受后才进入实现 |
| `M2` | 实现共享 SlideDeck 投影 | `profile: beamer` 从 render document 稳定投影为有 frame ID、层级上下文、源码范围和 located diagnostics 的 SlideDeck；无内容静默丢失 | 单元/fixture 覆盖 H1/H2/H3、连续分隔符、preamble、directive、代码不透明性、资源和异常 fallback；与 LaTeX frame membership 对照 |
| `M3` | 交付 Web/Desktop 幻灯片体验 (`completed` revision) | Web frame surface 与 Desktop waterfall/presentation 可实际使用，支持键盘、页码、缩略导航、全屏和源码跳转；slide 本体在所有 viewport 保持固定 aspect ratio 与内部坐标，只允许整体 contain scale；普通文档行为不回归 | Vitest/React 测试、Playwright Desktop smoke；375px portrait、mobile landscape、desktop 截图；断言 stage/slide ratio、无内部 reflow、键盘/全屏/resize/错误态 |
| `M4` | 重构并修复 LaTeX renderer | 主题与 document type 能力在单一 manifest 中校验；模板、Lua filter、配置解析和 TeX theme 职责清楚；已确认的错误接受/静默 fallback 消失，审计发现的高优先级问题修复 | Python 单测、Pandoc snapshots、主题正/负矩阵、并发/临时目录与资源测试、doctor、代表性 TeX/PDF 构建及错误诊断断言 |
| `M5` | 对齐预览与导出视觉系统 (`completed` third revision) | Web waterfall/presentation 与 Beamer PDF 共享可追踪的设计角色和固定 slide geometry；Desktop shell 使用内容优先、低 chrome、轻边界的专业编辑器视觉系统，并具备可信的品牌与文件工作流；source editor 默认无行号 | 同源 fixture 的 DOM/SlideDeck/TeX 结构对照；Typora 官方/真实界面研究；桌面/移动截图与 PDF page raster 并排审阅；标题、palette、callout、table、image、math、code、answer mode；品牌资产与 open/import/export/settings 功能检查；默认/opt-in 行号断言 |
| `M6` | 性能优化与预算固化 | 优化由 profile 证明的热点，降低编辑到预览延迟、可选渲染器冷启动或 bundle 成本，并建立能发现回归但不过度脆弱的预算 | 重复采样并报告 median/p95/方差；前后对比 parser/projection/render/update/Mermaid/Shiki/bundle/memory/LaTeX 阶段；低端或 CI 抖动采用相对/分层阈值 |
| `M7` | 编写并评测 HypoDoc Skill (`completed`) | 产品级入口 Skill 正确触发并引导 authoring、slides、preview、LaTeX/PDF export 与 evidence；详细材料渐进加载，旧 Skill 边界清楚 | lint/frontmatter/链接/模板构建；至少 3 个真实任务 prompt 做新 Skill 与旧 Skill baseline 对照；量化 assertions、人工 review viewer 和触发正/负样例 |
| `M8` | 集成验证与文档收敛 (`completed` third revision) | 架构、ADR、用户/开发文档、根验证入口和 CI 与修订后行为一致；普通文档、VS Code、Desktop 和 LaTeX 均无回归 | `pnpm` 全量、Spec conformance、LaTeX pytest/doctor/PDF、Desktop/VSIX、性能与视觉证据全跑；干净 checkout 重建声明的产物 |
| `S2` | 优化结果审阅 (`completed`, accepted 2026-08-09) | 用户实际检查 Skill 输出、Desktop 幻灯片、PDF 对照、审计修复与性能前后报告 | 接受标准新增：移动端 slide 不变形；Desktop UI 达到内容优先的专业编辑器质量；品牌图标、文件/文件夹打开、紧凑 Save 与导入/导出/设置均真实可用；编辑器默认不显示行号 |
| `M9` | 加固与 Cycle 收尾 (`completed`) | 处理 S2 接受范围内的小修，归档证据和后续候选；不擅自发布 | 最终工作树/测试/报告检查，Cycle Summary 与剩余风险清单；若用户另行要求发布，创建独立发布计划 |

## S2 Revision Addendum - 2026-08-09

- 移动端 presentation 不允许通过 responsive typography/reflow 改变 slide 版式；16:9 逻辑画布、内部尺寸和元素关系必须保持不变，只对画布整体缩放。
- app chrome 以 Typora 的内容优先、安静层级、轻边界和低视觉噪声为研究参照，但保留 HypoDoc 的 outline、slides、presentation 与 evidence 工作流，不复制 Typora 品牌资产。
- 新验收增加 375px portrait、mobile landscape、1440px desktop 的固定比例 DOM/像素检查，以及新旧 UI 截图对比。
- 第二次拒绝新增：用 image generation 产出并集成品牌图标；Open 明确区分文件与文件夹；Save 降低视觉尺寸；顶栏提供真实可用的 Import、Export 与 Settings，不放置无行为按钮。
- 第三次拒绝新增：source editor 默认不显示行号；如保留能力，只能作为 Settings 中的 opt-in 偏好。

## 风险与回退

- Slides 投影若依赖 parser 未保留的信息，优先扩充 renderer model/位置信息；只有共享语义确实缺失才
  进入 Spec 修订，不复制 LaTeX raw-Markdown 规则到 TypeScript。
- TeX/PDF 与浏览器字体栈存在平台差异；验收固定字体可用性证据并允许声明过的 fallback，不伪造一致。
- 性能优化不得以取消 fail-closed、安全资源策略、准确诊断或大文档正确性换取数字改善。
- 视觉基线只更新于已解释的设计变化，CI 断言避免绑定随机 hash、微小反锯齿或完整日志文本。
