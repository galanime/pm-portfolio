# 张恒玮｜AI 产品经理作品集

面向 2027 届 AI 产品经理 / 技术产品经理岗位的竖版 A4 作品集。网页以连续纸张方式呈现封面与七个项目案例，每页分别展示运行、脱敏复现或 Mock 证据、交付结果、产品机制与事实边界；不以流程图替代运行证据，也不把截图范围以外的事实夸大为现场证明。

在线地址：[galanime.github.io/pm-portfolio](https://galanime.github.io/pm-portfolio/)

## 当前结构

- 无侧边栏的竖版封面：姓名、岗位定位、电话、邮箱、GitHub、`resume-pm.pdf` 下载与浏览器打印入口。
- 三项已确认成果摘要：企业内部独立交付 5 个软件产品 / 工具、ToB 教育产品约 5000 名学员覆盖、闲鱼 AI 客服 4 家商家使用且 1 家购买后续迭代服务。
- 七个项目各占一张竖版案例页：闲鱼 AI 客服 Agent、星使智算 Demo2、CareerPilot、北京灰虎研题教育、LifeHelper、Chart Agent、Short Video Studio Lite。
- 网页端滚动浏览 8 张竖版纸张；浏览器打印输出为 8 页 A4 竖版 PDF。

## 截图、状态与公开边界

| 项目 | 截图资产 | 截图状态 / 边界 |
| --- | --- | --- |
| 闲鱼 AI 客服 Agent | `assets/xianyu-agent-runtime.jpg` | 公开脱敏 Demo；不连接真实账号、ADB 或外部日历。 |
| 星使智算 Demo2 | `assets/demo2-molecular-lab.jpg` | 当前本地运行；证明教学页面及 3D / SchNet 链路，不外推为训练结论。 |
| CareerPilot | `assets/careerpilot-baidu-run.jpg` | 确定性演示；百度 JD 只是输入，Fake Provider 不代表百度官方结论。 |
| 北京灰虎研题教育 | `assets/huihu-student-entry-runtime.png` | 公开 Mock 小程序在微信开发者工具中的运行截图；使用本地 Mock 数据，不发起支付或上传信息。 |
| LifeHelper | `assets/lifehelper-runtime.jpg` | 本地 mock 运行；评分只对应本地样本。 |
| Chart Agent | `assets/chart-agent-public-runtime.jpg` | 公开脱敏复现；**非内部源码 / 真实数据，不证明内部版本 UI**。内部项目本身已交付，无公开源码。 |
| Short Video Studio Lite | `assets/short-video-review-ready.png` | 公开 Lite Mock；截图证明 Review Ready 与 approval pending 门禁，不含付费 Provider、自动发布或客户数据。 |

页面中的 SVG 如存在，仅可作为结构示意，不能表述为产品运行截图。

## 文件说明

```text
index.html                         页面结构和事实文案
style.css                          竖版画册、响应式和 A4 portrait 打印样式
resume-pm.pdf                      当前确认的 2027 校招 AI 产品经理简历
assets/*-runtime.*                 各项目的运行、脱敏、复现或 Mock 页面截图
demos/chart-agent-public/          可运行的 Chart Agent 公开脱敏复现页
```

## 本地预览与打印

```bash
python3 -m http.server 8000
# 打开 http://127.0.0.1:8000
```

桌面端会居中展示接近实际 A4 比例的连续纸张；移动端会在保留内容顺序的前提下自适应屏幕宽度。点击“打印竖版 A4”（页面 CSS 已通过 `@page` 指定 A4 portrait）即可保存 8 页竖版 PDF。页面无构建步骤与外部字体依赖。

## 静态检查

```bash
git diff --check
python3 - <<'PY'
from pathlib import Path
from html.parser import HTMLParser

class Assets(HTMLParser):
    def __init__(self):
        super().__init__(); self.images = []; self.alts = []; self.classes = []
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'img':
            self.images.append(values.get('src'))
            self.alts.append(values.get('alt'))
        if 'class' in values:
            self.classes.append(values['class'])

root = Path('.')
parser = Assets()
parser.feed((root / 'index.html').read_text())
assert len(parser.images) == 7, parser.images
assert all(parser.alts), 'every runtime screenshot needs alt text'
assert not any('sidebar' in value for value in parser.classes), 'sidebar must not return'
assert (root / 'index.html').read_text().count('class="sheet ') == 8
assert '@media print' in (root / 'style.css').read_text()
assert '@page { size: A4 portrait' in (root / 'style.css').read_text()
print('eight portrait sheets, seven images, alt text, no sidebar and print CSS: OK')
PY
```

发布前还需核对全部截图路径、桌面端每张纸的 210:297 比例、390px 移动端无横向滚动，以及生成的 PDF 是否为 8 页 A4 竖版。
