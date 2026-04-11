// AGENTPIT-INJECTED v1
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ok = (data: unknown) => NextResponse.json({ success: true, data });
const err = (message: string, status = 400) =>
  NextResponse.json({ success: false, error: message }, { status });

const reportSchema = z.object({
  agentId: z.string().min(1, "agentId 不能为空"),
  tokensUsed: z.number().int().positive("tokensUsed 必须为正整数"),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  startedAt: z.string().datetime({ message: "startedAt 必须为 ISO 日期格式" }),
  endedAt: z.string().datetime({ message: "endedAt 必须为 ISO 日期格式" }),
  modelName: z.string().optional(),
  requestId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return err("缺少认证信息", 401);
  }

  const apiKeyValue = authHeader.slice(7);
  const apiKey = await prisma.apiKey.findUnique({
    where: { key: apiKeyValue },
    include: { application: true, user: true },
  });

  if (!apiKey) {
    return err("无效的 API Key", 401);
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return err("API Key 已过期", 401);
  }

  if (apiKey.application.status !== "ACTIVE") {
    return err("应用已被禁用", 403);
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  try {
    const body = await request.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return err(parsed.error.errors[0].message);
    }

    const {
      agentId,
      tokensUsed,
      inputTokens,
      outputTokens,
      startedAt,
      endedAt,
      modelName,
      requestId,
      metadata,
    } = parsed.data;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return err("Agent 不存在", 404);
    }

    if (agent.userId !== apiKey.userId) {
      return err("无权上报该 Agent 的 token 消耗", 403);
    }

    const start = new Date(startedAt);
    const end = new Date(endedAt);
    if (start >= end) {
      return err("startedAt 必须早于 endedAt");
    }

    const tokenUsage = await prisma.tokenUsage.create({
      data: {
        agentId,
        applicationId: apiKey.applicationId,
        userId: apiKey.userId,
        tokensUsed,
        inputTokens,
        outputTokens,
        startedAt: start,
        endedAt: end,
        modelName,
        requestId,
        metadata,
      },
    });

    return ok({
      id: tokenUsage.id,
      agentId: tokenUsage.agentId,
      tokensUsed: tokenUsage.tokensUsed,
      startedAt: tokenUsage.startedAt,
      endedAt: tokenUsage.endedAt,
      createdAt: tokenUsage.createdAt,
    });
  } catch (error) {
    console.error("[tokens/report] POST error:", error);
    return err("服务器错误", 500);
  }
}
