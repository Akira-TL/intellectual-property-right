import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
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
import { ProphetCase, RiskColor } from "../types";

interface ProphetPanelProps {
  cases: ProphetCase[];
  selectedCase: ProphetCase;
  onSelectCase: (caseId: string) => void;
  onAddToWatchlist: () => void;
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
  onSelectCase,
  onAddToWatchlist,
}: ProphetPanelProps) {
  const riskView = riskTheme[selectedCase.riskColor];
  const confidenceValue = Math.round(selectedCase.confidence * 100);

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
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />

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
              <Button variant="contained" onClick={onAddToWatchlist}>
                加入鹰眼监控
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
