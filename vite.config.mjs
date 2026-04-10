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

const defaultRuntimeConfig = {
    api: {
        baseUrl: "http://localhost:11434/v1",
        timeout: 5000,
        key: "ollama",
        model: "qwen3.5:4b",
        max_tokens: 10240
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
            }
        };
    } catch {
        return defaultRuntimeConfig;
    }
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
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
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
            }
        }
    };
}

function createAgentBridgePlugin() {
    const applyMiddleware = (serverLike) => {
        serverLike.middlewares.use(async (req, res, next) => {
            const pathname = req.url?.split("?")[0] ?? "";
            const method = req.method ?? "GET";

            if (pathname !== "/agent" && pathname !== "/agent/health" && pathname !== "/agent/openapi.json") {
                next();
                return;
            }

            if (method === "OPTIONS") {
                setCommonHeaders(res);
                res.statusCode = 204;
                res.end();
                return;
            }

            const config = loadRuntimeConfig();

            if (pathname === "/agent/openapi.json" && method === "GET") {
                sendJson(res, 200, buildOpenApiSpec());
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
