import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { ProphetCase } from "../types";

interface DemoAnalyticsPanelProps {
  selectedCase: ProphetCase;
  watchCount: number;
  eventCount: number;
  autoPlay: boolean;
  onToggleAutoPlay: (value: boolean) => void;
  onRandomScenario: () => void;
}

const riskScoreMap: Record<ProphetCase["riskColor"], number> = {
  red: 92,
  orange: 72,
  yellow: 51,
  green: 26,
};

function capPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function DemoAnalyticsPanel({
  selectedCase,
  watchCount,
  eventCount,
  autoPlay,
  onToggleAutoPlay,
  onRandomScenario,
}: DemoAnalyticsPanelProps) {
  const riskScore = riskScoreMap[selectedCase.riskColor];
  const diffusionScore = capPercent(riskScore * 0.72 + eventCount * 6);
  const enforcementValue = capPercent(
    45 +
      eventCount * 4 +
      watchCount * 2 -
      (selectedCase.riskColor === "green" ? 12 : 0),
  );

  return (
    <Paper
      className="fade-up"
      sx={{ p: { xs: 2, md: 2.4 }, borderRadius: 2.5, mb: 2.5 }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={1.8}
        spacing={1}
      >
        <Typography variant="h6">演示数据看板</Typography>
        <Chip
          label={`当前案例：${selectedCase.title}`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      <Grid container spacing={1.5} mb={2.2}>
        <Grid item xs={12} md={4}>
          <Box
            className="kpi-card"
            sx={{
              p: 1.4,
              borderRadius: 2,
              border: "1px solid rgba(11,79,108,0.14)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={0.8}>
              <QueryStatsIcon color="error" />
              <Typography variant="subtitle2">风险热度指数</Typography>
            </Stack>
            <Typography variant="h5" fontWeight={800}>
              {riskScore}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              综合当前案例风险等级换算
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            className="kpi-card"
            sx={{
              p: 1.4,
              borderRadius: 2,
              border: "1px solid rgba(11,79,108,0.14)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={0.8}>
              <TrackChangesIcon color="secondary" />
              <Typography variant="subtitle2">扩散压力指数</Typography>
            </Stack>
            <Typography variant="h5" fontWeight={800}>
              {diffusionScore}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              由风险等级与告警数量推演
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            className="kpi-card"
            sx={{
              p: 1.4,
              borderRadius: 2,
              border: "1px solid rgba(11,79,108,0.14)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={0.8}>
              <AccessTimeIcon color="primary" />
              <Typography variant="subtitle2">处置窗口指数</Typography>
            </Stack>
            <Typography variant="h5" fontWeight={800}>
              {enforcementValue}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              用于对比快速下架和诉讼策略优先级
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Stack spacing={1.2} mb={2}>
        <Box>
          <Typography variant="body2" mb={0.4}>
            侵权风险概率
          </Typography>
          <LinearProgress
            variant="determinate"
            value={riskScore}
            color={
              selectedCase.riskColor === "red"
                ? "error"
                : selectedCase.riskColor === "green"
                  ? "success"
                  : "warning"
            }
            sx={{ height: 10, borderRadius: 99 }}
          />
        </Box>
        <Box>
          <Typography variant="body2" mb={0.4}>
            传播扩散压力
          </Typography>
          <LinearProgress
            variant="determinate"
            value={diffusionScore}
            color="warning"
            sx={{ height: 10, borderRadius: 99 }}
          />
        </Box>
        <Box>
          <Typography variant="body2" mb={0.4}>
            维权收益潜力
          </Typography>
          <LinearProgress
            variant="determinate"
            value={enforcementValue}
            color="success"
            sx={{ height: 10, borderRadius: 99 }}
          />
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Tooltip title="开启后每 4.5 秒自动切换案例，适合循环播放展示">
          <FormControlLabel
            control={
              <Switch
                checked={autoPlay}
                onChange={(event) => onToggleAutoPlay(event.target.checked)}
              />
            }
            label="自动轮播案例"
          />
        </Tooltip>

        <Button
          variant="contained"
          startIcon={<ShuffleIcon />}
          onClick={onRandomScenario}
        >
          随机切换场景
        </Button>
      </Stack>
    </Paper>
  );
}
