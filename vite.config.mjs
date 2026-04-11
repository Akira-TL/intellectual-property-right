import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimeConfigPath = path.join(__dirname, "config", "agent.runtime.json");
const runtimeConfigExamplePath = path.join(
    __dirname,
    "config",
    "agent.runtime.example.json"
);
const tokenUsageStorePath = path.join(__dirname, "config", "token-usage.mock.json");

const defaultRuntimeConfig = {
    api: {
        baseUrl: "http://localhost:11434/v1",
        timeout: 5000,
        key: "ollama",
        model: "qwen3.5:4b",
        max_tokens: 10240
    },
    oauth: {
        authorizeUrl: "https://app.agentpit.io/api/oauth/authorize",
        tokenUrl: "https://app.agentpit.io/api/oauth/token",
        userInfoUrl: "https://app.agentpit.io/api/oauth/userinfo",
        clientId: "cmnt4hprp000g60m31zsrs4su",
        clientSecret: "cmnt4hprp000h60m3js6kjfp4",
        redirectUri: "https://law.babelbeast.com/api/auth/agentpit/callback",
        ssoCallbackPath: "/auth/sso/callback"
    }
};

function loadRuntimeConfig() {
    try {
        const selectedPath = fs.existsSync(runtimeConfigPath)
            ? runtimeConfigPath
            : fs.existsSync(runtimeConfigExamplePath)
                ? runtimeConfigExamplePath
                : "";

        if (!selectedPath) {
            return defaultRuntimeConfig;
        }

        const content = fs.readFileSync(selectedPath, "utf8");
        const parsed = JSON.parse(content);

        return {
            api: {
                baseUrl: parsed.api?.baseUrl ?? defaultRuntimeConfig.api.baseUrl,
                timeout: parsed.api?.timeout ?? defaultRuntimeConfig.api.timeout,
                key: parsed.api?.key ?? defaultRuntimeConfig.api.key,
                model: parsed.api?.model ?? defaultRuntimeConfig.api.model,
                max_tokens: parsed.api?.max_tokens ?? defaultRuntimeConfig.api.max_tokens
            },
            oauth: {
                authorizeUrl: parsed.oauth?.authorizeUrl ?? defaultRuntimeConfig.oauth.authorizeUrl,
                tokenUrl: parsed.oauth?.tokenUrl ?? defaultRuntimeConfig.oauth.tokenUrl,
                userInfoUrl: parsed.oauth?.userInfoUrl ?? defaultRuntimeConfig.oauth.userInfoUrl,
                clientId: parsed.oauth?.clientId ?? defaultRuntimeConfig.oauth.clientId,
                clientSecret: parsed.oauth?.clientSecret ?? defaultRuntimeConfig.oauth.clientSecret,
                redirectUri: parsed.oauth?.redirectUri ?? defaultRuntimeConfig.oauth.redirectUri,
                ssoCallbackPath:
                    parsed.oauth?.ssoCallbackPath ?? defaultRuntimeConfig.oauth.ssoCallbackPath
            }
        };
    } catch {
        return defaultRuntimeConfig;
    }
}

function sanitizeReturnUrl(value) {
    if (!value || typeof value !== "string") {
        return "/";
    }

    const decoded = (() => {
        try {
            return decodeURIComponent(value);
        } catch {
            return value;
        }
    })();

    if (!decoded.startsWith("/")) {
        return "/";
    }

    if (decoded.startsWith("//") || decoded.startsWith("/\\")) {
        return "/";
    }

    return decoded;
}

function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function sendHtml(res, statusCode, html) {
    setCorsHeaders(res);
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
}

function sendRedirect(res, location) {
    setCorsHeaders(res);
    res.statusCode = 302;
    res.setHeader("Location", location);
    res.end();
}

