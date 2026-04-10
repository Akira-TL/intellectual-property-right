# 魔镜·品牌创意侵权风险卫士（Demo）

黑客松路演用前端演示项目，目标是在一个页面中完整呈现“创意发布前风险预判 + 发布后监控 + 固证与维权策略”三段闭环。

## 一句话定位

一个能预判“热梗会不会变诉讼风险”的 AI 合规演示工具。

## 当前版本范围

- 仅前端展示，无后端服务。
- 使用本地 mock 数据模拟风险评估、监控告警、证据包与策略建议。
- UI 风格统一采用 Material UI。
- 内置 Agent 网关中间层，可直接对接 AgentPit API Endpoint。

## 三大模式

- 预言家模式（Prophet）：创意发布前侵权风险评估。
- 鹰眼模式（EagleEye）：在售内容与全网疑似侵权监控。
- 法官助手模式（JudgeAssistant）：证据固化、文书生成与维权策略建议。

## 项目亮点

- 风险前置：把法务决策从“发布后补救”前移到“发布前预判”。
- 可解释输出：每次评估都包含颜色分级、置信度、法律依据、判例和建议动作。
- 闭环能力：从预警到监控再到固证和策略建议，形成完整演示链路。
- 讲解友好：页面内置“项目亮点与技术栈叙述 + 路演讲解信息”互动区。
- 演示增强：支持随机场景切换、自动轮播案例与动态数据看板。

## 技术栈（路演宣传口径）

- 目标态产品栈：多模态 AI 识别层 + 法律规则引擎层 + 监控固证平台层 + 企业集成层。
- 当前 Demo 栈：React + TypeScript + Vite + Material UI + 本地 mock 数据。
- 说明：路演可先讲目标态能力，再落回 Demo 已实现闭环，兼顾想象空间与落地可信度。

## 快速开始

```bash
npm install
npm run dev
```

默认端口为 5174。

## 构建与预览

```bash
npm run build
npm run preview
```

## 文档

- 产品简述：[docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md)
- 演示架构：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 路演脚本：[docs/DEMO_STORYLINE.md](docs/DEMO_STORYLINE.md)
- 项目亮点：[docs/PROJECT_HIGHLIGHTS.md](docs/PROJECT_HIGHLIGHTS.md)
- 技术栈说明：[docs/TECH_STACK.md](docs/TECH_STACK.md)
- AgentPit 接入指南：[docs/AGENTPIT_INTEGRATION.md](docs/AGENTPIT_INTEGRATION.md)
- AI 代理协作准则：[.github/copilot-instructions.md](.github/copilot-instructions.md)

## AgentPit 平台填写值

- API Endpoint URL：https://law.babelbeast.com/agent
- Product Web UI URL：https://law.babelbeast.com
- OAuth 回调地址（自动）：https://law.babelbeast.com/auth/callback
- SKILL.md 路径：agentpit/SKILL.md
- OpenAPI（在线）：/agent/openapi.json

## 开源隐私处理

- 已移除可提交仓库中的本地运行密钥配置。
- 示例配置文件：config/agent.runtime.example.json
- 本地私有配置文件：config/agent.runtime.json（已加入 .gitignore）

## 路演讲解建议

1. 先演示“高危热梗”案例，直观看到红色预警与法律依据。
2. 再切到监控模式，展示疑似侵权链接告警与自动取证入口。
3. 最后在法官助手展示“快速下架 vs 持续取证诉讼”的策略对比。
