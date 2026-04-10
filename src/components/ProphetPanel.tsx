import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { ProphetCase, RiskColor } from "../types";

interface ProphetPanelProps {
  cases: ProphetCase[];
  selectedCase: ProphetCase;
  isSelectedCaseWatched: boolean;
  onSelectCase: (caseId: string) => void;
  onAddToWatchlist: () => void;
  onGoMonitor: () => void;
}

const riskTheme: Record<
  RiskColor,
  {
    label: string;
    chipColor: "error" | "warning" | "success";
    panelBg: string;
    border: string;
  }
> = {
  red: {
    label: "红色 / 高危",
    chipColor: "error",
    panelBg: "#fff1f1",
    border: "#f5c4c4",
  },
  orange: {
    label: "橙色 / 中危",
    chipColor: "warning",
    panelBg: "#fff5e7",
    border: "#f5d2a6",
  },
  yellow: {
    label: "黄色 / 低危",
    chipColor: "warning",
    panelBg: "#fffde8",
    border: "#f1e2a3",
  },
  green: {
    label: "绿色 / 安全",
    chipColor: "success",
    panelBg: "#eef9f0",
    border: "#b8e0c0",
  },
};

export function ProphetPanel({
  cases,
  selectedCase,
  isSelectedCaseWatched,
  onSelectCase,
  onAddToWatchlist,
  onGoMonitor,
}: ProphetPanelProps) {
  const riskView = riskTheme[selectedCase.riskColor];
  const confidenceValue = Math.round(selectedCase.confidence * 100);
  // Reveal details in three steps: risk -> legal basis -> precedents and action.
  const [detailStage, setDetailStage] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    setDetailStage(1);
  }, [selectedCase.id]);

  return (
    <Grid container spacing={2.5} className="fade-up stagger-1">
      <Grid item xs={12} md={4.5}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              创意案例池
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              切换案例，查看不同风险等级和解释结果。
            </Typography>
            <List disablePadding>
              {cases.map((item) => {
                const active = item.id === selectedCase.id;
                return (
                  <ListItemButton
                    key={item.id}
                    onClick={() => onSelectCase(item.id)}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      border: active ? "1px solid" : "1px solid transparent",
                      borderColor: active ? "primary.main" : "transparent",
                      bgcolor: active ? "rgba(11,79,108,0.08)" : "transparent",
                    }}
                  >
                    <ListItemText
                      primary={item.title}
                      secondary={`${item.materialType} | 置信度 ${Math.round(item.confidence * 100)}%`}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={7.5}>
        <Card sx={{ bgcolor: riskView.panelBg, borderColor: riskView.border }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">评估结果</Typography>
              <Chip label={riskView.label} color={riskView.chipColor} />
            </Stack>

            <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
              {selectedCase.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {selectedCase.description}
            </Typography>

            <Box mb={2.5}>
              <Stack direction="row" justifyContent="space-between" mb={0.75}>
                <Typography variant="body2">风险置信度</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {confidenceValue}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={confidenceValue}
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={2}>
              <Button
                size="small"
                variant={detailStage >= 2 ? "outlined" : "contained"}
                onClick={() => setDetailStage(2)}
                disabled={detailStage >= 2}
              >
                显示法律依据
              </Button>
              <Button
                size="small"
                color="secondary"
                variant={detailStage >= 3 ? "outlined" : "contained"}
                onClick={() => setDetailStage(3)}
                disabled={detailStage < 2 || detailStage >= 3}
              >
                显示判例与动作
              </Button>
            </Stack>

            {detailStage === 1 && (
              <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                已完成风险检测，请点击“显示法律依据”继续查看。
              </Alert>
            )}

            {detailStage >= 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" mb={1}>
                    法律依据摘要
                  </Typography>
                  <Stack spacing={1}>
                    {selectedCase.legalBasis.map((item) => (
                      <Chip
                        key={item}
                        icon={<GavelOutlinedIcon />}
                        label={item}
                        variant="outlined"
                        sx={{
                          justifyContent: "flex-start",
                          height: "auto",
                          py: 0.5,
                        }}
                      />
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" mb={1}>
                    参考判例
                  </Typography>
                  {detailStage >= 3 ? (
                    <Stack spacing={1}>
                      {selectedCase.precedents.map((item) => (
                        <Chip
                          key={item}
                          icon={<TrendingUpIcon />}
                          label={item}
                          variant="outlined"
                          sx={{
                            justifyContent: "flex-start",
                            height: "auto",
                            py: 0.5,
                          }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info" variant="outlined">
                      已展示法律依据，请点击“显示判例与动作”继续。
                    </Alert>
                  )}
                </Grid>
              </Grid>
            )}

            {detailStage >= 3 && <Divider sx={{ my: 2.5 }} />}

            {detailStage >= 3 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.5}
              >
                <Box>
                  <Typography variant="subtitle2">建议动作</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCase.recommendation}
                  </Typography>
                </Box>
                {isSelectedCaseWatched ? (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircleOutlineIcon />}
                      disabled
                    >
                      已加入监控
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<VisibilityIcon />}
                      onClick={onGoMonitor}
                    >
                      前往鹰眼查看
                    </Button>
                  </Stack>
                ) : (
                  <Button variant="contained" onClick={onAddToWatchlist}>
                    加入鹰眼监控
                  </Button>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
