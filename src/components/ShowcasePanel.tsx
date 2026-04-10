import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GppGoodIcon from "@mui/icons-material/GppGood";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { ReactNode, useMemo, useState } from "react";
import { HighlightItem, TechStackSection } from "../types";

interface ShowcasePanelProps {
  highlights: HighlightItem[];
  targetStack: TechStackSection[];
  demoStack: TechStackSection[];
}

const iconMap: Record<string, ReactNode> = {
  "highlight-1": <AutoGraphIcon color="primary" />,
  "highlight-2": <TravelExploreIcon color="secondary" />,
  "highlight-3": <GppGoodIcon color="success" />,
  "highlight-4": <AccountTreeIcon color="warning" />,
};

type StackView = "target" | "demo";

export function ShowcasePanel({
  highlights,
  targetStack,
  demoStack,
}: ShowcasePanelProps) {
  const [view, setView] = useState<StackView>("target");

  const stackData = useMemo(
    () => (view === "target" ? targetStack : demoStack),
    [view, targetStack, demoStack],
  );

  return (
    <Paper
      className="fade-up"
      sx={{ p: { xs: 2, md: 2.4 }, borderRadius: 2.5 }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
      >
        <Typography variant="h6">项目亮点与技术栈叙述</Typography>
        <Chip
          label="路演讲解增强区"
          size="small"
          color="primary"
          variant="outlined"
        />
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        这一块用于同时展示产品价值点和技术可信度，帮助评委快速建立“可落地”认知。
      </Typography>

      <Grid container spacing={1.5} mb={2.5}>
        {highlights.map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <Box
              className="highlight-card"
              sx={{
                p: 1.6,
                borderRadius: 2,
                border: "1px solid rgba(11,79,108,0.14)",
              }}
            >
              <Stack direction="row" spacing={1.1} alignItems="center" mb={0.8}>
                {iconMap[item.id]}
                <Typography variant="subtitle2" fontWeight={700}>
                  {item.title}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={0.6}>
                {item.description}
              </Typography>
              <Typography
                variant="caption"
                color="primary.main"
                fontWeight={700}
              >
                路演说法：{item.pitchValue}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={1.2}
        spacing={1.2}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          技术栈展示
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, value: StackView | null) => {
            if (value) {
              setView(value);
            }
          }}
        >
          <ToggleButton value="target">目标态技术栈</ToggleButton>
          <ToggleButton value="demo">Demo 实现栈</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={1}>
        {stackData.map((section) => (
          <Accordion key={section.id} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack>
                <Typography fontWeight={700}>{section.layer}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {section.purpose}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={0.8}>
                {section.items.map((item) => (
                  <Typography key={item} variant="body2">
                    - {item}
                  </Typography>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Paper>
  );
}
