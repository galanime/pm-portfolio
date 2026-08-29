# 张恒玮｜AI 产品经理作品集

这是面向 AI 产品经理 / 技术产品经理岗位的静态案例页。它以“真实证据优先”为核心：先说明运行状态和验证边界，再呈现用户问题、方案取舍与交付结果。

在线地址：[galanime.github.io/pm-portfolio](https://galanime.github.io/pm-portfolio/)

## 页面结构

- 概览：岗位定位、已确认成果与最新简历。
- 真实运行证据：公开脱敏 Demo、当前本地运行、确定性 Demo 与 mock 运行均有明确徽标和说明。
- 核心案例：闲鱼 AI 客服 Agent、星使智算 Demo2、CareerPilot、灰虎研题教育；案例统一按“用户与问题 → 方案与 AI 边界 → 落地结果”表达。
- 补充案例：LifeHelper、Chart Agent、Short Video Studio Lite。
- AI 产品工作流：从场景到交付迭代的八步闭环。

## 真实性与边界

- 所有文案仅采用已确认的简历事实；未写入本次岗位材料之外的经历或未经确认的测试数。
- `assets/*.jpg` 是本次整理后的最终截图。图片可点击打开原图，caption 会明确说明“公开脱敏本地 Demo / 当前本地运行 / 确定性演示 / mock 运行”等状态。
- CareerPilot 中的百度岗位输入只用于本地 Fake Provider 确定性演示，不是百度官方评分或真实招聘结论。
- SVG 文件仅是结构示意，不被表述为产品真实运行截图。

## 文件说明

```text
index.html       页面结构和全部文案
style.css        设计 tokens、响应式布局、可访问性状态
resume-pm.pdf    当前确认的 2027 校招 AI 产品经理简历
assets/*.jpg     六张最终运行证据图
assets/*.svg     流程结构示意图
```

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://127.0.0.1:8000
```

页面不依赖外部字体、JavaScript 或构建步骤。交互仅使用原生锚点、链接和 `details`，同时包含跳过链接、明显的键盘焦点样式、44px 触控目标与 `prefers-reduced-motion` 支持。

## 发布前检查

```bash
git diff --check
python3 - <<'PY'
from pathlib import Path
from bs4 import BeautifulSoup

root = Path('.')
soup = BeautifulSoup((root / 'index.html').read_text(), 'html.parser')
for node in soup.select('[src], link[href]'):
    ref = node.get('src') or node.get('href')
    if ref and not ref.startswith(('http:', 'https:', 'mailto:', 'tel:', '#')):
        assert (root / ref).exists(), ref
for image in soup.select('img'):
    assert image.get('alt'), image.get('src')
print('local asset links and alt text: OK')
PY
file assets/*.jpg resume-pm.pdf
```

部署 GitHub Pages 时使用 `main` 分支的仓库根目录；无需生成额外构建产物。
