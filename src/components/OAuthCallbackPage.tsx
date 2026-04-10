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

export function OAuthCallbackPage() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");

  const isSuccess = Boolean(code) && !error;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="sm">
        <Card>
          <CardContent>
            <Stack spacing={1.5} alignItems="flex-start">
              {isSuccess ? (
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 34 }} />
              ) : (
                <ErrorOutlineIcon color="warning" sx={{ fontSize: 34 }} />
              )}

              <Typography variant="h5" fontWeight={700}>
                AgentPit OAuth 回调页
              </Typography>

              {isSuccess ? (
                <Typography variant="body1">
                  授权码已接收。你可以把 code/state 发送到服务端进行 Token
                  交换。
                </Typography>
              ) : (
                <Typography variant="body1">
                  未检测到授权成功参数，请检查回调配置或重试授权。
                </Typography>
              )}

              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  border: "1px solid rgba(11,79,108,0.16)",
                  width: "100%",
                  bgcolor: "rgba(11,79,108,0.03)",
                }}
              >
                <Typography variant="body2">
                  <strong>code:</strong> {code ?? "无"}
                </Typography>
                <Typography variant="body2">
                  <strong>state:</strong> {state ?? "无"}
                </Typography>
                <Typography variant="body2">
                  <strong>error:</strong> {error ?? "无"}
                </Typography>
              </Box>

              <Button variant="contained" href="/">
                返回首页
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
