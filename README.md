# 张恒玮 · AI 产品经理作品集

蓝白主题的个人作品集，使用原生 HTML、CSS 和 JavaScript。无需构建、付费组件或第三方脚本。

## 内容

- 个人肖像、北邮硕士身份、中共党员及党支部书记经历。
- 8 个案例：AsterFire Edu、考研题库、Career OS、内容工作流、AI 客服、短视频创作、AI 生活助手、用户问题闭环。
- 保留原首页 6 个项目的内容及全部 8 张截图/流程图；额外使用仓库已有的产品画面。
- 北邮硕士与山东科技大学本科教育经历。专业、时间和教育表现来自仓库原有 `resume-pm.pdf`。
- 项目分类、可展开案例、支持键盘操作的图片灯箱、移动导航、复制邮箱、滚动进度、可关闭动效。

## 本地运行

```bash
python -m http.server 8080
```

访问 `http://localhost:8080/`。现有 GitHub Pages 结构保持兼容：`index.html` 位于根目录。

## 素材与事实来源

- 用户提供个人肖像：`assets/hengwei-portrait.jpeg`。
- 北邮官方校徽与校名：https://vi.bupt.edu.cn/images/logo1.png
- 北邮视觉规范：https://vi.bupt.edu.cn/jcxt/xhgf.htm
- 山科官方校徽组合图：https://www.sdust.edu.cn/images/logo.png
- 校徽原文件保持完整，教育卡片以 CSS 裁切展示校徽区域，不重绘或改变颜色。
- AsterFire Edu 与 Career OS 的功能边界按用户授权读取的当前项目 README 核对；不链接私有仓库，不复制内部文档。
- 原截图保留原有语境；AsterFire 截图标注为迭代记录，Career OS 使用明确标注的工作流设计示意。
- 设计层次参考：https://brittanychiang.com/ 与 https://www.apple.com/macbook-pro/

## 验证

- JavaScript 语法校验。
- 原有图片保留、8 个案例计数、资源存在性、页面锚点及唯一 ID 校验。
- `prefers-reduced-motion` 与页面动效开关均能关闭非必要动画；图片支持原生模态框、Esc 关闭及左右切换。
- 页面无运行时第三方字体、分析脚本或收费 API 依赖。

当前改版提交于 `redesign/portrait-portfolio`，由 PR #1 审阅，未自动合并至主分支。

## 沉浸式交互更新

- 直接打开首页；preview.html 仅兼容跳转，不再显示设备框或工具栏。
- 叙述顺序：个人定位 → 产品方法 → 项目证据 → 教育背景 → 责任与协作 → 联系。
- AsterFire Edu 五阶段方法演示支持点击、下一步与键盘方向键。
- 新增首屏错峰入场、抽象信号背景、微视差、卡片指针光效、肖像透视、按钮磁吸/波纹、详情高度转场、图片切换、缩略图扫描高光及分层悬停反馈。
- 动效暂停与系统减少动效偏好保留；Canvas 离屏时停止绘制。
