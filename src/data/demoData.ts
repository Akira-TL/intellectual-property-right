import {
  EvidencePacket,
  MonitoringEvent,
  ProphetCase,
  StrategyOption,
  WatchTarget,
  HighlightItem,
  TechStackSection,
  AgentIntegrationConfig,
} from "../types";

export const prophetCases: ProphetCase[] = [
  {
    id: "case-sf",
    title: "顺丰速孕谐音车贴",
    materialType: "电商商品图 + 标题文案",
    description:
      "文案采用驰名商标谐音并带有贬损语义，容易构成混淆性近似与品牌声誉损害。",
    riskColor: "red",
    confidence: 0.93,
    legalBasis: [
      "商标法：禁止未经许可在近似标识上使用可能导致混淆的标识",
      "反不正当竞争法：不得通过贬损或攀附行为获取不正当竞争优势",
    ],
    precedents: [
      "广州知识产权法院：顺丰速孕车贴案（判赔 20 万）",
      "多个谐音攀附案例中对驰名商标保护的从严审查逻辑",
    ],
    recommendation: "高危，不建议发布。建议立即替换创意主题并进行法务复核。",
  },
  {
    id: "case-weibo",
    title: "微博热搜联名活动页",
    materialType: "品牌活动落地页",
    description:
      "核心功能词已在特定类别存在权利边界争议，使用时需结合品类和场景进行审查。",
    riskColor: "orange",
    confidence: 0.74,
    legalBasis: [
      "商标法：注册类别与实际使用类别需审查冲突风险",
      "审查实践：公共描述性词汇不应被不当垄断",
    ],
    precedents: ["国家知识产权局：微博热搜相关商标无效宣告案例"],
    recommendation: "中危，建议调整文案并增加品类排查说明后再发布。",
  },
  {
    id: "case-lora",
    title: "热门 IP 角色二创海报",
    materialType: "AI 生成图 + 宣发海报",
    description:
      "画面存在可识别的在先作品独创表达，二创边界较窄，存在著作权争议窗口。",
    riskColor: "yellow",
    confidence: 0.58,
    legalBasis: [
      "著作权法：复制权与信息网络传播权保护",
      "合理使用边界：二创并不当然豁免侵权风险",
    ],
    precedents: ["斗破苍穹美杜莎 AI 生图侵权案（判赔 5 万）"],
    recommendation: "低危到边界风险，建议保留创作过程证据并上线后持续监控。",
  },
  {
    id: "case-safe",
    title: "原创口号与原创视觉主 KV",
    materialType: "品牌原创物料",
    description:
      "关键表达与现有权利池未出现明显冲突，当前规则下未见高风险特征。",
    riskColor: "green",
    confidence: 0.86,
    legalBasis: [
      "商标检索：同类近似冲突未触发阈值",
      "著作权比对：未检出高度相似在先表达",
    ],
    precedents: ["暂无直接冲突判例，建议维持常规留痕"],
    recommendation: "安全，可发布。建议按标准流程保留创意留痕。",
  },
];

export const initialWatchTargets: WatchTarget[] = [
  {
    id: "target-1",
    name: "顺丰速孕谐音车贴",
    type: "电商商品页",
    lastScan: "2 分钟前",
  },
  {
    id: "target-2",
    name: "热门 IP 角色二创海报",
    type: "短视频素材",
    lastScan: "8 分钟前",
  },
];

export const initialMonitoringEvents: MonitoringEvent[] = [
  {
    id: "event-1",
    time: "2026-04-10 14:05:18",
    platform: "短视频平台",
    linkTitle: "疑似改编素材二次投流",
    riskHint: "检测到高相似字幕结构与视觉主体",
    status: "待复核",
  },
  {
    id: "event-2",
    time: "2026-04-10 13:52:07",
    platform: "电商平台",
    linkTitle: "谐音梗仿冒商品页",
    riskHint: "标题与卖点文案命中商标攀附词表",
    status: "处理中",
  },
  {
    id: "event-3",
    time: "2026-04-10 13:16:42",
    platform: "社交平台",
    linkTitle: "活动海报截图搬运",
    riskHint: "图片主构图与 logo 排版高度近似",
    status: "已固证",
  },
];

export const evidencePacket: EvidencePacket = {
  caseName: "谐音梗仿冒商品页",
  capturedAt: "2026-04-10 14:10:32",
  chainCertId: "CERT-20260410-778812",
  contentHash: "0x8f5b9a7e22d4bc11ae8f52a6cdb9f207d98ef1b5",
  items: [
    "商品详情页截图（含 URL 与时间戳）",
    "店铺主体信息与历史价格快照",
    "对比图：原创素材 vs 疑似侵权素材",
    "平台投诉模板（抖音 / 淘宝 / 小红书）",
  ],
};

