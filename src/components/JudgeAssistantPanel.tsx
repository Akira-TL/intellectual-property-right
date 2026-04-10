import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { EvidencePacket, StrategyOption } from "../types";

interface JudgeAssistantPanelProps {
  evidence: EvidencePacket;
  strategies: StrategyOption[];
  onGenerateDocs: () => void;
  onApplyStrategy: (strategyId: string) => void;
}

export function JudgeAssistantPanel({
  evidence,
  strategies,
  onGenerateDocs,
  onApplyStrategy,
}: JudgeAssistantPanelProps) {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(
    strategies[0]?.id ?? "",
  );

  return (
    <Grid container spacing={2.5} className="fade-up stagger-3">
      <Grid item xs={12} md={5}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <SecurityOutlinedIcon color="primary" />
              <Typography variant="h6">证据包概览</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={2}>
              司法取证链路在演示中以 mock 信息展示，字段结构与真实流程一致。
            </Typography>

            <Stack spacing={1} mb={2}>
              <Typography variant="body2">
                <strong>案件：</strong>
                {evidence.caseName}
              </Typography>
              <Typography variant="body2">
                <strong>采集时间：</strong>
                {evidence.capturedAt}
              </Typography>
              <Typography variant="body2">
                <strong>存证编号：</strong>
                {evidence.chainCertId}
              </Typography>
              <Typography variant="body2">
                <strong>内容哈希：</strong>
                {evidence.contentHash}
              </Typography>
            </Stack>

            <Typography variant="subtitle2" mb={1}>
              证据明细
            </Typography>
            <Stack spacing={1.1} mb={2.5}>
              {evidence.items.map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    border: "1px solid rgba(11,79,108,0.12)",
                    bgcolor: "rgba(11,79,108,0.03)",
                  }}
                >
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>

            <Button
              variant="contained"
              startIcon={<DescriptionOutlinedIcon />}
              onClick={onGenerateDocs}
            >
              一键生成投诉文书
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={7}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" mb={1}>
              维权策略建议对比
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              结合传播规模、疑似获利和案例先例，给出行动优先级建议。
            </Typography>

            <Stack spacing={1.5}>
              {strategies.map((strategy) => (
                <Box
                  key={strategy.id}
                  sx={{
                    p: 1.8,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor:
                      selectedStrategyId === strategy.id
                        ? "primary.main"
                        : "rgba(11,79,108,0.14)",
                    bgcolor:
                      strategy.id === "strategy-fast"
                        ? "rgba(46,125,50,0.08)"
                        : "rgba(239,108,0,0.09)",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {strategy.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.3}>
                    {strategy.summary}
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    <strong>预期收益：</strong>
                    {strategy.expectedBenefit}
                  </Typography>
                  <Typography variant="body2">
                    <strong>成本：</strong>
                    {strategy.cost}
                  </Typography>
                  <Typography variant="body2">
                    <strong>适用场景：</strong>
                    {strategy.recommendedWhen}
                  </Typography>
                  <Button
                    size="small"
                    variant={
                      selectedStrategyId === strategy.id
                        ? "contained"
                        : "outlined"
                    }
                    sx={{ mt: 1.2 }}
                    onClick={() => setSelectedStrategyId(strategy.id)}
                  >
                    {selectedStrategyId === strategy.id
                      ? "当前策略"
                      : "选择该策略"}
                  </Button>
                </Box>
              ))}
            </Stack>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<TaskAltIcon />}
              sx={{ mt: 2 }}
              onClick={() => onApplyStrategy(selectedStrategyId)}
              disabled={!selectedStrategyId}
            >
              应用策略到执行清单
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
