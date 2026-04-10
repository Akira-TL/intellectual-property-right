import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0c5c6b",
    },
    secondary: {
      main: "#d67928",
    },
    background: {
      default: "#f3f7fc",
      paper: "#ffffff",
    },
    success: {
      main: "#2e7d32",
    },
    warning: {
      main: "#ed6c02",
    },
    error: {
      main: "#d32f2f",
    },
  },
  typography: {
    fontFamily:
      '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    h4: {
      fontFamily: '"STKaiti", "KaiTi", "Noto Sans SC", sans-serif',
      fontWeight: 700,
      letterSpacing: "0.01em",
    },
    h5: {
      fontFamily: '"STKaiti", "KaiTi", "Noto Sans SC", sans-serif',
      fontWeight: 700,
      letterSpacing: "0.01em",
    },
    h3: {
      fontWeight: 800,
      letterSpacing: "0.02em",
    },
    subtitle1: {
      lineHeight: 1.75,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: "1px solid rgba(12, 92, 107, 0.12)",
          boxShadow: "0 16px 32px rgba(12, 92, 107, 0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid rgba(12, 92, 107, 0.1)",
          boxShadow: "0 10px 24px rgba(12, 92, 107, 0.08)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 700,
          transition: "all 180ms ease",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;
