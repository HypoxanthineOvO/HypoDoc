# HypoDoc 迁移决策

更新日期：2026-08-06

## 已确认

### 1. 这是业务整合，不是原样搬仓

三个来源仓都不完整，只能作为实现材料和参考证据。新仓可以正常修改内容、接口、
目录、命名、文档和构建方式。判断顺序是：已确认的业务目标与产品边界、经审阅的
Spec 与兼容合同、跨 renderer 的验证结果，最后才是旧仓当前实现。

### 2. 新仓建立干净的产品历史

不把 Hypo-Markdown 或 Hypo-LaTeX 的旧 Git 提交合并进新仓 `main`。旧仓、来源 commit
SHA、tag、dirty patch 和测试结果继续保留，用于追溯与回退。经过筛选和修改的文件直接
迁入新仓，并按“运行时、应用、LaTeX、Spec、品牌与发布”等真实业务步骤形成新 commit。

因此，“保存旧历史”和“把旧历史混入新仓”是两件事：前者保留，后者不做。

### 3. 首个整合产品版本是 `v0.1.0`

`v0.1.0` 是新 HypoDoc 产品线的第一个整合版本，不继承 Hypo-LaTeX `v0.4.0` 的版本
连续性。HypoDoc Spec 仍独立版本化，不因产品发布而重置为 `0.1.0`。旧仓 tag 只描述
旧产品，不复用为新仓 tag。

### 4. Spec 独立，但可以被修正

根 `Spec/` 固定独立 HypoDoc Spec revision。三个现有 Spec 状态需要审阅合并；当前 Spec
不是不可质疑的唯一真理。共享规则的修改必须进入独立 Spec、通过测试和 registry 检查，
renderer 不得私下形成第二套共享语义。

### 5. V4 Flash 可以作为后续主执行模型

按用户对其能力的判断，V4 Flash 可以负责 M2 至 M4 的分析、迁移、重构和验证，不限于
机械任务。交接时必须提供当前 Cycle 的 Plan、Progress、Execution、Discussion Summary、
source inventory 和本决策清单。它必须持续更新 Workflow 记录，并在 S2 停下等待人工审阅。

### 6. 发布副作用继续受人工控制

在 S2 接受之前，不 push 新 remote、不创建公开 tag/Release、不上传 Marketplace，也不声称
Windows、macOS、签名或 notarization 已验证。旧仓在一个发布观察期内保留，不立即删除。

## 仍待确认

- 新仓第一方代码是否统一采用 MIT。Spec 与 Hypo-LaTeX 已是 MIT，但 Hypo-Markdown 没有
  第一方许可证文件，因此需要用户明确确认。
- GitHub/GitLab 的 canonical 与 mirror 方向。
- VS Code Marketplace publisher、正式 extension ID、签名与 notarization 策略。

其中只有 MIT 决定仍属于当前 S1；其余发布治理问题在 S2 解决。
