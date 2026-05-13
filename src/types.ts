export interface SonarQubeConfig {
  baseUrl: string;
  token: string;
  projectKey: string;
}

export interface ReportOptions {
  output?: string;
  title?: string;
  includeIssues?: boolean;
  includeCoverage?: boolean;
  detail?: boolean;
  severities?: Severity[];
}

export type Severity = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';

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
