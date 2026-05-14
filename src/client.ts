import { SonarQubeConfig, Metric, Issue, IssueType, ProjectStatus, Severity, ImpactSeverity, SourceLine, RuleDetail, Impact } from './types';

const DEFAULT_METRICS = [
  'bugs',
  'vulnerabilities',
  'code_smells',
  'coverage',
  'duplicated_lines_density',
  'ncloc',
  'reliability_rating',
  'security_rating',
  'sqale_rating',
];

export class SonarQubeClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private projectKey: string;

  constructor(config: SonarQubeConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.projectKey = config.projectKey;
    this.headers = {
      Authorization: `Bearer ${config.token}`,
    };
  }

  private async request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const res = await fetch(url.toString(), { headers: this.headers });
    if (!res.ok) {
      throw new Error(`SonarQube API error: ${res.status} ${res.statusText} - ${path}`);
    }
    return res.json() as Promise<T>;
  }

  async getMetrics(metricKeys?: string[]): Promise<Metric[]> {
    const keys = metricKeys ?? DEFAULT_METRICS;
    const data = await this.request<{
      component: { measures: Array<{ metric: string; value: string; bestValue?: boolean }> };
    }>('/api/measures/component', {
      component: this.projectKey,
      metricKeys: keys.join(','),
    });

    return data.component.measures.map((m) => ({
      key: m.metric,
      value: m.value,
      bestValue: m.bestValue,
    }));
  }

  async getIssues(options: { severities?: Severity[]; impactSeverities?: ImpactSeverity[]; softwareQualities?: string[]; types?: IssueType[]; page?: number; pageSize?: number } = {}): Promise<{
    issues: Issue[];
    total: number;
  }> {
    const params: Record<string, string> = {
      componentKeys: this.projectKey,
      resolved: 'false',
      ps: String(options.pageSize ?? 100),
      p: String(options.page ?? 1),
    };
    if (options.severities?.length) {
      params.severities = options.severities.join(',');
    }
    if (options.impactSeverities?.length) {
      params.impactSeverities = options.impactSeverities.join(',');
    }
    if (options.softwareQualities?.length) {
      params.impactSoftwareQualities = options.softwareQualities.join(',');
    }
    if (options.types?.length) {
      params.types = options.types.join(',');
    }

    const data = await this.request<{
      issues: Array<{
        key: string;
        rule: string;
        severity: Severity;
        component: string;
        message: string;
        line?: number;
        type: 'BUG' | 'VULNERABILITY' | 'CODE_SMELL';
        impacts?: Array<{ softwareQuality: string; severity: string }>;
      }>;
      total: number;
    }>('/api/issues/search', params);

    return {
      issues: data.issues.map((i) => ({
        key: i.key,
        rule: i.rule,
        severity: i.severity,
        component: i.component,
        message: i.message,
        line: i.line,
        type: i.type,
        impacts: i.impacts as Impact[] | undefined,
      })),
      total: data.total,
    };
  }

  async getAllIssues(options: { severities?: Severity[]; impactSeverities?: ImpactSeverity[]; softwareQualities?: string[]; types?: IssueType[] } = {}): Promise<Issue[]> {
    const allIssues: Issue[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      const { issues, total } = await this.getIssues({ ...options, page, pageSize });
      allIssues.push(...issues);
      if (allIssues.length >= total || issues.length === 0) break;
      page++;
    }

    return allIssues;
  }

  async getSourceSnippet(issueKey: string): Promise<SourceLine[]> {
    const data = await this.request<{
      sources: Record<string, Array<{ line: number; code: string }>>;
    }>('/api/sources/issue_snippets', { issueKey });

    const allLines: SourceLine[] = [];
    for (const lines of Object.values(data.sources)) {
      for (const l of lines) {
        allLines.push({ line: l.line, code: l.code });
      }
    }
    return allLines;
  }

  async getRule(ruleKey: string): Promise<RuleDetail> {
    const data = await this.request<{
      rule: {
        key: string;
        name: string;
        htmlDesc: string;
        severity: Severity;
        type: string;
      };
    }>('/api/rules/show', { key: ruleKey });

    return {
      key: data.rule.key,
      name: data.rule.name,
      htmlDesc: data.rule.htmlDesc,
      severity: data.rule.severity,
      type: data.rule.type,
    };
  }

  async enrichIssues(issues: Issue[]): Promise<Issue[]> {
    const ruleCache = new Map<string, RuleDetail>();

    const enriched: Issue[] = [];
    for (const issue of issues) {
      let snippet: SourceLine[] | undefined;
      try {
        snippet = await this.getSourceSnippet(issue.key);
      } catch {
        snippet = undefined;
      }

      let ruleDescription: RuleDetail | undefined;
      if (!ruleCache.has(issue.rule)) {
        try {
          const rule = await this.getRule(issue.rule);
          ruleCache.set(issue.rule, rule);
        } catch {
          // skip
        }
      }
      ruleDescription = ruleCache.get(issue.rule);

      enriched.push({ ...issue, snippet, ruleDescription });
    }

    return enriched;
  }

  async getQualityGateStatus(): Promise<ProjectStatus> {
    const data = await this.request<{
      projectStatus: {
        status: 'OK' | 'ERROR' | 'NONE';
        conditions: Array<{
          status: 'OK' | 'ERROR' | 'NONE';
          metricKey: string;
          comparator: string;
          errorThreshold: string;
          actualValue: string;
        }>;
      };
    }>('/api/qualitygates/project_status', {
      projectKey: this.projectKey,
    });

    return data.projectStatus;
  }
}
