import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BalanceIcon from "@mui/icons-material/Balance";
import GavelIcon from "@mui/icons-material/Gavel";
import InsightsIcon from "@mui/icons-material/Insights";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import {
  Alert,
  type AlertColor,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { type ReactNode, useEffect, useMemo, useState } from "react";
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
  strategyOptions,
  targetTechStack,
} from "./data/demoData";
import { MonitoringEvent, WatchTarget } from "./types";

type WorkspacePage =
  | "overview"
  | "prophet"
  | "eagleeye"
  | "judgeassistant"
  | "agent";

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const pageMeta: Array<{
  key: WorkspacePage;
  label: string;
  desc: string;
  icon: ReactNode;
}> = [
  {
    key: "overview",
    label: "总览首页",
    desc: "查看亮点与全局数据",
    icon: <InsightsIcon fontSize="small" />,
  },
  {
    key: "prophet",
    label: "预言家模式",
    desc: "发布前风险评估",
    icon: <GavelIcon fontSize="small" />,
  },
  {
    key: "eagleeye",
    label: "鹰眼模式",
    desc: "监控告警与巡检",
    icon: <VisibilityIcon fontSize="small" />,
  },
  {
    key: "judgeassistant",
    label: "法官助手模式",
    desc: "固证与策略建议",
    icon: <BalanceIcon fontSize="small" />,
  },
  {
    key: "agent",
    label: "Agent 接入",
    desc: "平台接口联调",
    icon: <SmartToyIcon fontSize="small" />,
  },
];

const pagePathMap: Record<WorkspacePage, string> = {
  overview: "/",
  prophet: "/prophet",
  eagleeye: "/eagleeye",
  judgeassistant: "/judgeassistant",
  agent: "/agent",
};

const routeToPageMap: Record<string, WorkspacePage> = {
  "/": "overview",
  "/overview": "overview",
  "/prophet": "prophet",
  "/eagleeye": "eagleeye",
  "/judgeassistant": "judgeassistant",
  "/agent": "agent",
};

const tourSteps: Array<{
  page: WorkspacePage;
  title: string;
  talkTrack: string;
}> = [
  {
    page: "overview",
    title: "产品价值开场",
    talkTrack: "先讲业务痛点与三大模式结构，让评委快速建立全局认知。",
  },
  {
    page: "prophet",
    title: "发布前预警",
    talkTrack: "展示红橙黄绿分级、置信度和建议动作，强调不是法律结论。",
  },
  {
    page: "eagleeye",
    title: "监控与告警",
    talkTrack: "模拟告警触发并推进状态，讲清可执行的运营闭环。",
  },
  {
    page: "judgeassistant",
    title: "固证与策略",
    talkTrack: "比较策略路径并应用到执行清单，突出可落地性。",
  },
  {
    page: "agent",
    title: "平台接入落地",
    talkTrack: "说明 Endpoint、OAuth 回调和本地模型联调能力。",
  },
];

function parsePageFromPath(pathname: string): WorkspacePage {
  const normalized =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;
  return routeToPageMap[normalized] ?? "overview";
}

function getStepIndexByPage(page: WorkspacePage): number {
  const index = tourSteps.findIndex((step) => step.page === page);
  return index >= 0 ? index : 0;
}

function clampStepIndex(index: number): number {
  if (index < 0) {
    return 0;
  }

  if (index >= tourSteps.length) {
    return tourSteps.length - 1;
  }

  return index;
}