export const strategyOptions: StrategyOption[] = [
  {
    id: "strategy-fast",
    title: "快速平台投诉下架",
    summary: "以最短时间止损，优先压制传播扩散。",
    expectedBenefit: "预计 24 小时内降低 60%-75% 曝光风险",
    cost: "低到中（人力与审核沟通成本）",
    recommendedWhen: "热点扩散速度快，目标是先止损再追责",
  },
  {
    id: "strategy-lawsuit",
    title: "持续取证后发起诉讼",
    summary: "继续累计交易与传播证据，提升索赔与禁令胜率。",
    expectedBenefit: "预计提升可主张赔偿区间与判赔稳定性",
    cost: "中到高（证据、律师、诉讼周期）",
    recommendedWhen: "侵权规模大、复发概率高、维权目标包含震慑",
  },
];

export const projectHighlights: HighlightItem[] = [
  {
    id: "highlight-1",
    title: "发布前预判",
    description: "用可解释风险报告替代拍脑袋决策，降低高风险创意上线概率。",
    pitchValue: "把法务关口前置到创意生产阶段",
  },
  {
    id: "highlight-2",
    title: "监控到告警自动化",
    description: "全网巡检链路可持续运行，发现疑似侵权后秒级触发告警。",
    pitchValue: "把人工盯盘升级为机器巡航",
  },
  {
    id: "highlight-3",
    title: "证据链可追溯",
    description: "将截图、链接、时间戳与哈希关联管理，降低维权举证难度。",
    pitchValue: "让证据从零散素材变成结构化资产",
  },
  {
    id: "highlight-4",
    title: "策略建议可比对",
    description: "结合传播规模与历史判例，比较快速下架和诉讼路径收益。",
    pitchValue: "让维权动作从“情绪决策”变成“收益决策”",
  },
];

export const targetTechStack: TechStackSection[] = [
  {
    id: "target-ai",
    layer: "多模态 AI 识别层",
    purpose: "识别文本、图像、音视频中的侵权信号与变体特征。",
    items: [
      "多模态大模型（文本/图像/音频理解）",
      "向量检索与相似度召回引擎",
      "生成式对抗检测（洗稿、局部改写、换脸）",
    ],
  },
  {
    id: "target-rule",
    layer: "法律规则引擎层",
    purpose: "将商标法、著作权法、不正当竞争规则转化为可计算判定。",
    items: [
      "规则 DSL 与阈值配置中心",
      "判例知识图谱与相似案推荐",
      "审计日志与结论可追溯链路",
    ],
  },
  {
    id: "target-platform",
    layer: "监控与固证平台层",
    purpose: "承载巡检任务、告警编排、证据留存和文书输出。",
    items: [
      "分布式任务调度与爬取编排",
      "证据仓与时间戳/区块链存证服务",
      "投诉文书模板引擎与策略评估模块",
    ],
  },
  {
    id: "target-product",
    layer: "产品与企业集成层",
    purpose: "与品牌营销、法务工单、风控平台打通闭环。",
    items: [
      "SaaS 多租户权限体系",
      "企业 SSO 与审计报表",
      "CRM / 法务系统 / 工单系统 API 集成",
    ],
  },
];

export const demoTechStack: TechStackSection[] = [
  {
    id: "demo-web",
    layer: "前端演示层",
    purpose: "高保真呈现三大模式和可讲述交互。",
    items: [
      "React + TypeScript + Vite",
      "Material UI 组件系统",
      "本地 mock 数据驱动演示流程",
    ],
  },
  {
    id: "demo-logic",
    layer: "演示逻辑层",
    purpose: "模拟真实产品的风险评估、监控告警与策略输出。",
    items: [
      "结构化风险评估 schema",
      "前端状态机模拟链路流转",
      "分阶段结果揭示与操作联动",
    ],
  },
];

export const agentIntegrationConfig: AgentIntegrationConfig = {
  endpointUrl: "https://law.babelbeast.com/agent",
  webUiUrl: "https://law.babelbeast.com",
  oauthAuthorizeUrl: "https://app.agentpit.io/api/oauth/authorize",
  oauthTokenUrl: "https://app.agentpit.io/api/oauth/token",
  oauthUserInfoUrl: "https://app.agentpit.io/api/oauth/userinfo",
  oauthCallbackUrl: "https://law.babelbeast.com/api/auth/agentpit/callback",
  oauthClientId: "cmnt4hprp000g60m31zsrs4su",
  oauthClientSecret: "cmnt4hprp000h60m3js6kjfp4",
  ssoCallbackPath: "/auth/sso/callback",
  tokenReportPath: "/api/v1/tokens/report",
  openApiPath: "/agent/openapi.json",
  skillPath: "skills/agentpit-sso/SKILL.md, skills/agentpit-tokens/SKILL.md",
  modelBaseUrl: "http://localhost:11434/v1",
  modelName: "qwen3.5:4b",
  timeoutMs: 5000,
};
