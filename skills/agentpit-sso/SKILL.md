---
name: agentpit-sso
description: 为 AgentPit 子应用生成 SSO 自动单点登录功能，包含后端 OAuth 端点、前端回调页和防循环机制
user-invocable: true
---

# AgentPit SSO 自动单点登录生成

## 目标

为子应用提供自动单点登录链路，覆盖以下能力：

- 后端 SSO 入口端点：GET /api/auth/agentpit/sso
- 后端 OAuth 回调端点：GET /api/auth/agentpit/callback
- 前端回调页：/auth/sso/callback
- 防循环机制：sessionStorage 单次尝试标记
- 手动触发按钮：agentpit 授权登陆

## 当前项目已落地产物

- vite.config.mjs
  - 新增 /api/auth/agentpit/sso
  - 增强 /api/auth/agentpit/callback（支持 state 前缀 sso:）
- src/utils/ssoHelper.ts
  - shouldAutoSso
  - markSsoAttempted
  - clearSsoAttempted
  - buildSsoEntryUrl
- src/components/SsoCallbackPage.tsx
  - 从 hash 读取 token/user
  - 写入 localStorage
  - 立即清理 hash
- src/components/AgentIntegrationPanel.tsx
  - 自动 SSO 触发
  - agentpit 授权登陆 按钮
  - 授权结果与错误提示

## OAuth2 配置

- callback: https://law.babelbeast.com/api/auth/agentpit/callback
- client_id: cmnt4hprp000g60m31zsrs4su
- client_secret: cmnt4hprp000h60m3js6kjfp4
- authorize: https://app.agentpit.io/api/oauth/authorize
- token: https://app.agentpit.io/api/oauth/token
- userinfo: https://app.agentpit.io/api/oauth/userinfo

## 安全约束

- token 通过 URL hash 传递，避免进入服务端访问日志
- 回调页读取后立即清理 hash
- returnUrl 仅允许相对路径，防止开放重定向
- 同一浏览器 session 仅自动尝试一次，防止死循环

## 验证清单

- 访问 /agent 页面且无本地 token 时，会自动跳转 /api/auth/agentpit/sso
- OAuth 回调命中 /api/auth/agentpit/callback 并返回前端回调页
- /auth/sso/callback 能正确写入 token 与用户信息
- 失败时跳转 /agent?sso_error=...