function loadTokenUsageRecords() {
    try {
        if (!fs.existsSync(tokenUsageStorePath)) {
            return [];
        }

        const raw = fs.readFileSync(tokenUsageStorePath, "utf8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveTokenUsageRecords(records) {
    fs.writeFileSync(tokenUsageStorePath, JSON.stringify(records, null, 2), "utf8");
}

function buildReportValidationError(message, statusCode = 400) {
    return {
        ok: false,
        message,
        statusCode
    };
}

function validateTokenReportPayload(payload) {
    if (!payload || typeof payload !== "object") {
        return buildReportValidationError("请求体必须为 JSON 对象");
    }

    if (typeof payload.agentId !== "string" || payload.agentId.trim().length === 0) {
        return buildReportValidationError("agentId 不能为空");
    }

    if (!Number.isInteger(payload.tokensUsed) || payload.tokensUsed <= 0) {
        return buildReportValidationError("tokensUsed 必须为正整数");
    }

    if (
        payload.inputTokens !== undefined &&
        (!Number.isInteger(payload.inputTokens) || payload.inputTokens < 0)
    ) {
        return buildReportValidationError("inputTokens 必须为非负整数");
    }

    if (
        payload.outputTokens !== undefined &&
        (!Number.isInteger(payload.outputTokens) || payload.outputTokens < 0)
    ) {
        return buildReportValidationError("outputTokens 必须为非负整数");
    }

    if (typeof payload.startedAt !== "string" || Number.isNaN(Date.parse(payload.startedAt))) {
        return buildReportValidationError("startedAt 必须为 ISO 日期字符串");
    }

    if (typeof payload.endedAt !== "string" || Number.isNaN(Date.parse(payload.endedAt))) {
        return buildReportValidationError("endedAt 必须为 ISO 日期字符串");
    }

    const startedAt = new Date(payload.startedAt);
    const endedAt = new Date(payload.endedAt);
    if (startedAt >= endedAt) {
        return buildReportValidationError("startedAt 必须早于 endedAt");
    }

    if (payload.modelName !== undefined && typeof payload.modelName !== "string") {
        return buildReportValidationError("modelName 必须为字符串");
    }

    if (payload.requestId !== undefined && typeof payload.requestId !== "string") {
        return buildReportValidationError("requestId 必须为字符串");
    }

    if (
        payload.metadata !== undefined &&
        (typeof payload.metadata !== "object" || payload.metadata === null || Array.isArray(payload.metadata))
    ) {
        return buildReportValidationError("metadata 必须为 JSON 对象");
    }

    return {
        ok: true,
        data: {
            agentId: payload.agentId.trim(),
            tokensUsed: payload.tokensUsed,
            inputTokens: payload.inputTokens,
            outputTokens: payload.outputTokens,
            startedAt: startedAt.toISOString(),
            endedAt: endedAt.toISOString(),
            modelName: payload.modelName,
            requestId: payload.requestId,
            metadata: payload.metadata
        }
    };
}

async function exchangeAgentpitToken(code, config) {
    const form = new URLSearchParams();
    form.set("grant_type", "authorization_code");
    form.set("code", code);
    form.set("client_id", config.oauth.clientId);
    form.set("client_secret", config.oauth.clientSecret);
    form.set("redirect_uri", config.oauth.redirectUri);

    const response = await fetch(config.oauth.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: form.toString()
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`token 交换失败：${response.status} ${detail}`);
    }

    const payload = await response.json();
    const accessToken = payload.access_token ?? payload.token ?? payload.id_token;
    if (!accessToken) {
        throw new Error("token 响应缺少 access_token");
    }

    return {
        accessToken,
        payload
    };
}

async function fetchAgentpitUserInfo(accessToken, config) {
    const response = await fetch(config.oauth.userInfoUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`userinfo 获取失败：${response.status} ${detail}`);
    }

    const payload = await response.json();
    return payload;
}

async function readJsonBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    if (chunks.length === 0) {
        return {};
    }

    const raw = Buffer.concat(chunks).toString("utf8");
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function setCommonHeaders(res) {
    setCorsHeaders(res);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
}

function sendJson(res, statusCode, payload) {
    setCommonHeaders(res);
    res.statusCode = statusCode;
    res.end(JSON.stringify(payload));
}

function extractTextFromChoice(choice) {
    if (!choice || typeof choice !== "object") {
        return "";
    }

    const content = choice?.message?.content;

    if (typeof content === "string") {
        return content;
    }

    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }

                if (item && typeof item === "object" && "text" in item) {
                    return String(item.text ?? "");
                }

                return "";
            })
            .join("\n")
            .trim();
    }

    return "";
}

