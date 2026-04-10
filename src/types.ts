export type RiskColor = "red" | "orange" | "yellow" | "green";

export interface ProphetCase {
  id: string;
  title: string;
  materialType: string;
  description: string;
  riskColor: RiskColor;
  confidence: number;
  legalBasis: string[];
  precedents: string[];
  recommendation: string;
}

export interface WatchTarget {
  id: string;
  name: string;
  type: string;
  lastScan: string;
}

export interface MonitoringEvent {
  id: string;
  time: string;
  platform: string;
  linkTitle: string;
  riskHint: string;
  status: "待复核" | "处理中" | "已固证";
}

export interface EvidencePacket {
  caseName: string;
  capturedAt: string;
  chainCertId: string;
  contentHash: string;
  items: string[];
}

export interface StrategyOption {
  id: string;
  title: string;
  summary: string;
  expectedBenefit: string;
  cost: string;
  recommendedWhen: string;
}

export interface HighlightItem {
  id: string;
  title: string;
  description: string;
  pitchValue: string;
}

export interface TechStackSection {
  id: string;
  layer: string;
  purpose: string;
  items: string[];
}

export interface AgentIntegrationConfig {
  endpointUrl: string;
  webUiUrl: string;
  oauthCallbackUrl: string;
  openApiPath: string;
  skillPath: string;
  modelBaseUrl: string;
  modelName: string;
  timeoutMs: number;
}

export interface AgentHealthStatus {
  ok: boolean;
  message: string;
  model?: string;
  timestamp?: string;
}
