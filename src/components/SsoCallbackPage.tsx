import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  clearSsoAttempted,
  sanitizeReturnUrl,
  writeAgentpitSession,
} from "../utils/ssoHelper";

type SsoState = "processing" | "success" | "error";

interface CallbackViewState {
  status: SsoState;
  message: string;
  detail?: string;
}

export function SsoCallbackPage() {
  const [viewState, setViewState] = useState<CallbackViewState>({
    status: "processing",
    message: "正在处理 AgentPit SSO 回调...",
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const returnUrl = sanitizeReturnUrl(
      searchParams.get("returnUrl") ?? "/agent",
    );

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const token = hashParams.get("token");
    const userStr = hashParams.get("user");

    // Remove hash immediately so access token is not exposed in browser history.
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );

    if (!token || !userStr) {
      const target = `/agent?sso_error=${encodeURIComponent("missing_token")}`;
      setViewState({
        status: "error",
        message: "未检测到完整授权信息，请重新发起授权登录。",
        detail: "missing_token",
      });
      window.setTimeout(() => {
        window.location.replace(target);
      }, 900);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr)) as Record<
        string,
        unknown
      >;
      writeAgentpitSession(token, user);
      clearSsoAttempted();

      setViewState({
        status: "success",
        message: "授权成功，正在返回子应用页面...",
      });

      window.setTimeout(() => {
        window.location.replace(returnUrl);
      }, 900);
    } catch {
      const target = `/agent?sso_error=${encodeURIComponent("parse_failed")}`;
      setViewState({
        status: "error",
        message: "授权数据解析失败，请重新发起授权登录。",
        detail: "parse_failed",
      });
      window.setTimeout(() => {
        window.location.replace(target);
      }, 900);
    }
  }, []);

  const isSuccess = viewState.status === "success";
  const isError = viewState.status === "error";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="sm">
        <Card>
          <CardContent>
            <Stack spacing={1.5} alignItems="flex-start">
              {isSuccess ? (
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 34 }} />
              ) : isError ? (
                <ErrorOutlineIcon color="warning" sx={{ fontSize: 34 }} />
              ) : (
                <Typography variant="h5">...</Typography>
              )}

              <Typography variant="h5" fontWeight={700}>
                AgentPit SSO 回调页
              </Typography>

              <Typography variant="body1">{viewState.message}</Typography>

              {viewState.detail && (
                <Typography variant="body2" color="text.secondary">
                  错误代码：{viewState.detail}
                </Typography>
              )}

              <Button variant="contained" href="/agent">
                返回 Agent 接入页
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
