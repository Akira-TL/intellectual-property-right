import CloudSyncIcon from "@mui/icons-material/CloudSync";
import LinkIcon from "@mui/icons-material/Link";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
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
import { useState } from "react";
import { AgentHealthStatus, AgentIntegrationConfig } from "../types";

interface AgentIntegrationPanelProps {
  config: AgentIntegrationConfig;
}

export function AgentIntegrationPanel({ config }: AgentIntegrationPanelProps) {
  const [health, setHealth] = useState<AgentHealthStatus | null>(null);
  const [agentReply, setAgentReply] = useState<string>("");
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);

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

  return (
    <Paper
      className="fade-up"
      sx={{ p: { xs: 2, md: 2.4 }, borderRadius: 4, mb: 2.5 }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1.2}>
        <SmartToyIcon color="primary" />
        <Typography variant="h6">AgentPit 接入配置</Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        下面字段可直接用于 AgentPit 技术配置页面，已对齐本地 Ollama 网关与 HTTPS
        域名。
      </Typography>

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
    </Paper>
  );
}
