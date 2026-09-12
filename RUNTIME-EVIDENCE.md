# 本次运行证据 · 2026-09-12

## Career OS

源版本：galanime/career-os `c020719e18c73153e3c0d0da446c2e19ba687101`。使用用户授权读取的源文件，无产品架构修改。

执行了两条本地合成流程：

1. 原始 SQLiteCareerStore / CareerOSService：导入并核验 3 条履历事实，添加岗位方向，录入 3 个岗位，评估、准备申请、生成对应 grounded resume 产物。使用仓库默认无密钥确定性路径，没有调用付费模型。
2. 原始 create_server：启动 API、SQLite、真实本地 Temporal server/worker。GET /api/health 返回 status=ok、temporal=local-server；POST /api/career/import 导入 3 条事实；POST /api/jobs/ingest 与 POST /api/applications 创建 3 个岗位及带 workflow_id 的申请。记录时申请为 PLANNED，未将该状态表述为成功提交。

截图 assets/career-os-runtime.jpg：浏览器截取 demos/career-os-recording/index.html。该页面采用原始 Review Cockpit 展示结构和 CSS，填入上述实际 API 输出，移除脚本、禁用写操作，仅发布合成数据的只读记录；不是对本地实时服务的直接浏览器截图，也不是完整端到端浏览器投递验证。没有发布私有后端源码、业务数据库、凭据或真实求职记录。

主图保留“运行数据回放 / 合成样例”标识。实际招聘站点浏览器扫描、接管、最终投递与提交验证未在本次执行。未修改原始安全边界。

## Guided Resume Studio

源版本：galanime/guided-resume-studio `1a91116a7f64f802842308298ba4d1a0a1d78a90`。

使用仓库 tests/test_scripts.py 的 fixtures() 生成 profile、ATS map、resume JSON；执行原始 scripts/render_lapiscv.py --preview-only，实际生成 Markdown、HTML 和 preview-manifest.json，退出码 0。字体为免费 Noto Sans CJK SC。仓库提供的张三合成样例只含教育和校园经历；适配检查为 underfilled，未伪装为完整正式简历，也未生成未经批准的正式 PDF。

截图 assets/guided-resume-runtime.jpg：浏览器截取原始 HTML 输出的公开副本 demos/guided-resume-output/index.html。仅移除不可公开访问的本地字体 URL、添加合成样例标识，公开页面使用浏览器字体回退。截图为真实生成产物，不是交互式求职应用界面。

## 原有截图

AsterFire、考研题库、客服、LifeHelper、Short Video Studio、CareerPilot、芯片测试绘图原有资产全部保留。它们是仓库已存在的历史界面/运行截图，本次没有声称重新执行所有这些项目。流程图为设计图，随对应案例正文展开。
