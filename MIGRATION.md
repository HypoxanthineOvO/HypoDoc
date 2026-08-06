# HypoDoc 本地迁移设计

## 当前状态

这个目录目前只是新的产品 Monorepo 骨架，不包含已迁移的产品源码。

以下现有工作区保持原样：

- `../Hypo-Markdown`：Portable TypeScript runtime、Web renderer、Desktop 和 VS Code 扩展。
- `../Hypo-LaTeX`：LaTeX/PDF renderer、Python CLI、主题与 LaTeX 专用 Skill。
- `../HypoDoc-Spec`：HypoDoc DSL 的独立语义权威。

迁移完成并通过验证前，不删除、不覆盖、不就地重命名这些目录。

## 目标结构

```text
HypoDoc/
├── Spec/                       # 独立 Spec 仓的固定版本入口
├── Skills/
│   ├── Authoring/              # 与 renderer 无关的 DSL 写作 Skill
│   └── LaTeX/                  # LaTeX/PDF 构建与验证 Skill
├── Packages/
│   ├── parser-core/
│   ├── render-model/
│   ├── render-web/
│   └── theme/
├── Renderers/
│   └── LaTeX/
├── Apps/
│   └── Desktop/
├── Extensions/
│   └── VSCode/
└── Docs/
```

顶层目录表达产品边界；内部包名可以继续遵循 npm、Python 和平台工具链的
小写命名习惯。

## 来源映射

| 来源 | 目标 | 迁移方式 |
| --- | --- | --- |
| `Hypo-Markdown/packages/*` | `Packages/*` | 从固定来源 SHA 筛选并直接整理到新产品历史 |
| `Hypo-Markdown/apps/desktop` | `Apps/Desktop` | 保留源码，更新 workspace 路径与产品名 |
| `Hypo-Markdown/extensions/vscode` | `Extensions/VSCode` | 保留扩展 ID 决策，更新构建与发布路径 |
| `Hypo-Markdown/packages/render-web` | `Packages/render-web` | 首次迁移继续作为共享 Web renderer package |
| `Hypo-LaTeX` | `Renderers/LaTeX` | 固定来源 SHA 后直接整理内容；旧仓独立保留历史 |
| `Hypo-LaTeX/skill` | `Skills/LaTeX` | 先区分通用写作规则与 LaTeX 专用规则 |
| `HypoDoc-Spec` | `Spec/` | 保持独立版本与历史，以固定 revision 接入 |

## 执行阶段

### 阶段 0：冻结与盘点

1. 记录三个来源工作区的 branch、HEAD、tag、remote 和 dirty files。
2. 为未提交内容生成只读清单，不擅自丢弃或覆盖。
3. 第一方代码采用 MIT，首发产品版本为 `v0.1.0`；GitHub/GitLab 主从关系留到发布治理审阅。

完成条件：任何来源文件都能从 Git 或明确的 dirty-file 清单恢复。

### 阶段 1：建立来源锚点

1. 整理 `Hypo-Markdown` 的首个 commit，排除 build、release 和 runtime 临时产物。
2. 单独处理 `Hypo-LaTeX` 当前未提交的 `uv.lock`，运行测试后再决定是否提交。
3. 补齐并核对 `Hypo-LaTeX v0.4.0` 的 tag 与 Release 历史。

完成条件：两个产品来源都有稳定、可引用的 commit。

### 阶段 2：导入 TypeScript 产品

1. 从固定来源 SHA 直接整理共享 packages、Desktop、VS Code 和工具脚本，不合并旧仓 Git 历史。
2. 更新 pnpm workspace、TypeScript 配置和 CI 路径。
3. 保持 portable runtime 不依赖 Python/Pandoc 的现有边界。

完成条件：typecheck、test、build、差分测试和性能预算全部通过。

### 阶段 3：导入 HypoDoc LaTeX

1. 从固定来源 SHA 筛选并整理内容到 `Renderers/LaTeX`，不合并旧仓 Git 历史。
2. 移除重复的嵌套 Spec 引用，统一由根 `Spec/` 提供固定规范版本。
3. 将 renderer-neutral 的写作规则提取到 `Skills/Authoring`。
4. 将产品发布线统一为 `v0.1.0`；Spec 独立版本化，旧 Hypo-LaTeX `v0.4.0` 不作为新产品版本前身。

完成条件：Python tests、CLI 构建、代表性 TeX/PDF 构建与现有 release contract 通过。

### 阶段 4：统一品牌与发布

1. 产品名统一为 `HypoDoc`、`HypoDoc Desktop`、`HypoDoc for VS Code` 和 `HypoDoc LaTeX`。
2. 建立正式 installer workflow，而不是只上传 Electron unpacked directory。
3. 为 Windows、macOS、Linux、VSIX 和校验和生成 GitHub Release assets。
4. 在 canonical remote 发布后向第二平台同步 commit、tag 和 Release assets。

完成条件：干净 clone 可以重建所有公开资产，校验和与 CI 记录可审计。

### 阶段 5：切换工作区

1. 在新的 `HypoDoc` 目录完成全量验证。
2. 重新打开 VS Code 到本目录。
3. 旧工作区先标记 archived，不立即删除。
4. 观察一个发布周期后再决定是否移除本地旧目录。

## 不可跨越的安全门

- 来源仓有 dirty files 时，不做破坏性迁移。
- 没有来源 commit、dirty patch 或等价恢复证据时，不开始内容迁移。
- 新仓全量测试未通过时，不归档旧仓。
- Windows/macOS 未实际构建时，不把对应产物写成已验证。
- 未确定许可证、签名和 notarization 状态时，不发布 `1.0.0`。
- 两个平台不同时手工维护独立历史；必须先确定 canonical remote。
## 尚待决定

- GitHub canonical + GitLab mirror，或相反。
- VS Code Marketplace publisher 与正式扩展 ID。
- macOS/Windows 签名、notarization 和证书管理策略。
