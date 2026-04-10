# AgentPit 技术配置填写指南

## 平台字段填写

### 1) API Endpoint URL（必填）

填写值：
https://law.babelbeast.com/agent

说明：

- 该地址由本项目内置 Agent 网关提供。

### 2) 产品 Web UI 地址（推荐）

填写值：
https://law.babelbeast.com

说明：

- 填写后平台会自动计算 OAuth 回调地址。
- 当前项目已实现回调页面路由：/auth/callback。

### 3) OAuth 回调地址（自动计算）

https://law.babelbeast.com/api/auth/agentpit/callback

说明：

- 平台根据 Web UI 地址自动生成。
- 回调页会显示 code/state，便于后续服务端换 Token。

### 4) SKILL.md 内容（可选）

- 文件路径：agentpit/SKILL.md
- 直接复制文件内容粘贴到平台即可。

### 5) OpenAPI Spec（可选）

二选一：

- 本地文件：agentpit/openapi.yaml
- 在线地址：https://law.babelbeast.com/agent/openapi.json

## 本地模型配置

配置文件分层：

- 示例模板（可提交）：config/agent.runtime.example.json
- 本地私有配置（不要提交）：config/agent.runtime.json

建议步骤：

1. 复制 config/agent.runtime.example.json 为 config/agent.runtime.json
2. 在本地文件中填入真实配置（如 API key）
3. 保持 config/agent.runtime.json 不进入版本库

示例字段：

- baseUrl: http://localhost/v1
- timeout: 5000
- key: OLLAMA_API_KEY_OR_PLACEHOLDER
- model: qwen3.5:4b
- max_tokens: 10240

## 本地接口清单

- POST /agent：智能体主入口
- GET /agent/health：健康检查
- GET /agent/openapi.json：OpenAPI JSON
- GET /auth/callback：OAuth 回调展示页

## 部署备注

- 若你更换域名或端口，请同步更新：
  - src/data/demoData.ts 中的 agentIntegrationConfig
  - docs/AGENTPIT_INTEGRATION.md
  - agentpit/openapi.yaml 中 server 地址
