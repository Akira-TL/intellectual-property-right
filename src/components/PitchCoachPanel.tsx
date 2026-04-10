import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { DemoMode, ModeNarration } from "../types";

interface PitchCoachPanelProps {
  mode: DemoMode;
  note: ModeNarration;
}

const modeLabel: Record<DemoMode, string> = {
  prophet: "预言家模式",
  eagleeye: "鹰眼模式",
  judgeassistant: "法官助手模式",
};

export function PitchCoachPanel({ mode, note }: PitchCoachPanelProps) {
  return (
    <Paper
      className="fade-up"
      sx={{ p: { xs: 2, md: 2.4 }, borderRadius: 2.5, mb: 2.5 }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.2}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <CampaignOutlinedIcon color="secondary" />
          <Typography variant="h6">路演讲解信息</Typography>
        </Stack>
        <Chip label={modeLabel[mode]} color="secondary" variant="outlined" />
      </Stack>

      <Typography variant="subtitle2" mb={1}>
        {note.title}
      </Typography>

      <Stack spacing={1} mb={1.8}>
        {note.bullets.map((bullet) => (
          <Box
            key={bullet}
            sx={{
              p: 1.1,
              borderRadius: 1.8,
              border: "1px solid rgba(239,108,0,0.22)",
              bgcolor: "rgba(239,108,0,0.06)",
            }}
          >
            <Typography variant="body2">{bullet}</Typography>
          </Box>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <TipsAndUpdatesOutlinedIcon color="primary" fontSize="small" />
        <Typography variant="body2" color="primary.main" fontWeight={700}>
          {note.closingLine}
        </Typography>
      </Stack>
    </Paper>
  );
}
