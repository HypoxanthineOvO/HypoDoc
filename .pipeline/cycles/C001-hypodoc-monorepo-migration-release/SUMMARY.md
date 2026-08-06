---
kind: cycle-summary
cycle: C001-hypodoc-monorepo-migration-release
closed: 2026-08-06
---

# HypoDoc Monorepo 迁移、整理与发布 Cycle Summary

## 交付结果

HypoDoc `v0.1.0` 已发布：https://github.com/HypoxanthineOvO/HypoDoc/releases/tag/v0.1.0

- **资产**：Linux AppImage/deb、Windows NSIS exe、macOS arm64 dmg/zip、VSIX、CHECKSUMS。
- **仓库**：GitHub canonical `HypoxanthineOvO/HypoDoc`（大写），内部 GitLab mirror `heyx/HypoDoc` 同步。
- **CI**：全绿（portable-runtime / reference-differential / browser / latex-renderer）；三平台安装器 CI 打包通过。
- **验证**：`scripts/validate-all.sh` 全绿——TS typecheck/test/build、audit、licenses、perf、Spec 268 pytest + registry、conformance 13/13、LaTeX doctor + 254 tests、代表性 PDF、VSIX。

## 里程碑记录

- `M1` 来源冻结与恢复锚点：commit/SHA/patch 全记录。
- `S1` 迁移基线审阅：MIT、干净产品历史、`v0.1.0`、Spec 独立修订、V4 Flash 主执行确认。
- `M2` TypeScript 产品导入：Packages/Apps/Extensions + 根 pnpm 工作区。
- `M3` Spec 固定（`ef80abe`）、LaTeX renderer（v0.1.0）、Skills 拆分。
- `M4` 品牌统一、根验证入口、CI、许可报告、Release manifest。
- `S2` 发布治理：canonical/mirror、VSIX 手动交付、平台验证授权、Spec push 授权。
- `M5` 发布：GitHub Release 全资产、三平台安装器、CI 全绿。
- `S3` 已发布结果审阅：用户确认收尾。
- `M6` 收尾：干净 clone 验证通过（submodule 远端拉取）；旧仓本地清理完成；远端 hypodoc-latex 删除待 `delete_repo` scope。

## 已知限制（如实记录）

- 安装包未签名（SmartScreen/Gatekeeper 提示）；macOS 仅 arm64；notarization 未做。
- VS Code 扩展以 VSIX 手动安装交付，未注册 Marketplace publisher。
- Web/Desktop 预览无 Beamer 逐帧幻灯片模式（LaTeX/PDF 面完整支持 Slides DSL）。
- 三平台安装器在 CI 构建通过，但真实宿主安装冒烟仅 Linux 本机执行。

## 后续候选（不在本 Cycle）

- `delete_repo` scope 授权后删除 GitHub `hypodoc-latex` 远端。
- 注册 VS Code publisher（需 PAT）与 Marketplace 发布。
- macOS Intel 包、签名与 notarization。
- Web/Desktop 幻灯片放映模式。
