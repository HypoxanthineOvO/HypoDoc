---
kind: cycle-summary
cycle: C004-v0.2.0-stable-release
status: completed
closed: 2026-08-28
---

# C004 Summary: HypoDoc v0.2.0 稳定版发布

## 结果

HypoDoc `v0.2.0` 已作为 stable GitHub Release 发布：
https://github.com/HypoxanthineOvO/HypoDoc/releases/tag/v0.2.0

产品 JavaScript/Desktop/VS Code 与 Hypo-LaTeX distribution 均为 `0.2.0`；独立 HypoDoc Spec
继续固定 `0.2.0-rc.1` / IR `hypodoc.ir/v1`。发布 tag 指向完整验证与打包的 `3f84e76`。

## 验证与修复

- 本地 `scripts/validate-all.sh` 最终以 `ALL VALIDATION PASSED` 结束：34 JS/TS tests、Spec
  268 tests、differential 13/13、Hypo-LaTeX 269 passed/12 skipped、build/audit/licenses/perf/VSIX。
- 修复公开 showcase 缺失的图片资源，并新增 self-contained contract test；strict PDF 为 13 页 A4。
- 首次远端 browser job 暴露 46px toolbar 与 48px contract 冲突及旧 UI selectors；修复后本地
  desktop/mobile smoke 与远端 browser job 均通过，截图无重叠或横向溢出。
- 最终 CI run `33161677765` 四组全绿；Build Hosts run `33162169706` 四 jobs 全绿。

## 发行资产

Release 包含 Linux AppImage/deb、Windows NSIS exe、macOS arm64 dmg/zip、VSIX、Hypo-LaTeX
wheel/sdist 与 `CHECKSUMS.txt`，共 9 个附件。GitHub 返回的 asset digest 与 checksum 清单一致。

## 发布路径

本机到 GitHub artifact CDN 的大文件下载缓慢，因此没有继续做本机下载再上传。新增
`Publish Existing Build` workflow，在 GitHub 内部复用已验证的 Build Hosts artifacts，执行
source/run SHA 验证、资产核验、checksum 和 draft-first 发布；实际 publish run 用时 26 秒。

## 已知限制与后续

- 安装器 unsigned，macOS 未 notarize，操作系统安全提示仍会出现。
- macOS 仅 arm64；VS Code 扩展仍通过 VSIX 分发，未发布 Marketplace。
- VSIX 应补 repository/LICENSE package metadata，并继续减少 packaged file count。
- GitHub actions v4 当前产生 Node 20 compatibility warning，需要后续升级 action major versions。
