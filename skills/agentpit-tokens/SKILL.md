---
name: agentpit-tokens
description: 在 AgentPit 项目中生成 token 消耗上报接口，包含 Prisma model 和 API 路由
user-invocable: true
---

# AgentPit Token 消耗上报接口生成

## 目标

生成可复用的 token 消耗上报能力，覆盖：

- Prisma model: TokenUsage
- API 路由: POST /api/v1/tokens/report
- API 路由: GET /api/v1/tokens/report?limit=6
- ApiKey Bearer 认证
- 请求体验证与时间窗口校验

## 当前项目已落地产物

- prisma/schema.prisma
  - 新增 TokenUsage model
  - 增加 Agent/Application/User 反向关系
  - 表名映射 apbase_TokenUsage
- app/api/v1/tokens/report/route.ts
  - 标准 Next.js Route Handler 模板
  - Bearer ApiKey 校验
  - zod 请求体验证
  - Prisma 写入 tokenUsage
- lib/prisma.ts
  - Prisma Client 单例模板
- vite.config.mjs
  - 运行期新增 /api/v1/tokens/report 演示端点
  - 新增 /api/v1/tokens/report 查询端点（最近记录）
  - 记录写入 config/token-usage.mock.json

## 请求体契约

必填字段：

- agentId: string
- tokensUsed: number (正整数)
- startedAt: ISO datetime
- endedAt: ISO datetime

可选字段：

- inputTokens: number
- outputTokens: number
- modelName: string
- requestId: string
- metadata: object

## 认证方式

- Authorization: Bearer agp_xxx

## 返回格式

- 成功: { success: true, data: {...} }
- 失败: { success: false, error: "..." }

查询返回：

- { success: true, data: { total, items } }

## 验证清单

- 缺少 Bearer 头返回 401
- agentId 或 tokensUsed 不合法返回 400
- startedAt >= endedAt 返回 400
- 合法请求可返回 id 与落库时间