function buildMessages(payload) {
    if (!payload || typeof payload !== "object") {
        return [{ role: "user", content: "请介绍魔镜项目的核心功能。" }];
    }

    if (Array.isArray(payload.messages) && payload.messages.length > 0) {
        return payload.messages.map((item) => ({
            role: item.role === "assistant" || item.role === "system" ? item.role : "user",
            content: typeof item.content === "string" ? item.content : JSON.stringify(item.content ?? "")
        }));
    }

    const textCandidate = [payload.input, payload.prompt, payload.query].find(
        (value) => typeof value === "string"
    );

    const messages = [
        {
            role: "system",
            content:
                typeof payload.system === "string"
                    ? payload.system
                    : "你是魔镜项目的智能体，负责输出可解释、可追溯、分级概率化的风险建议。"
        }
    ];

    messages.push({
        role: "user",
        content: textCandidate ?? "请根据当前项目能力给出一份侵权风险预警说明。"
    });

    return messages;
}

async function checkOllamaHealth(config) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), Math.min(config.api.timeout, 3000));

    try {
        const response = await fetch(`${config.api.baseUrl}/models`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${config.api.key}`
            },
            signal: controller.signal
        });

        if (!response.ok) {
            return {
                ok: false,
                message: `Ollama 响应异常：${response.status}`,
                model: config.api.model,
                timestamp: new Date().toISOString()
            };
        }

        return {
            ok: true,
            message: "Ollama 连接正常",
            model: config.api.model,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            ok: false,
            message: `无法连接 Ollama：${error instanceof Error ? error.message : "unknown"}`,
            model: config.api.model,
            timestamp: new Date().toISOString()
        };
    } finally {
        clearTimeout(timeoutId);
    }
}

function buildOpenApiSpec() {
    return {
        openapi: "3.1.0",
        info: {
            title: "Magic Mirror Agent Endpoint",
            version: "1.0.0",
            description: "AgentPit 对接的本地 Agent 接口，后端桥接到 Ollama。"
        },
        servers: [
            {
                url: "https://law.babelbeast.com"
            }
        ],
        paths: {
            "/agent": {
                post: {
                    summary: "调用智能体",
                    description: "接受消息输入并返回智能体回复。",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        input: { type: "string" },
                                        prompt: { type: "string" },
                                        query: { type: "string" },
                                        system: { type: "string" },
                                        messages: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    role: { type: "string" },
                                                    content: {}
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "调用成功"
                        }
                    }
                }
            },
            "/agent/health": {
                get: {
                    summary: "健康检查",
                    responses: {
                        "200": {
                            description: "服务状态"
                        }
                    }
                }
            },
            "/api/auth/agentpit/sso": {
                get: {
                    summary: "AgentPit SSO 入口",
                    description: "将 returnUrl 编码到 state 并 302 跳转 AgentPit 授权页",
                    parameters: [
                        {
                            name: "returnUrl",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string",
                                default: "/"
                            }
                        }
                    ],
                    responses: {
                        "302": {
                            description: "跳转到 AgentPit OAuth 授权端"
                        }
                    }
                }
            },
            "/api/auth/agentpit/callback": {
                get: {
                    summary: "AgentPit OAuth 回调",
                    description: "根据 code 交换 token，SSO 模式下跳转前端回调页",
                    parameters: [
                        {
                            name: "code",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            }
                        },
                        {
                            name: "state",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string"
                            }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "回调处理结果"
                        }
                    }
                }
            },
            "/api/v1/tokens/report": {
                get: {
                    summary: "查询最近 Token 上报记录",
                    description: "返回按创建时间倒序的最近上报记录",
                    parameters: [
                        {
                            name: "limit",
                            in: "query",
                            required: false,
                            schema: {
                                type: "integer",
                                default: 20,
                                minimum: 1,
                                maximum: 100
                            }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "查询成功"
                        }
                    }
                },
                post: {
                    summary: "Token 消耗上报",
                    description: "使用 ApiKey Bearer Token 上报调用 token 消耗",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["agentId", "tokensUsed", "startedAt", "endedAt"],
                                    properties: {
                                        agentId: {
                                            type: "string"
                                        },
                                        tokensUsed: {
                                            type: "integer"
                                        },
                                        inputTokens: {
                                            type: "integer"
                                        },
                                        outputTokens: {
                                            type: "integer"
                                        },
                                        startedAt: {
                                            type: "string",
                                            format: "date-time"
                                        },
                                        endedAt: {
                                            type: "string",
                                            format: "date-time"
                                        },
                                        modelName: {
                                            type: "string"
                                        },
                                        requestId: {
                                            type: "string"
                                        },
                                        metadata: {
                                            type: "object"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "上报成功"
                        },
                        "400": {
                            description: "参数错误"
                        },
                        "401": {
                            description: "认证失败"
                        }
                    }
                }
            }
        }
    };
}

function createAgentBridgePlugin() {
    const applyMiddleware = (serverLike) => {
        serverLike.middlewares.use(async (req, res, next) => {
            const pathname = req.url?.split("?")[0] ?? "";
            const method = req.method ?? "GET";

            const handledPaths = new Set([
                "/agent",
                "/agent/health",
                "/agent/openapi.json",
                "/api/auth/agentpit/sso",
                "/api/auth/agentpit/callback",
                "/api/v1/tokens/report"
            ]);

            if (!handledPaths.has(pathname)) {
                next();
                return;
            }

            if (method === "OPTIONS") {
                setCorsHeaders(res);
                res.statusCode = 204;
                res.end();
                return;
            }

            const config = loadRuntimeConfig();

            if (pathname === "/agent/openapi.json" && method === "GET") {
                sendJson(res, 200, buildOpenApiSpec());
                return;
            }

            if (pathname === "/api/auth/agentpit/sso" && method === "GET") {
                const parsedUrl = new URL(req.url ?? "/api/auth/agentpit/sso", "http://localhost");
                const returnUrl = sanitizeReturnUrl(parsedUrl.searchParams.get("returnUrl") ?? "/");
                const state = `sso:${returnUrl}`;

                const authorizeUrl = new URL(config.oauth.authorizeUrl);
                authorizeUrl.searchParams.set("client_id", config.oauth.clientId);
                authorizeUrl.searchParams.set("redirect_uri", config.oauth.redirectUri);
                authorizeUrl.searchParams.set("response_type", "code");
                authorizeUrl.searchParams.set("scope", "openid profile email");
                authorizeUrl.searchParams.set("state", state);

                sendRedirect(res, authorizeUrl.toString());
                return;
            }

            if (pathname === "/api/auth/agentpit/callback" && method === "GET") {
                const parsedUrl = new URL(req.url ?? "/api/auth/agentpit/callback", "http://localhost");
                const code = parsedUrl.searchParams.get("code");
                const state = parsedUrl.searchParams.get("state") ?? "";
                const oauthError = parsedUrl.searchParams.get("error");

                if (oauthError) {
                    sendRedirect(res, `/agent?sso_error=${encodeURIComponent(oauthError)}`);
                    return;
                }

                if (!code) {
                    sendJson(res, 400, {
                        ok: false,
                        error: "缺少 code 参数"
                    });
                    return;
                }

                try {
                    const { accessToken } = await exchangeAgentpitToken(code, config);

                    let userInfo = {
                        id: "unknown",
                        name: "AgentPit User"
                    };

                    try {
                        userInfo = await fetchAgentpitUserInfo(accessToken, config);
                    } catch {
                        // Userinfo 失败时仍允许继续完成 SSO，避免阻断授权链路。
                    }

                    if (state.startsWith("sso:")) {
                        const returnUrl = sanitizeReturnUrl(state.slice(4));
                        const encodedUser = encodeURIComponent(JSON.stringify(userInfo));
                        const targetPath = `${config.oauth.ssoCallbackPath}?returnUrl=${encodeURIComponent(
                            returnUrl
                        )}#token=${encodeURIComponent(accessToken)}&user=${encodedUser}`;

                        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>AgentPit SSO</title></head><body><script>window.location.replace(${JSON.stringify(
                            targetPath
                        )});</script></body></html>`;
                        sendHtml(res, 200, html);
                        return;
                    }

                    const popupPayload = {
                        ok: true,
                        token: accessToken,
                        user: userInfo
                    };
                    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>AgentPit OAuth</title></head><body><script>
const payload = ${JSON.stringify(popupPayload)};
if (window.opener) {
  window.opener.postMessage({ type: "agentpit_oauth", payload }, window.location.origin);
  window.close();
} else {
  window.location.replace('/auth/callback');
}
</script><p>授权成功，正在返回...</p></body></html>`;
                    sendHtml(res, 200, html);
                    return;
                } catch (error) {
                    sendJson(res, 502, {
                        ok: false,
                        error: "OAuth 回调处理失败",
                        detail: error instanceof Error ? error.message : "unknown"
                    });
                    return;
                }
            }

            if (pathname === "/api/v1/tokens/report" && method === "GET") {
                const parsedUrl = new URL(req.url ?? "/api/v1/tokens/report", "http://localhost");
                const limitRaw = parsedUrl.searchParams.get("limit") ?? "20";
                const parsedLimit = Number.parseInt(limitRaw, 10);
                const limit = Number.isNaN(parsedLimit)
                    ? 20
                    : Math.max(1, Math.min(parsedLimit, 100));

                const records = loadTokenUsageRecords();
                const recent = [...records].reverse().slice(0, limit);

                sendJson(res, 200, {
                    success: true,
                    data: {
                        total: records.length,
                        items: recent
                    }
                });
                return;
            }

            if (pathname === "/api/v1/tokens/report" && method === "POST") {
                const authHeader = req.headers.authorization ?? "";
                if (!authHeader.startsWith("Bearer ")) {
                    sendJson(res, 401, {
                        success: false,
                        error: "缺少认证信息"
                    });
                    return;
                }

                const apiKey = authHeader.slice(7).trim();
                if (!apiKey.startsWith("agp_")) {
                    sendJson(res, 401, {
                        success: false,
                        error: "无效的 API Key 格式"
                    });
                    return;
                }

                const payload = await readJsonBody(req);
                const validation = validateTokenReportPayload(payload);
                if (!validation.ok) {
                    sendJson(res, validation.statusCode, {
                        success: false,
                        error: validation.message
                    });
                    return;
                }

                try {
                    const records = loadTokenUsageRecords();
                    const record = {
                        id: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        apiKeyPrefix: `${apiKey.slice(0, 8)}***`,
                        ...validation.data,
                        createdAt: new Date().toISOString()
                    };
                    records.push(record);
                    saveTokenUsageRecords(records);

                    sendJson(res, 200, {
                        success: true,
                        data: {
                            id: record.id,
                            agentId: record.agentId,
                            tokensUsed: record.tokensUsed,
                            startedAt: record.startedAt,
                            endedAt: record.endedAt,
                            createdAt: record.createdAt
                        }
                    });
                    return;
                } catch (error) {
                    sendJson(res, 500, {
                        success: false,
                        error: "写入 token 上报记录失败",
                        detail: error instanceof Error ? error.message : "unknown"
                    });
                    return;
                }
            }

            if (pathname === "/api/v1/tokens/report") {
                sendJson(res, 405, {
                    success: false,
                    error: "Method Not Allowed"
                });
                return;
            }

            if (pathname === "/agent/health" && method === "GET") {
                const health = await checkOllamaHealth(config);
                sendJson(res, 200, health);
                return;
            }

            if (pathname === "/agent" && method === "POST") {
                try {
                    const payload = await readJsonBody(req);
                    const messages = buildMessages(payload);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

                    const response = await fetch(`${config.api.baseUrl}/chat/completions`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${config.api.key}`
                        },
                        body: JSON.stringify({
                            model: config.api.model,
                            messages,
                            stream: false,
                            max_tokens: config.api.max_tokens
                        }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const text = await response.text();
                        sendJson(res, response.status, {
                            ok: false,
                            error: "模型调用失败",
                            detail: text
                        });
                        return;
                    }

                    const result = await response.json();
                    const output = extractTextFromChoice(result.choices?.[0]);

                    sendJson(res, 200, {
                        ok: true,
                        id: result.id ?? `agent-${Date.now()}`,
                        model: result.model ?? config.api.model,
                        output,
                        usage: result.usage ?? null
                    });
                    return;
                } catch (error) {
                    sendJson(res, 500, {
                        ok: false,
                        error: "Agent 网关异常",
                        detail: error instanceof Error ? error.message : "unknown"
                    });
                    return;
                }
            }

            sendJson(res, 405, {
                ok: false,
                error: "Method Not Allowed"
            });
        });
    };

    return {
        name: "agent-bridge-plugin",
        configureServer(server) {
            applyMiddleware(server);
        },
        configurePreviewServer(server) {
            applyMiddleware(server);
        }
    };
}

export default defineConfig({
    plugins: [react(), createAgentBridgePlugin()],
    server: {
        port: 5174,
        host: "0.0.0.0",
        allowedHosts: ["law.babelbeast.com"]
    },
    preview: {
        port: 5174,
        host: "0.0.0.0"
    }
});
