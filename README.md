# 张恒玮 · AI 产品经理作品集

面向 AI 产品经理 / AI 产品运营 / AIGC 产品实习求职的**产品视角**单页作品集，与工程视角作品集 [`personal-portfolio`](../personal-portfolio/) 互补。

## 与工程师版的区别

| 维度 | 工程师版 (personal-portfolio) | 产品经理版 (pm-portfolio) |
|------|------|------|
| 定位 | AI Agent Engineer | AI 产品经理 |
| 叙事 | 技术实现、架构、测试 | 痛点、方案、设计决策、指标 |
| 项目结构 | 项目 + 技术栈 bullet | 痛点 → 方案 → 关键决策 → 验证成果 |
| 强调色 | 青色 (#64ffda) | 琥珀 (#f5a623) |
| 简历 | resume.pdf | resume-pm.pdf |

## 内容结构

- Hero：定位"会做 Demo 的 AI 产品经理"
- 01 About：产品方法论（痛点驱动 / 可解释流程 / 数据指标 / 动手验证）
- 02 产品案例：4 个案例，每个按 `痛点 / 方案 / 关键设计决策 / 验证与成果` 展开
  - AI 短视频创作工具
  - AI 运营助手（人机协同）
  - AI 生活助手（指标与评估体系）
  - 考研题库学习产品（多角色流程）
- 03 能力矩阵：产品核心 / AI 认知 / 产品工具 / 技术理解力
- 04 Contact：下载产品简历 PDF + GitHub

## 简历来源

`resume-pm.pdf` 由 `job-hunt-kb` 的 `ai_product_manager` 岗位画像生成：

```powershell
cd job-hunt-kb
job-hunt-kb.bat generate --jd-file examples/jds/ai_product_manager_bigtech.txt --role ai_product_manager --company ByteDance --job-title "AI 产品经理实习生" --latex
```

## 本地预览

```powershell
py -m http.server 8000
# 打开 http://localhost:8000
```

## 部署

GitHub Pages：作为独立仓库 push，开启 Pages（branch=main, path=/）。
