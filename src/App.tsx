import BalanceIcon from "@mui/icons-material/Balance";
import GavelIcon from "@mui/icons-material/Gavel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { AgentIntegrationPanel } from "./components/AgentIntegrationPanel";
import { DemoAnalyticsPanel } from "./components/DemoAnalyticsPanel";
import { EagleEyePanel } from "./components/EagleEyePanel";
import { JudgeAssistantPanel } from "./components/JudgeAssistantPanel";
import { PitchCoachPanel } from "./components/PitchCoachPanel";
import { ProphetPanel } from "./components/ProphetPanel";
import { ShowcasePanel } from "./components/ShowcasePanel";
import {
  agentIntegrationConfig,
  demoTechStack,
  evidencePacket,
  initialMonitoringEvents,
  initialWatchTargets,
  modeNarration,
  projectHighlights,
  prophetCases,
  targetTechStack,
  strategyOptions,
} from "./data/demoData";
import { DemoMode, MonitoringEvent, WatchTarget } from "./types";

export default function App() {
  const [mode, setMode] = useState<DemoMode>("prophet");
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    prophetCases[0].id,
  );
  const [watchTargets, setWatchTargets] =
    useState<WatchTarget[]>(initialWatchTargets);
  const [events, setEvents] = useState<MonitoringEvent[]>(
    initialMonitoringEvents,
  );
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [showPitchCoach, setShowPitchCoach] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  const selectedCase = useMemo(
    () =>
      prophetCases.find((item) => item.id === selectedCaseId) ??
      prophetCases[0],
    [selectedCaseId],
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleAddToWatchlist = () => {
    const exists = watchTargets.some(
      (target) => target.name === selectedCase.title,
    );
    if (exists) {
      showToast("该案例已在鹰眼监控列表中");
      return;
    }

    const newTarget: WatchTarget = {
      id: `target-${Date.now()}`,
      name: selectedCase.title,
      type: selectedCase.materialType,
      lastScan: "刚刚",
    };

    setWatchTargets((prev) => [newTarget, ...prev]);
    showToast("已加入鹰眼监控列表");
  };

  const handleSimulateAlert = () => {
    const platforms = ["短视频平台", "社交平台", "电商平台"];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];

    const newEvent: MonitoringEvent = {
      id: `event-${Date.now()}`,
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
      platform,
      linkTitle: `${selectedCase.title} 疑似变体链接`,
      riskHint: `命中 ${selectedCase.riskColor.toUpperCase()} 风险画像特征，建议进入固证流程`,
      status: "待复核",
    };

    setEvents((prev) => [newEvent, ...prev]);
    showToast("已生成一条新的模拟告警");
  };

  const handleGenerateDocs = () => {
    showToast("文书模板已生成（演示数据）");
  };

  const handleRandomScenario = () => {
    const randomCase =
      prophetCases[Math.floor(Math.random() * prophetCases.length)];
    const modes: DemoMode[] = ["prophet", "eagleeye", "judgeassistant"];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];

    setSelectedCaseId(randomCase.id);
    setMode(randomMode);
    showToast("已随机切换到新演示场景");
  };

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    const timer = setInterval(() => {
      setSelectedCaseId((current) => {
        const index = prophetCases.findIndex((item) => item.id === current);
        const nextIndex = index >= 0 ? (index + 1) % prophetCases.length : 0;
        return prophetCases[nextIndex].id;
      });
    }, 4500);

    return () => {
      clearInterval(timer);
    };
  }, [autoPlay]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box className="bg-orb orb-left" />
      <Box className="bg-orb orb-right" />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: "rgba(9, 44, 71, 0.9)", backdropFilter: "blur(8px)" }}
      >
        <Toolbar>
          <BalanceIcon sx={{ mr: 1.2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            魔镜·品牌创意侵权风险卫士
          </Typography>
          <Chip
            icon={<WarningRoundedIcon />}
            label="Demo Only"
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "white" }}
          />
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}
      >
        <Paper
          className="fade-up"
          sx={{ p: { xs: 2.2, md: 3 }, mb: 2.5, borderRadius: 4 }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h4">
              发布前先算一卦，发布后持续有护盾
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              在同一套可解释流程中，完成创意风险预警、全网侵权监控和固证维权策略建议。
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Chip color="error" label="红色：高危" />
              <Chip color="warning" label="橙色/黄色：中低风险" />
              <Chip color="success" label="绿色：相对安全" />
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2.5} mb={2.5}>
          <Grid item xs={12} md={8}>
            <ShowcasePanel
              highlights={projectHighlights}
              targetStack={targetTechStack}
              demoStack={demoTechStack}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              className="fade-up"
              sx={{ p: 2.2, borderRadius: 4, height: "100%" }}
            >
              <Typography variant="h6" mb={0.8}>
                讲解助手开关
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                展示当前模式对应的讲解要点，方便你现场顺着页面完成叙事。
              </Typography>
              <Button
                fullWidth
                variant={showPitchCoach ? "contained" : "outlined"}
                onClick={() => setShowPitchCoach((prev) => !prev)}
              >
                {showPitchCoach ? "隐藏讲解信息" : "显示讲解信息"}
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <Collapse in={showPitchCoach}>
          <PitchCoachPanel mode={mode} note={modeNarration[mode]} />
        </Collapse>

        <AgentIntegrationPanel config={agentIntegrationConfig} />

        <DemoAnalyticsPanel
          selectedCase={selectedCase}
          watchCount={watchTargets.length}
          eventCount={events.length}
          autoPlay={autoPlay}
          onToggleAutoPlay={setAutoPlay}
          onRandomScenario={handleRandomScenario}
        />

        <Paper sx={{ mb: 2.5, borderRadius: 4, overflow: "hidden" }}>
          <Tabs
            value={mode}
            onChange={(_, value: DemoMode) => setMode(value)}
            variant="fullWidth"
            sx={{ bgcolor: "rgba(11,79,108,0.06)" }}
          >
            <Tab
              value="prophet"
              icon={<GavelIcon />}
              iconPosition="start"
              label="预言家模式"
            />
            <Tab
              value="eagleeye"
              icon={<VisibilityIcon />}
              iconPosition="start"
              label="鹰眼模式"
            />
            <Tab
              value="judgeassistant"
              icon={<BalanceIcon />}
              iconPosition="start"
              label="法官助手模式"
            />
          </Tabs>
        </Paper>

        {mode === "prophet" && (
          <ProphetPanel
            cases={prophetCases}
            selectedCase={selectedCase}
            onSelectCase={setSelectedCaseId}
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}

        {mode === "eagleeye" && (
          <EagleEyePanel
            watchTargets={watchTargets}
            events={events}
            onSimulateAlert={handleSimulateAlert}
          />
        )}

        {mode === "judgeassistant" && (
          <JudgeAssistantPanel
            evidence={evidencePacket}
            strategies={strategyOptions}
            onGenerateDocs={handleGenerateDocs}
          />
        )}
      </Container>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setToastOpen(false)}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
