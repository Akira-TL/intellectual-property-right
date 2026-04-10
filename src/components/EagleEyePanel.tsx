import RadarIcon from "@mui/icons-material/Radar";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { MonitoringEvent, WatchTarget } from "../types";

interface EagleEyePanelProps {
  watchTargets: WatchTarget[];
  events: MonitoringEvent[];
  onSimulateAlert: () => void;
  onAdvanceEventStatus: (eventId: string) => void;
}

const statusActionMap: Record<
  MonitoringEvent["status"],
  { label: string; nextHint: string; disabled: boolean }
> = {
  待复核: {
    label: "标记为处理中",
    nextHint: "进入人工复核与证据比对",
    disabled: false,
  },
  处理中: {
    label: "标记为已固证",
    nextHint: "完成证据包整理并准备投诉",
    disabled: false,
  },
  已固证: {
    label: "流程已完成",
    nextHint: "可进入法官助手继续策略评估",
    disabled: true,
  },
};

export function EagleEyePanel({
  watchTargets,
  events,
  onSimulateAlert,
  onAdvanceEventStatus,
}: EagleEyePanelProps) {
  return (
    <Grid container spacing={2.5} className="fade-up stagger-2">
      <Grid item xs={12} md={4.5}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <RadarIcon color="primary" />
              <Typography variant="h6">监控目标</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={2}>
              已加入自动巡检的品牌素材与热点创意。
            </Typography>

            <Stack spacing={1.2}>
              {watchTargets.map((target) => (
                <Box
                  key={target.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid rgba(11,79,108,0.14)",
                    bgcolor: "rgba(11,79,108,0.03)",
                  }}
                >
                  <Typography fontWeight={700}>{target.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {target.type} | 最近巡检：{target.lastScan}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={onSimulateAlert}
            >
              模拟触发告警
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={7.5}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <WarningAmberRoundedIcon color="warning" />
              <Typography variant="h6">告警时间线</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={2}>
              告警出现后可直接进入固证流程，减少维权窗口损失。
            </Typography>

            <Stack spacing={1.2}>
              {events.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid rgba(239,108,0,0.24)",
                    bgcolor: "rgba(239,108,0,0.05)",
                  }}
                >
                  {(() => {
                    const action = statusActionMap[event.status];
                    return (
                      <>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          spacing={1}
                        >
                          <Typography fontWeight={700}>
                            {event.linkTitle}
                          </Typography>
                          <Chip
                            size="small"
                            label={event.status}
                            color={
                              event.status === "已固证" ? "success" : "warning"
                            }
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={0.5}
                        >
                          {event.time} | {event.platform}
                        </Typography>
                        <Typography variant="body2" mt={0.6}>
                          {event.riskHint}
                        </Typography>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={0.9}
                          mt={1.2}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {action.nextHint}
                          </Typography>
                          <Button
                            size="small"
                            variant={action.disabled ? "outlined" : "contained"}
                            color={
                              event.status === "处理中" ? "warning" : "primary"
                            }
                            disabled={action.disabled}
                            onClick={() => onAdvanceEventStatus(event.id)}
                          >
                            {action.label}
                          </Button>
                        </Stack>
                      </>
                    );
                  })()}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
