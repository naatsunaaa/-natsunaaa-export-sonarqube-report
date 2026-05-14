export interface SonarQubeConfig {
  baseUrl: string;
  token: string;
  projectKey: string;
}

export type IssueType = 'BUG' | 'VULNERABILITY' | 'CODE_SMELL';

export interface ReportOptions {
  output?: string;
  title?: string;
  includeIssues?: boolean;
  includeCoverage?: boolean;
  detail?: boolean;
  severities?: Severity[];
  impactSeverities?: ImpactSeverity[];
  types?: IssueType[];
}

export type Severity = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';

export type ImpactSeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type SoftwareQuality = 'SECURITY' | 'RELIABILITY' | 'MAINTAINABILITY';

export interface Impact {
  softwareQuality: SoftwareQuality;
  severity: ImpactSeverity;
}

export interface Metric {
  key: string;
  value: string;
  bestValue?: boolean;
}

export interface Issue {
  key: string;
  rule: string;
  severity: Severity;
  component: string;
  message: string;
  line?: number;
  type: 'BUG' | 'VULNERABILITY' | 'CODE_SMELL';
  impacts?: Impact[];
  snippet?: SourceLine[];
  ruleDescription?: RuleDetail;
}

export interface SourceLine {
  line: number;
  code: string;
  isHighlighted?: boolean;
}

export interface RuleDetail {
  key: string;
  name: string;
  htmlDesc: string;
  severity: Severity;
  type: string;
}

export interface ProjectStatus {
  status: 'OK' | 'ERROR' | 'NONE';
  conditions: QualityGateCondition[];
}

export interface QualityGateCondition {
  status: 'OK' | 'ERROR' | 'NONE';
  metricKey: string;
  comparator: string;
  errorThreshold: string;
  actualValue: string;
}
