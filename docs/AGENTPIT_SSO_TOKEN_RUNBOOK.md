# AgentPit SSO 与 Token 上报运行手册

## 1. 可直接复制的请求样例

### 1.1 SSO 入口

请求：

GET https://law.babelbeast.com/api/auth/agentpit/sso?returnUrl=%2Fagent

预期：

- 状态码 302
- 跳转到 app.agentpit.io 的 authorize 地址

### 1.2 OAuth 回调（由授权平台自动调用）

请求示例：

GET https://law.babelbeast.com/api/auth/agentpit/callback?code=demo_code&state=sso:/agent

预期：

- 返回 HTML
- 自动跳转到 /auth/sso/callback

### 1.3 Token 上报

请求：

POST https://law.babelbeast.com/api/v1/tokens/report
Authorization: Bearer agp_demo_key
Content-Type: application/json

请求体：

{
  "agentId": "agent_demo_001",
  "tokensUsed": 1500,
  "inputTokens": 1000,
  "outputTokens": 500,
  "startedAt": "2026-04-11T10:00:00.000Z",
  "endedAt": "2026-04-11T10:00:06.000Z",
  "modelName": "qwen3.5:4b",
  "requestId": "req_demo_001",
  "metadata": {
    "scene": "hackathon_demo",
    "caseId": "case-sf"
  }
}

成功响应：

{
  "success": true,
  "data": {
    "id": "tok_xxx",
    "agentId": "agent_demo_001",
    "tokensUsed": 1500,
    "startedAt": "2026-04-11T10:00:00.000Z",
    "endedAt": "2026-04-11T10:00:06.000Z",
    "createdAt": "2026-04-11T10:00:06.500Z"
  }
}

### 1.4 Token 上报记录查询

请求：

GET https://law.babelbeast.com/api/v1/tokens/report?limit=6

成功响应：

{
  "success": true,
  "data": {
    "total": 3,
    "items": [
      {
        "id": "tok_xxx",
        "agentId": "agent_demo_001",
        "tokensUsed": 1500,
        "createdAt": "2026-04-11T10:00:06.500Z"
      }
    ]
  }
}

### 1.5 页面联调按钮

Agent 接入页面新增按钮：

- agentpit 授权登陆
- 模拟上报 token 消耗
- 查看最近上报记录

用于现场直接演示完整链路，无需外部脚本。

## 2. 常见失败排查

- 失败现象：浏览器提示 Blocked request. This host is not allowed.
  - 排查点：Vite server.allowedHosts 是否包含 law.babelbeast.com

- 失败现象：回调后落到 /agent?sso_error=missing_token
  - 排查点：回调 HTML 是否把 token 和 user 放入 hash

- 失败现象：上报返回 401
  - 排查点：Authorization 是否 Bearer 且 key 以 agp_ 前缀开头

- 失败现象：上报返回 400
  - 排查点：startedAt 是否早于 endedAt，tokensUsed 是否为正整数

- 失败现象：读取记录为空
  - 排查点：是否先执行过一次“模拟上报 token 消耗”

## 3. 回滚清单

如果要快速回到改造前状态，按优先级回滚：

1. 回滚后端 SSO 与上报端点
   - vite.config.mjs 中 /api/auth/agentpit/sso
   - vite.config.mjs 中 /api/auth/agentpit/callback
   - vite.config.mjs 中 /api/v1/tokens/report
  - vite.config.mjs 中 GET /api/v1/tokens/report 记录查询逻辑

2. 回滚前端 SSO 页面与自动触发
   - 删除 src/components/SsoCallbackPage.tsx
   - 删除 src/utils/ssoHelper.ts
   - main.tsx 去掉 /auth/sso/callback 分支
   - AgentIntegrationPanel.tsx 去掉自动 SSO 与授权按钮

3. 回滚生成模板文件
   - 删除 prisma/schema.prisma
   - 删除 app/api/v1/tokens/report/route.ts
   - 删除 lib/prisma.ts

4. 回滚文档与技能文件
   - 删除 skills/agentpit-sso/SKILL.md
   - 删除 skills/agentpit-tokens/SKILL.md
   - 删除 docs/AGENTPIT_SSO_TOKEN_ACCEPTANCE.md
   - 删除 docs/AGENTPIT_SSO_TOKEN_RUNBOOK.md

5. 清理运行数据
   - 清空 config/token-usage.mock.json
   - 清空浏览器 localStorage: agentpit_access_token, agentpit_user
   - 清空浏览器 sessionStorage: agentpit_sso_attempted
