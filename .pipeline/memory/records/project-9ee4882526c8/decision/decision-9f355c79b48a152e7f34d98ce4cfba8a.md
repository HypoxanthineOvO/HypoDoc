---
authority_role: record
confidence: confirmed
created_at: 2026-08-06T11:32:18.767Z
dedupe_key: canonical_remote_and_legacy_cleanup
id: decision-9f355c79b48a152e7f34d98ce4cfba8a
kind: decision
schema_version: '1'
scope:
  ref: project:HypoDoc
  type: project
semantic_hash: 9f355c79b48a152e7f34d98ce4cfba8a88f23b11
source_refs:
  - locator: request.s2-governance-answers
    ref: s2-review
    type: user_request
supersedes: []
updated_at: 2026-08-06T11:32:18.767Z
---
# Canonical 远端与旧仓清理策略

用户确认：新仓 canonical 远端使用本地 gh/glab 创建；仓库名必须为大写 `HypoDoc`。旧产品实现仓库（Hypo-Markdown、Hypo-LaTeX 本地工作区与远端）可以清理；HypoDoc-Spec 作为独立语义权威仓库继续保留（新仓 submodule 依赖其远端）。清理动作保留 recovery patches 与来源 SHA 证据。
