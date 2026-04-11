# AgentPit SSO 与 Token 上报联调验收清单

本文用于验证以下能力：

- OAuth2 SSO 自动单点登录
- OAuth 回调页处理与防循环
- Token 消耗上报接口

## 0. 前置条件

- 站点域名可用：`https://law.babelbeast.com`
- 回调地址已配置：`https://law.babelbeast.com/api/auth/agentpit/callback`
- AgentPit OAuth 凭证：
  - client_id: `cmnt4hprp000g60m31zsrs4su`
  - client_secret: `cmnt4hprp000h60m3js6kjfp4`

## 1. SSO 入口重定向验收

访问：

- `GET /api/auth/agentpit/sso?returnUrl=/agent`

期望：

- 返回 `302`
- `Location` 指向 `https://app.agentpit.io/api/oauth/authorize`
- `Location` 包含参数：
  - `client_id`
  - `redirect_uri=https://law.babelbeast.com/api/auth/agentpit/callback`
  - `response_type=code`
  - `scope=openid profile email`
  - `state=sso:/agent`

## 2. OAuth 回调页验收

完成授权后，AgentPit 会回调：

- `GET /api/auth/agentpit/callback?code=...&state=sso:/agent`

期望：

- 服务端成功换取 token 和 userinfo
- 返回 HTML，浏览器跳转到：
  - `/auth/sso/callback?returnUrl=%2Fagent#token=...&user=...`

## 3. 前端 SSO 回调页验收

访问路径：

- `/auth/sso/callback`

回调页行为期望：

- 从 URL hash 读取 `token`、`user`
- 立即清理 hash，避免敏感信息留在历史记录
- 写入本地存储：
  - `agentpit_access_token`
  - `agentpit_user`
- 清除防循环标记
- 自动跳转 `returnUrl`

失败分支期望：

- 缺少 token 时：跳转 `/agent?sso_error=missing_token`
- 解析 user 失败时：跳转 `/agent?sso_error=parse_failed`

## 4. 防循环机制验收

触发条件：

- 本地无 token，首次进入 `/agent`

期望：

- 仅首次自动跳转到 `/api/auth/agentpit/sso`
- sessionStorage 中存在 `agentpit_sso_attempted`
- 若返回 `sso_error`，不会再次自动重试形成循环
- 可通过按钮 `agentpit 授权登陆` 手动再次发起

## 5. Token 上报接口验收

接口：

- `POST /api/v1/tokens/report`

认证：

- `Authorization: Bearer agp_xxx`

最小请求体：

```json
{
  "agentId": "agent_demo_001",
  "tokensUsed": 1500,
  "inputTokens": 1000,
  "outputTokens": 500,
  "startedAt": "2026-04-11T10:00:00.000Z",
  "endedAt": "2026-04-11T10:00:05.000Z",
  "modelName": "qwen3.5:4b",
  "requestId": "req_demo_001",
  "metadata": { "scene": "e2e" }
}
```

期望：

- 成功返回 `200` 与 `{ success: true, data: ... }`
- 本地记录文件追加数据：`config/token-usage.mock.json`

失败用例：

- 缺少 Bearer：`401`
- API Key 非 `agp_` 前缀：`401`
- `tokensUsed <= 0`：`400`
- `startedAt >= endedAt`：`400`

## 6. Token 上报记录查询验收

接口：

- `GET /api/v1/tokens/report?limit=6`

期望：

- 返回 `200` 与 `{ success: true, data: { total, items } }`
- `items` 按创建时间倒序返回
- `limit` 超过 100 时自动截断到 100

## 7. Agent 面板联调动作验收

在 Agent 接入页面执行：

- 点击“模拟上报 token 消耗”
- 点击“查看最近上报记录”

期望：

- 页面出现“上报成功”提示
- 页面渲染最近记录列表，包含 id、agent、tokens、createdAt

## 8. Prisma 与 API 模板验收

检查以下生成文件是否存在：

- `prisma/schema.prisma`
- `app/api/v1/tokens/report/route.ts`
- `lib/prisma.ts`

期望：

- schema 中包含 `TokenUsage` model 和 `@@map("apbase_TokenUsage")`
- route 模板包含 ApiKey 验证、zod 校验、Prisma create

## 9. OpenAPI 同步验收

检查：

- `agentpit/openapi.yaml`
- `/agent/openapi.json`

期望：

- 同时包含：
  - `/api/auth/agentpit/sso`
  - `/api/auth/agentpit/callback`
  - `/api/v1/tokens/report`
