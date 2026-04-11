import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/700.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { OAuthCallbackPage } from "./components/OAuthCallbackPage";
import { SsoCallbackPage } from "./components/SsoCallbackPage";
import "./styles.css";
import theme from "./theme";

const RootComponent =
  window.location.pathname === "/auth/sso/callback"
    ? SsoCallbackPage
    : window.location.pathname === "/auth/callback"
      ? OAuthCallbackPage
      : App;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RootComponent />
    </ThemeProvider>
  </React.StrictMode>,
);
