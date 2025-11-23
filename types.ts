
export enum NodeType {
  ROOT = 'ROOT',
  TRENDS = 'TRENDS',
  PROBLEMS = 'PROBLEMS',
  ADS = 'ADS',
  COMPETITORS = 'COMPETITORS',
  GAPS = 'GAPS',
  MARKET_AUDIT = 'MARKET_AUDIT',
  REPORT = 'REPORT'
}

export type NodeStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';
export type Language = 'en' | 'pt';

export interface NodeStats {
  label: string;
  value: number;
  max?: number; // For progress bars
  color?: string; // Optional color override
}

export interface NodeData {
  title: string;
  nicheContext: string; // The niche this node belongs to
  content: string[]; // List of items (e.g., trends, problems)
  subNiches?: string[]; // NEW: Specific sub-niches for Root node
  stats?: NodeStats[];
  status: NodeStatus;
  errorMessage?: string;
  description?: string; // Short summary
  // Specific fields for Market Audit
  auditData?: {
    demandScore: number;
    supplyScore: number;
    opportunityScore: number;
    verdict: string;
    growthRate: string;
    saturationRisk: string;
  };
}

export interface Node {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  data: NodeData;
}

export interface Connection {
  id: string;
  from: string; // Node ID
  to: string;   // Node ID
}

export interface Opportunity {
  id: string; // Unique ID for tracking
  title: string;
  score: number;
  description: string;
}

export interface MentorAdvice {
  stepTitle: string;
  empatheticIntro: string; // "I know this feels overwhelming, but..."
  steps: string[];
  motivation: string; // "You've got this."
}

export interface ReportData {
  niche: string;
  verdict: 'GO' | 'NO-GO' | 'PIVOT';
  summary: string;
  subNichesHighlights: string[]; // Best sub-niches to start
  opportunities: Opportunity[];
  viabilityScore: number;
  recommendedStack: string[];
  generatedAt: Date;
}

export interface Project {
  id: string;
  niche: string;
  createdAt: number;
  lastModified: number;
  nodes: Node[];
  connections: Connection[];
  report: ReportData | null;
  lang: Language;
}

export type ViewMode = 'ONBOARDING' | 'CANVAS' | 'REPORT';
