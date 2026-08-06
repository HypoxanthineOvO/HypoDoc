---
kind: plan
cycle: C001-hypodoc-monorepo-migration-release
mode: plan
status: active
updated: 2026-08-06
progress: PROGRESS.md
execution: EXECUTION.md
---

# HypoDoc Monorepo 迁移、整理与发布 Plan

## 执行目的

在不破坏三个来源工作区的前提下，把 HypoDoc 产品实现迁入本仓，整理清晰的 Spec、
Skills、Packages、Renderers、Apps、Extensions 和 Docs 边界，建立统一验证与可审计发布链路，
并完成首轮正式的 Preview 发布和可回退切换。

## 执行边界

- 允许在用户确认本 Proposal 后盘点并建立本地 Git 恢复锚点、修改本仓与明确列入迁移的来源仓。
- Spec 保持独立仓库与版本历史，通过根 `Spec/` 固定兼容 revision，不并入产品版本历史。
- Hypo-Markdown 与 Hypo-LaTeX 采用保留历史的 Git 导入；不以复制粘贴冒充历史迁移。
- 来源仓内容是迁移输入而非唯一真理；允许基于业务整合需要修改内容、接口、结构与命名，
  但必须以独立整理提交保留 provenance、变更理由和兼容性证据。
- Hypo-LaTeX 当前 `0.4.0` 只视为来源版本；整合后的组件与首发版本在发布范围、兼容性和变更量明确后重新计算。
- Stone 接受前不越过对应决策门；发布前不 push、不创建 Release、不上传 Marketplace。
- 不删除旧工作区；签名、notarization 和未实际运行的平台构建不得写成已验证。

## 技术与架构方案

- 权威层级为：用户确认的业务目标与产品边界 → 显式 Spec/兼容合同及其审阅后修订 →
  跨 renderer 的可重复验证证据 → 来源仓当前实现。来源实现与上层目标冲突时，不默认保留来源行为。
- 先为根仓和无首个提交的 Hypo-Markdown 建立可回退锚点，再执行任何路径重排。
- Hypo-Markdown 以保留完整提交关系的合并方式进入根仓，随后用独立整理提交映射到
  `Packages/`、`Apps/Desktop` 与 `Extensions/VSCode`。
- Hypo-LaTeX 以不 squash 的历史保留方式进入 `Renderers/LaTeX`；通用写作规则提取到
  `Skills/Authoring`，LaTeX 专用构建规则保留在 `Skills/LaTeX`。
- HypoDoc Spec 作为独立 Git 依赖固定到 `Spec/`，共享语法、registry、fixtures 与 renderer
  contract 从该入口消费；产品 runtime 不引入 Python/Pandoc 运行时依赖。
- 根工作区统一编排 pnpm、Python/uv、conformance、Web/Desktop/VSIX 与代表性 PDF 验证；
  各组件保留必要的独立版本，Release manifest 记录组件版本和来源 SHA。
- 发布链路以一个 canonical remote 为源，另一平台只做可追溯 mirror；发布副作用必须经过 `S2`。

## 验证目标

- 来源 inventory 包含 branch、HEAD、tag、remote、dirty files、submodule 与恢复方法。
- `pnpm build/test/typecheck/conformance:portable/perf` 和 Python/Spec pytest 入口通过。
- Web renderer 差分、Desktop smoke、VSIX package、代表性 TeX/PDF 构建及 PDF 检查有真实证据。
- 干净 checkout 能重建所有声明支持的平台资产；不能实际构建的平台明确标为未验证。
- Release manifest、checksums、Git tag、资产与 canonical/mirror commit 一致。

## 完整计划

ID 在本 Cycle 内保持稳定；开始执行后不重排或复用。

| ID | 阶段 | 期望结果 | 验证方式 |
| --- | --- | --- | --- |
| `M1` | 冻结来源并建立恢复锚点 | 三个来源仓和根仓的真实状态、dirty 内容、依赖关系与可回退锚点完整记录；Hypo-Markdown 具备首个可引用 commit | 审阅 source inventory、Git refs、dirty diff 清单与恢复演练命令；不改变未决内容 |
| `S1` | 迁移基线与业务整合设计审阅 | 用户看到真实 inventory、权威层级、历史导入路径映射、拟修改内容、许可证结论和风险清单，并决定是否允许开始导入 | 接受标准：每个来源可恢复，路径/历史策略和业务改造范围清楚，dirty 文件处置明确，MIT 与 Spec 固定/修订方式无未决阻塞 |
| `M2` | 导入 TypeScript 产品 | parser、render model、Web renderer、theme、Desktop 与 VS Code 扩展进入目标目录，portable runtime 边界不变 | pnpm install/build/test/typecheck、portable conformance、perf、Desktop smoke 和 VSIX package |
| `M3` | 整合 Spec、LaTeX 与 Skills | 根 Spec 固定独立 revision；Hypo-LaTeX 历史完整进入 renderer；通用与专用 Skill 分离；重复 Spec 引用消除 | Git 历史/依赖检查、Spec pytest/registry check、LaTeX pytest/CLI doctor、代表性 TeX/PDF 构建与 PDF 检查 |
| `M4` | 统一产品结构、品牌、验证与发布工程 | 根级工作区、CI、文档、品牌、installer/VSIX 和 Release manifest 形成一致产品面 | 干净 checkout 全量验证；许可报告、安全检查、平台构建矩阵和资产 checksum 可审计 |
| `S2` | Release Candidate 与发布治理审阅 | 用户看到可安装/可检查的 RC 产物、兼容性报告、最终版本建议、canonical remote、mirror、publisher 与签名状态 | 接受标准：版本与渠道明确，阻塞平台不被误报，远端副作用和回滚方案获准 |
| `M5` | 发布首轮 Preview | 从已接受 RC 产生 tag、Release、支持平台资产、VSIX、checksums 与镜像同步记录 | 远端 tag/commit/asset 对照、安装 smoke、checksum 验证和发布日志 |
| `S3` | 已发布结果审阅 | 用户检查真实 Release 页面、资产、安装结果、已知限制和回滚入口 | 接受标准：公开内容与验证证据一致，关键下载可用，限制披露完整 |
| `M6` | 非破坏性切换与 Cycle 收尾 | 工作区切换到本仓，旧仓标为保留回退源，迁移结果和后续候选归档 | 最终 Git/status 检查、干净 clone 验证、Cycle Summary；不删除旧目录 |

## 未决问题

- 项目许可证暂按现有 Spec 与 Hypo-LaTeX 的 MIT 倾向验证，在 `S1` 形成结论。
- 首个集成版本不预设；在 `S2` 根据兼容性、迁移变更量和发布范围重新计算。
- GitHub/GitLab 的 canonical 与 mirror 关系、VS Code publisher、扩展 ID、签名和 notarization
  在 `S2` 前必须明确；缺失条件会缩小发布声明，而不会被假定为已解决。
