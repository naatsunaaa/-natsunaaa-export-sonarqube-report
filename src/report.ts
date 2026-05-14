import { SonarQubeClient } from './client';
import { generatePdf } from './pdf';
import { SonarQubeConfig, ReportOptions } from './types';

export async function generateReport(config: SonarQubeConfig, options: ReportOptions = {}): Promise<string> {
  const client = new SonarQubeClient(config);

  const title = options.title ?? `SonarQube Report - ${config.projectKey}`;
  const outputPath = options.output ?? `sonarqube-report-${config.projectKey}-${Date.now()}.pdf`;

  const [metrics, qualityGate] = await Promise.all([
    client.getMetrics(),
    client.getQualityGateStatus(),
  ]);

  let issues = options.includeIssues !== false
    ? await client.getAllIssues({ severities: options.severities, impactSeverities: options.impactSeverities, softwareQualities: options.softwareQualities, types: options.types })
    : [];

  if (issues.length > 0 && options.detail) {
    issues = await client.enrichIssues(issues);
  }

  await generatePdf(
    {
      title,
      projectKey: config.projectKey,
      generatedAt: new Date(),
      qualityGate,
      metrics,
      issues,
    },
    outputPath,
  );

  return outputPath;
}
