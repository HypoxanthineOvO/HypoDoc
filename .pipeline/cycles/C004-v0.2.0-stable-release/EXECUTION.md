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

## 2026-08-28 - M2 首次远端 CI 反馈与修复

- **推送：** GitHub `main` 从 `d2fcab0` 更新到稳定候选 `cee4d9c`；未创建 tag/Release。
- **CI run:** `33160024801`；portable-runtime、reference-differential、latex-renderer 全绿，browser 失败。
- **browser 根因：** app grid 明确使用 46px topbar，而 smoke contract 要求至少 48px；测试还保留了 C002
  UI 调整前的 `Use dark theme` / `Toggle navigation` accessible names，前一断言长期提前终止使后续路径未暴露。
- **修复：** desktop/mobile topbar 与 sidebar/scrim offset 统一为 48px；smoke 使用 Settings 的 Dark 选项、
  Show/Hide sidebar 和显式 Chromium channel，并让布局断言输出 metrics。
- **版本标签：** 状态栏原以 `HypoDoc` 标注独立 Spec 版本，改为明确的 `Spec 0.2.0-rc.1`，避免与产品
  `0.2.0` 混淆并加入 smoke 断言。
- **本地证据：** Desktop typecheck、4 tests、Playwright desktop/mobile flows 全通过；桌面 split、移动导航与
  移动 read 截图人工检查无重叠或横向溢出。
- **下一步：** 提交并推送修复，等待新的四组 CI 全绿。

## 2026-08-28 - M2-M5 完成，v0.2.0 发布

- **最终候选：** `3f84e76`；CI run `33161677765` 的 portable-runtime、reference-differential、
  browser、latex-renderer 四组全绿。
- **跨平台构建：** Build Hosts run `33162169706` 锁定 `3f84e76`，Linux、Windows、macOS arm64、
  VSIX 四 jobs 全绿。
- **快速发布路径：** 本机下载大 artifact 受网络限制后，停止全部下载进程；新增可复用的
  `Publish Existing Build` workflow，由 GitHub runner 内部下载已验证 artifacts、构建 Hypo-LaTeX
  wheel/sdist、检查 8 个非空包、生成 SHA-256，并以 draft-first 方式发布。
- **发布结果：** publish run `33164168894` 用时 26 秒；`v0.2.0` stable Release 已公开，9 个附件
  均为 uploaded，tag 指向 `3f84e76`。Release URL：
  https://github.com/HypoxanthineOvO/HypoDoc/releases/tag/v0.2.0
- **镜像：** GitLab `main` 同步至 `c266fda`，`v0.2.0` 同样指向 `3f84e76`。
- **非阻断维护项：** GitHub actions v4 的 Node 20 compatibility warning；VSIX 缺 repository/LICENSE
  package metadata 且文件数较多；安装器仍 unsigned，macOS 未 notarize。
- **结果：** M1-M5 全部完成，C004 closed。
