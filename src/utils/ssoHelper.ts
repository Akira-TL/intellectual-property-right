const SSO_ATTEMPTED_KEY = "agentpit_sso_attempted";
const ACCESS_TOKEN_KEY = "agentpit_access_token";
const USER_KEY = "agentpit_user";

export interface AgentpitSession {
  token: string;
  user: Record<string, unknown> | null;
}

export function sanitizeReturnUrl(input?: string | null): string {
  if (!input) {
    return "/";
  }

  const decoded = (() => {
    try {
      return decodeURIComponent(input);
    } catch {
      return input;
    }
  })();

  if (!decoded.startsWith("/")) {
    return "/";
  }

  if (decoded.startsWith("//") || decoded.startsWith("/\\")) {
    return "/";
  }

  return decoded;
}

export function shouldAutoSso(): boolean {
  const path = window.location.pathname;

  if (path.startsWith("/auth/sso/callback")) {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("sso_error")) {
    return false;
  }

  if (sessionStorage.getItem(SSO_ATTEMPTED_KEY)) {
    return false;
  }

  return true;
}

export function markSsoAttempted(): void {
  sessionStorage.setItem(SSO_ATTEMPTED_KEY, "true");
}

export function clearSsoAttempted(): void {
  sessionStorage.removeItem(SSO_ATTEMPTED_KEY);
}

export function buildSsoEntryUrl(returnUrl?: string): string {
  const effectiveReturnUrl = sanitizeReturnUrl(
    returnUrl ?? `${window.location.pathname}${window.location.search}`,
  );

  return `/api/auth/agentpit/sso?returnUrl=${encodeURIComponent(effectiveReturnUrl)}`;
}

export function readAgentpitSession(): AgentpitSession | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    return null;
  }

  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return { token, user: null };
  }

  try {
    const user = JSON.parse(rawUser) as Record<string, unknown>;
    return { token, user };
  } catch {
    return { token, user: null };
  }
}

export function writeAgentpitSession(
  token: string,
  user: Record<string, unknown>,
): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAgentpitSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
