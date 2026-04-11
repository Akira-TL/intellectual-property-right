import CloudSyncIcon from "@mui/icons-material/CloudSync";
import LinkIcon from "@mui/icons-material/Link";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { AgentHealthStatus, AgentIntegrationConfig } from "../types";
import {
  type AgentpitSession,
  buildSsoEntryUrl,
  clearAgentpitSession,
  markSsoAttempted,
  readAgentpitSession,
  shouldAutoSso,
} from "../utils/ssoHelper";

interface AgentIntegrationPanelProps {
  config: AgentIntegrationConfig;
}

interface TokenReportItem {
  id: string;
  agentId: string;
  tokensUsed: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  apiKeyPrefix?: string;
}

export function AgentIntegrationPanel({ config }: AgentIntegrationPanelProps) {
  const [health, setHealth] = useState<AgentHealthStatus | null>(null);
  const [agentReply, setAgentReply] = useState<string>("");
  const [reportFeedback, setReportFeedback] = useState<string>("");
  const [reportHistory, setReportHistory] = useState<TokenReportItem[]>([]);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingReportHistory, setLoadingReportHistory] = useState(false);
  const [authSession, setAuthSession] = useState<AgentpitSession | null>(() =>
    readAgentpitSession(),
  );

  const ssoError = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sso_error");
  }, []);

  useEffect(() => {
    if (authSession?.token) {
      return;
    }

    if (!shouldAutoSso()) {
      return;
    }

    markSsoAttempted();
    window.location.href = buildSsoEntryUrl();
  }, [authSession?.token]);

  const handleSsoLogin = () => {
    markSsoAttempted();
    window.location.href = buildSsoEntryUrl();
  };

  const handleClearSession = () => {
    clearAgentpitSession();
    setAuthSession(null);
  };

  const testHealth = async () => {
    setLoadingHealth(true);
    try {
      const response = await fetch("/agent/health", {
        method: "GET",
      });
      const data = (await response.json()) as AgentHealthStatus;
      setHealth(data);
    } catch (error) {
      setHealth({
        ok: false,
        message: `健康检查失败：${error instanceof Error ? error.message : "unknown"}`,
      });
    } finally {
      setLoadingHealth(false);
    }
  };

  const askAgent = async () => {
    setLoadingAsk(true);
    try {
      const response = await fetch("/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input:
            "请用 3 句话介绍魔镜项目的核心价值，并给出红橙黄绿风险输出约束。",
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        output?: string;
        detail?: string;
      };
      if (!response.ok || !data.ok) {
        setAgentReply(`调用失败：${data.detail ?? "unknown"}`);
        return;
      }

      setAgentReply(data.output ?? "模型返回为空");
    } catch (error) {
      setAgentReply(
        `调用异常：${error instanceof Error ? error.message : "unknown"}`,
      );
    } finally {
      setLoadingAsk(false);
    }
  };

  const fetchReportHistory = async () => {
    setLoadingReportHistory(true);
    try {
      const response = await fetch("/api/v1/tokens/report?limit=6", {
        method: "GET",
      });
      const data = (await response.json()) as {
        success?: boolean;
        data?: { items?: TokenReportItem[] };
      };

      if (!response.ok || !data.success) {
        setReportFeedback("读取上报记录失败");
        return;
      }

      setReportHistory(data.data?.items ?? []);
    } catch (error) {
      setReportFeedback(
        `读取上报记录异常：${error instanceof Error ? error.message : "unknown"}`,
      );
    } finally {
      setLoadingReportHistory(false);
    }
  };

  const reportTokenUsage = async () => {
    setLoadingReport(true);
    const now = new Date();
    const startedAt = new Date(now.getTime() - 4200).toISOString();
    const endedAt = now.toISOString();

    try {
      const response = await fetch("/api/v1/tokens/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer agp_demo_key",
        },
        body: JSON.stringify({
          agentId: "agent_demo_001",
          tokensUsed: 1532,
          inputTokens: 1014,
          outputTokens: 518,
          startedAt,
          endedAt,
          modelName: config.modelName,
          requestId: `req_${Date.now()}`,
          metadata: {
            scene: "agentpit-panel",
            channel: "manual",
          },
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        data?: TokenReportItem;
        error?: string;
      };

      if (!response.ok || !data.success) {
        setReportFeedback(`上报失败：${data.error ?? "unknown"}`);
        return;
      }

      setReportFeedback(`上报成功：记录 ${data.data?.id ?? "unknown"}`);
      await fetchReportHistory();
    } catch (error) {
      setReportFeedback(
        `上报异常：${error instanceof Error ? error.message : "unknown"}`,
      );
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    void fetchReportHistory();
  }, []);

  return (
    <Paper
      className="fade-up"
      sx={{ p: { xs: 2, md: 2.4 }, borderRadius: 2.5, mb: 2.5 }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1.2}>
        <SmartToyIcon color="primary" />
        <Typography variant="h6">AgentPit 接入配置</Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        下面字段可直接用于 AgentPit 技术配置页面，已对齐本地 Ollama 网关与 HTTPS
        域名。
      </Typography>

      {ssoError && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          自动授权未完成（{ssoError}），可点击下方“agentpit 授权登陆”手动重试。
        </Alert>
      )}

      {authSession?.token && (
        <Alert severity="success" sx={{ mb: 1.5 }}>
          已完成 AgentPit 授权登录
          {authSession.user?.email && `（${String(authSession.user.email)}）`}
        </Alert>
      )}

      <Grid container spacing={1.2} mb={1.8}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                API Endpoint URL（必填）
              </Typography>
              <Chip
                icon={<LinkIcon />}
                label={config.endpointUrl}
                color="primary"
                variant="outlined"
                sx={{ maxWidth: "100%" }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Product Web UI URL（推荐）
              </Typography>
              <Chip
                icon={<CloudSyncIcon />}
                label={config.webUiUrl}
                color="secondary"
                variant="outlined"
                sx={{ maxWidth: "100%" }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.8}
              >
                OAuth 回调地址：{config.oauthCallbackUrl}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={1.2} mb={1.8}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              border: "1px solid rgba(11,79,108,0.14)",
              bgcolor: "rgba(11,79,108,0.03)",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              OAuth2 端点
            </Typography>
            <Typography variant="body2" color="text.secondary">
              authorize: {config.oauthAuthorizeUrl}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              token: {config.oauthTokenUrl}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              userinfo: {config.oauthUserInfoUrl}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              前端回调页: {config.ssoCallbackPath}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              token 上报: {config.tokenReportPath}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              border: "1px solid rgba(11,79,108,0.14)",
              bgcolor: "rgba(11,79,108,0.03)",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              OAuth2 凭证
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Client ID：{config.oauthClientId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Client Secret：{config.oauthClientSecret}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={1.2} mb={1.8}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              border: "1px solid rgba(11,79,108,0.14)",
              bgcolor: "rgba(11,79,108,0.03)",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              SKILL.md 路径
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.skillPath}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              border: "1px solid rgba(11,79,108,0.14)",
              bgcolor: "rgba(11,79,108,0.03)",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              OpenAPI Spec 路径
            </Typography>
            <Typography variant="body2" color="text.secondary">
              本地文件：agentpit/openapi.yaml
            </Typography>
            <Typography variant="body2" color="text.secondary">
              在线地址：{config.openApiPath}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box
        sx={{
          p: 1.2,
          borderRadius: 2,
          border: "1px solid rgba(237,108,2,0.25)",
          bgcolor: "rgba(237,108,2,0.07)",
          mb: 1.8,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          本地模型配置
        </Typography>
        <Typography variant="body2">baseUrl: {config.modelBaseUrl}</Typography>
        <Typography variant="body2">model: {config.modelName}</Typography>
        <Typography variant="body2">timeout: {config.timeoutMs}ms</Typography>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} mb={1.2}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LoginRoundedIcon />}
          onClick={handleSsoLogin}
        >
          agentpit 授权登陆
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<PowerSettingsNewRoundedIcon />}
          onClick={handleClearSession}
          disabled={!authSession?.token}
        >
          清除授权缓存
        </Button>
        <Button
          variant="outlined"
          startIcon={<MedicalServicesIcon />}
          onClick={testHealth}
          disabled={loadingHealth}
        >
          {loadingHealth ? "健康检查中..." : "测试 /agent/health"}
        </Button>
        <Button
          variant="contained"
          startIcon={<SmartToyIcon />}
          onClick={askAgent}
          disabled={loadingAsk}
        >
          {loadingAsk ? "调用中..." : "测试 /agent 回复"}
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={reportTokenUsage}
          disabled={loadingReport}
        >
          {loadingReport ? "上报中..." : "模拟上报 token 消耗"}
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={fetchReportHistory}
          disabled={loadingReportHistory}
        >
          {loadingReportHistory ? "读取中..." : "查看最近上报记录"}
        </Button>
      </Stack>

      {health && (
        <Alert severity={health.ok ? "success" : "warning"} sx={{ mb: 1.2 }}>
          {health.message}
        </Alert>
      )}

      {agentReply && (
        <Box
          sx={{
            border: "1px solid rgba(11,79,108,0.16)",
            borderRadius: 2,
            p: 1.2,
            bgcolor: "rgba(11,79,108,0.03)",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
            Agent 返回示例
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {agentReply}
          </Typography>
        </Box>
      )}

      {reportFeedback && (
        <Alert
          severity={reportFeedback.startsWith("上报成功") ? "success" : "info"}
          sx={{ mt: 1.2 }}
        >
          {reportFeedback}
        </Alert>
      )}

      {reportHistory.length > 0 && (
        <Box
          sx={{
            border: "1px solid rgba(11,79,108,0.16)",
            borderRadius: 2,
            p: 1.2,
            bgcolor: "rgba(11,79,108,0.03)",
            mt: 1.2,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
            最近 token 上报记录
          </Typography>
          <Stack spacing={0.8}>
            {reportHistory.map((item) => (
              <Box
                key={item.id}
                sx={{
                  p: 1,
                  borderRadius: 1.6,
                  border: "1px solid rgba(11,79,108,0.14)",
                  bgcolor: "rgba(255,255,255,0.78)",
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  {item.id}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  agent: {item.agentId} | tokens: {item.tokensUsed}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  createdAt: {item.createdAt}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