export default function App() {
  const [activePage, setActivePage] = useState<WorkspacePage>(() =>
    parsePageFromPath(window.location.pathname),
  );
  const [tourStepIndex, setTourStepIndex] = useState<number>(() =>
    getStepIndexByPage(parsePageFromPath(window.location.pathname)),
  );
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    prophetCases[0].id,
  );
  const [watchTargets, setWatchTargets] =
    useState<WatchTarget[]>(initialWatchTargets);
  const [events, setEvents] = useState<MonitoringEvent[]>(
    initialMonitoringEvents,
  );
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const selectedCase = useMemo(
    () =>
      prophetCases.find((item) => item.id === selectedCaseId) ??
      prophetCases[0],
    [selectedCaseId],
  );

  const activePageLabel =
    pageMeta.find((item) => item.key === activePage)?.label ?? "总览首页";

  const activeTourStep = tourSteps[tourStepIndex];

  const isSelectedCaseWatched = useMemo(
    () => watchTargets.some((target) => target.name === selectedCase.title),
    [selectedCase.title, watchTargets],
  );

  const showToast = (message: string, severity: AlertColor = "success") => {
    setToast({ open: true, message, severity });
  };

  const navigatePage = (
    page: WorkspacePage,
    options?: { historyMode?: "push" | "replace" },
  ) => {
    setActivePage(page);
    setTourStepIndex(getStepIndexByPage(page));

    const targetPath = pagePathMap[page];
    const mode = options?.historyMode ?? "push";
    if (window.location.pathname !== targetPath) {
      if (mode === "replace") {
        window.history.replaceState(null, "", targetPath);
      } else {
        window.history.pushState(null, "", targetPath);
      }
    }
  };

  const handlePageSwitch = (page: WorkspacePage) => {
    navigatePage(page, { historyMode: "push" });
    showToast(
      `已切换到${pageMeta.find((item) => item.key === page)?.label}`,
      "info",
    );
  };

  const handleTourStepMove = (direction: -1 | 1) => {
    const nextIndex = clampStepIndex(tourStepIndex + direction);
    if (nextIndex === tourStepIndex) {
      return;
    }

    const nextStep = tourSteps[nextIndex];
    setTourStepIndex(nextIndex);
    navigatePage(nextStep.page, { historyMode: "push" });
    showToast(`导览步骤：${nextStep.title}`, "info");
  };

  const handlePlayActiveTourStep = () => {
    navigatePage(activeTourStep.page, { historyMode: "push" });
    showToast(activeTourStep.talkTrack, "info");
  };

  const handleAddToWatchlist = () => {
    const exists = watchTargets.some(
      (target) => target.name === selectedCase.title,
    );

    if (exists) {
      showToast("该案例已在鹰眼监控列表中", "warning");
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

  const handleGoMonitor = () => {
    navigatePage("eagleeye", { historyMode: "push" });
    showToast("已打开鹰眼模式，继续查看告警", "info");
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
    showToast("已生成一条新的模拟告警", "info");
  };

  const handleAdvanceEventStatus = (eventId: string) => {
    let nextStatus: MonitoringEvent["status"] | null = null;

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        if (event.status === "待复核") {
          nextStatus = "处理中";
          return { ...event, status: "处理中" };
        }

        if (event.status === "处理中") {
          nextStatus = "已固证";
          return { ...event, status: "已固证" };
        }

        nextStatus = "已固证";
        return event;
      }),
    );

    if (nextStatus === "处理中") {
      showToast("告警已进入处理中状态", "info");
      return;
    }

    if (nextStatus === "已固证") {
      showToast("该告警已固证，可进入法官助手继续维权", "success");
    }
  };

  const handleGenerateDocs = () => {
    showToast("文书模板已生成（演示数据）");
  };

  const handleApplyStrategy = (strategyId: string) => {
    const strategy = strategyOptions.find((item) => item.id === strategyId);
    if (!strategy) {
      return;
    }

    showToast(`已应用策略：${strategy.title}`);
  };

  const handleRandomScenario = () => {
    const randomCase =
      prophetCases[Math.floor(Math.random() * prophetCases.length)];
    const pages: WorkspacePage[] = ["prophet", "eagleeye", "judgeassistant"];
    const randomPage = pages[Math.floor(Math.random() * pages.length)];

    setSelectedCaseId(randomCase.id);
    navigatePage(randomPage, { historyMode: "push" });
    showToast("已随机切换场景与页面", "info");
  };

  useEffect(() => {
    const canonicalPage = parsePageFromPath(window.location.pathname);
    const canonicalPath = pagePathMap[canonicalPage];

    if (window.location.pathname !== canonicalPath) {
      window.history.replaceState(null, "", canonicalPath);
    }

    setActivePage(canonicalPage);
    setTourStepIndex(getStepIndexByPage(canonicalPage));

    const onPopState = () => {
      const page = parsePageFromPath(window.location.pathname);
      setActivePage(page);
      setTourStepIndex(getStepIndexByPage(page));
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

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
    }, 4200);

    return () => {
      clearInterval(timer);
    };
  }, [autoPlay]);

  const renderOverviewPage = () => (
    <Stack spacing={2.5} className="fade-up">
      <Paper
        className="hero-card"
        sx={{ p: { xs: 2.3, md: 3 }, borderRadius: 2.5 }}
      >
        <Stack spacing={1.4}>
          <Chip
            label="智能合规工作台"
            color="secondary"
            sx={{ width: "fit-content" }}
          />
          <Typography variant="h4">
            让每次创意发布，都有可解释的风险护栏
          </Typography>
          <Typography variant="body1" color="text.secondary">
            通过多页面分工，分别聚焦预警、监控、固证和接入联调，避免信息堆叠，路演讲解更清晰。
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              startIcon={<GavelIcon />}
              onClick={() => handlePageSwitch("prophet")}
            >
              立即开始风险评估
            </Button>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => handlePageSwitch("eagleeye")}
            >
              查看监控告警页
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={1.6}>
        <Grid item xs={12} md={4}>
          <Paper className="entry-card" sx={{ p: 1.8, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              预言家
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1.2}>
              适合在路演前 30 秒快速展示红橙黄绿分层输出。
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={() => handlePageSwitch("prophet")}
            >
              进入页面
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="entry-card" sx={{ p: 1.8, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              鹰眼
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1.2}>
              展示告警时间线和状态推进按钮，体现可执行运营流程。
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={() => handlePageSwitch("eagleeye")}
            >
              进入页面
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="entry-card" sx={{ p: 1.8, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              法官助手
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1.2}>
              展示证据包与策略落地按钮，形成“建议到执行”闭环。
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={() => handlePageSwitch("judgeassistant")}
            >
              进入页面
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <ShowcasePanel
        highlights={projectHighlights}
        targetStack={targetTechStack}
        demoStack={demoTechStack}
      />

      <DemoAnalyticsPanel
        selectedCase={selectedCase}
        watchCount={watchTargets.length}
        eventCount={events.length}
        autoPlay={autoPlay}
        onToggleAutoPlay={setAutoPlay}
        onRandomScenario={handleRandomScenario}
      />
    </Stack>
  );

  const renderModePageHeader = (title: string, subtitle: string) => (
    <Paper
      className="page-header"
      sx={{ p: { xs: 2, md: 2.4 }, borderRadius: 2.5, mb: 2.2 }}
    >
      <Typography variant="h5" mb={0.6}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Paper>
  );

  const renderPage = () => {
    if (activePage === "overview") {
      return renderOverviewPage();
    }

    if (activePage === "prophet") {
      return (
        <>
          {renderModePageHeader(
            "预言家模式：发布前风险预警",
            "先判断再发布，避免热点创意上线后被动维权。",
          )}
          <PitchCoachPanel mode="prophet" note={modeNarration.prophet} />
          <ProphetPanel
            cases={prophetCases}
            selectedCase={selectedCase}
            isSelectedCaseWatched={isSelectedCaseWatched}
            onSelectCase={setSelectedCaseId}
            onAddToWatchlist={handleAddToWatchlist}
            onGoMonitor={handleGoMonitor}
          />
        </>
      );
    }

    if (activePage === "eagleeye") {
      return (
        <>
          {renderModePageHeader(
            "鹰眼模式：全网监控告警",
            "把告警发现、处理中、已固证变成可推进的标准化动作。",
          )}
          <PitchCoachPanel mode="eagleeye" note={modeNarration.eagleeye} />
          <EagleEyePanel
            watchTargets={watchTargets}
            events={events}
            onSimulateAlert={handleSimulateAlert}
            onAdvanceEventStatus={handleAdvanceEventStatus}
          />
        </>
      );
    }

    if (activePage === "judgeassistant") {
      return (
        <>
          {renderModePageHeader(
            "法官助手模式：固证与维权策略",
            "先把证据做厚，再比较行动路径，提升维权确定性。",
          )}
          <PitchCoachPanel
            mode="judgeassistant"
            note={modeNarration.judgeassistant}
          />
          <JudgeAssistantPanel
            evidence={evidencePacket}
            strategies={strategyOptions}
            onGenerateDocs={handleGenerateDocs}
            onApplyStrategy={handleApplyStrategy}
          />
        </>
      );
    }

    return (
      <>
        {renderModePageHeader(
          "Agent 接入中心",
          "配置平台接入、验证网关健康、测试本地模型联调。",
        )}
        <AgentIntegrationPanel config={agentIntegrationConfig} />
      </>
    );
  };

  return (
    <Box
      className="app-shell"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box className="bg-orb orb-left" />
      <Box className="bg-orb orb-right" />
      <Box className="bg-ribbon" />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: "rgba(7, 42, 63, 0.9)", backdropFilter: "blur(10px)" }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ px: { xs: 1.4, md: 3 }, py: 1 }}
          spacing={1.2}
        >
          <BalanceIcon />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            魔镜·品牌创意侵权风险卫士
          </Typography>
          <Chip
            icon={<WarningRoundedIcon />}
            label={activePage === "overview" ? "总览模式" : activePageLabel}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "white" }}
          />
        </Stack>
      </AppBar>

      <Container
        maxWidth={false}
        sx={{
          py: { xs: 2, md: 3 },
          pb: { xs: 10.5, md: 3 },
          px: { xs: 1.5, md: 3 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={3} lg={3}>
            <Paper
              className="nav-rail fade-up"
              sx={{ p: 1.2, borderRadius: 2.5 }}
            >
              <Stack spacing={1}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ px: 0.7 }}
                >
                  页面导航
                </Typography>
                <Stack
                  direction={{ xs: "row", md: "column" }}
                  flexWrap="wrap"
                  spacing={0.8}
                  useFlexGap
                >
                  {pageMeta.map((item) => {
                    const active = item.key === activePage;
                    return (
                      <Button
                        key={item.key}
                        onClick={() => handlePageSwitch(item.key)}
                        variant={active ? "contained" : "text"}
                        color={active ? "primary" : "inherit"}
                        startIcon={item.icon}
                        className={active ? "nav-btn active" : "nav-btn"}
                        sx={{
                          justifyContent: "flex-start",
                          px: 1.1,
                          py: 1,
                          minWidth: { xs: "calc(50% - 4px)", md: "100%" },
                        }}
                      >
                        <Stack alignItems="flex-start" spacing={0.15}>
                          <Typography variant="body2" fontWeight={700}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.85 }}>
                            {item.desc}
                          </Typography>
                        </Stack>
                      </Button>
                    );
                  })}
                </Stack>
              </Stack>

              <Paper
                className="nav-tip"
                sx={{
                  p: 1.2,
                  mt: 1.4,
                  borderRadius: 1.8,
                  bgcolor: "rgba(11,79,108,0.06)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                  mb={0.5}
                >
                  <AutoAwesomeIcon fontSize="small" color="secondary" />
                  <Typography variant="subtitle2">交互提示</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  当前已拆分为独立页面流程，适合按“总览 - 业务模式 -
                  接入联调”逐页讲解。
                </Typography>
              </Paper>

              <Paper
                className="tour-panel"
                sx={{
                  p: 1.2,
                  mt: 1,
                  borderRadius: 1.8,
                  bgcolor: "rgba(214,121,40,0.06)",
                }}
              >
                <Typography variant="subtitle2" mb={0.4}>
                  路演导览
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={0.7}
                >
                  第 {tourStepIndex + 1}/{tourSteps.length} 步：
                  {activeTourStep.title}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={((tourStepIndex + 1) / tourSteps.length) * 100}
                  sx={{ mb: 0.7, height: 6, borderRadius: 5 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {activeTourStep.talkTrack}
                </Typography>
                <Stack direction="row" spacing={0.8} mt={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      <ArrowBackIosNewIcon sx={{ fontSize: "0.8rem" }} />
                    }
                    onClick={() => handleTourStepMove(-1)}
                    disabled={tourStepIndex === 0}
                    sx={{ flex: 1 }}
                  >
                    上一步
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayCircleFilledWhiteIcon />}
                    onClick={handlePlayActiveTourStep}
                    sx={{ flex: 1.2 }}
                  >
                    讲这一页
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={
                      <ArrowForwardIosIcon sx={{ fontSize: "0.8rem" }} />
                    }
                    onClick={() => handleTourStepMove(1)}
                    disabled={tourStepIndex === tourSteps.length - 1}
                    sx={{ flex: 1 }}
                  >
                    下一步
                  </Button>
                </Stack>
              </Paper>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9} lg={9}>
            <Box key={activePage} className="page-canvas fade-up">
              {renderPage()}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Paper
        className="mobile-dock"
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Stack direction="row" spacing={0.6} sx={{ p: 0.8, overflowX: "auto" }}>
          {pageMeta.map((item) => {
            const active = item.key === activePage;
            return (
              <Button
                key={item.key}
                variant={active ? "contained" : "text"}
                onClick={() => handlePageSwitch(item.key)}
                className={
                  active ? "mobile-dock-btn active" : "mobile-dock-btn"
                }
                sx={{ minWidth: 94, flexShrink: 0 }}
              >
                <Stack
                  spacing={0.2}
                  alignItems="center"
                  justifyContent="center"
                >
                  {item.icon}
                  <Typography variant="caption" lineHeight={1.1}>
                    {item.label.replace("模式", "")}
                  </Typography>
                </Stack>
              </Button>
            );
          })}
        </Stack>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
