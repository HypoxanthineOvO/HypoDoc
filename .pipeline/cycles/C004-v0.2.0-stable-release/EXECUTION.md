---
kind: execution-log
cycle: C004-v0.2.0-stable-release
updated: 2026-08-28
---

# HypoDoc v0.2.0 稳定版发布执行记录

## 2026-08-28 - C004 创建，M1 开始

- **授权：** 用户要求尝试发布 `0.2.0`，包含稳定化、push、CI、跨平台构建、tag 和 GitHub Release。
- **基线：** 本地 `main` 为 `df5667d`，相对 GitHub `main` ahead 8；工作树干净，无 `v0.2.0-rc.1` tag。
- **版本边界：** 产品 packages 与 Hypo-LaTeX 升为稳定 `0.2.0`；Spec 是独立版本线，继续固定
  `ef80abe` / `v0.2.0-rc.1`，IR 保持 `hypodoc.ir/v1`。
- **发布门禁：** 本地验证、GitHub CI 或 Build Hosts 任一失败都阻止 tag/Release。
- **下一步：** 刷新 Hypo-LaTeX lock，审计版本范围，运行完整本地发布验证。

## 2026-08-28 - M1 完成，M2 开始

- **稳定版本：** 7 个 JavaScript/Desktop/VS Code manifests 与 Hypo-LaTeX distribution/lock 均为
  `0.2.0`；Spec 子模块仍固定 `ef80abe` / `0.2.0-rc.1`。
- **发现并修复：** 完整入口首次在代表性 PDF 阶段发现公开 showcase 引用未提交的
  `assets/showcase-flow.png`。新增 1600x680 自包含流程图、资源存在性 contract test，并以
  `182ff9b fix(latex): make public showcase self-contained` 独立提交。
- **环境说明：** Spec 的一次离线 wheel test 因本机 uv cache 未预热失败；在线解析并缓存完整依赖树后，
  定向测试通过，未修改 Spec 代码；最终全量重跑为 `268 passed`。
- **最终本地验证：** `scripts/validate-all.sh` 以 `ALL VALIDATION PASSED` 结束：workspace typecheck、
  34 JS/TS tests、production builds、0 known vulnerabilities、271 licenses/0 unresolved、performance
  `valid=true`、Spec 268 tests、differential 13/13、Hypo-LaTeX 269 passed/12 skipped、strict 13-page
  showcase PDF 与 189-file VSIX 全通过。
- **下一步：** 创建稳定 release commit，推送 GitHub main 并监督四组 CI jobs。
