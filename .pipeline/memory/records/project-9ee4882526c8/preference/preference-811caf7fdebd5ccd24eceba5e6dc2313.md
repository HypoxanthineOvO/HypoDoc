---
authority_role: record
confidence: confirmed
created_at: 2026-08-06T11:32:18.767Z
dedupe_key: ci_validation_robustness
id: preference-811caf7fdebd5ccd24eceba5e6dc2313
kind: preference
schema_version: '1'
scope:
  ref: project:HypoDoc
  type: project
semantic_hash: 811caf7fdebd5ccd24eceba5e6dc23135e02a41d
source_refs:
  - locator: request.s2-governance-answers
    ref: s2-review
    type: user_request
supersedes: []
updated_at: 2026-08-06T11:32:18.767Z
---
# CI 验证稳健性偏好

用户授权 Windows/macOS 平台构建验证，但要求验证本身避免过度精细的断言：CI 验收标准应以构建/测试/产物存在为准，不得因轻微输出变化（如页数、格式化细节、小优化）直接失败；保留有意的语义与安全门禁。
