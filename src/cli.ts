#!/usr/bin/env node
import { Command } from 'commander';
import { generateReport } from './report';
import { Severity, ImpactSeverity, IssueType, SoftwareQuality } from './types';

const program = new Command();

program
  .name('export-sonarqube-report')
  .description('Generate PDF reports from SonarQube Community Edition')
  .version('0.1.0')
  .requiredOption('-u, --url <url>', 'SonarQube server URL')
  .requiredOption('-t, --token <token>', 'SonarQube authentication token (or set SONAR_TOKEN env)')
  .requiredOption('-k, --project-key <key>', 'SonarQube project key')
  .option('-o, --output <path>', 'Output PDF file path')
  .option('--title <title>', 'Report title')
  .option('--no-issues', 'Exclude issues from report')
  .option('--detail', 'Include source snippets and rule descriptions for each issue')
  .option('--severities <list>', 'Comma-separated severities: BLOCKER,CRITICAL,MAJOR,MINOR,INFO')
  .option('--impact-severities <list>', 'Comma-separated impact severities (SonarQube 10+): HIGH,MEDIUM,LOW,INFO')
  .option('--software-qualities <list>', 'Comma-separated software qualities (SonarQube 10+): SECURITY,RELIABILITY,MAINTAINABILITY')
  .option('--types <list>', 'Comma-separated issue types: BUG,VULNERABILITY,CODE_SMELL')
  .action(async (opts) => {
    const token = opts.token === true ? process.env.SONAR_TOKEN : opts.token;
    if (!token) {
      console.error('Error: token is required (--token or SONAR_TOKEN env)');
      process.exit(1);
    }

    const severities = opts.severities
      ? (opts.severities.split(',') as Severity[])
      : undefined;
    const impactSeverities = opts.impactSeverities
      ? (opts.impactSeverities.split(',') as ImpactSeverity[])
      : undefined;
    const softwareQualities = opts.softwareQualities
      ? (opts.softwareQualities.split(',') as SoftwareQuality[])
      : undefined;
    const types = opts.types
      ? (opts.types.split(',') as IssueType[])
      : undefined;

    try {
      const outputPath = await generateReport(
        {
          baseUrl: opts.url,
          token,
          projectKey: opts.projectKey,
        },
        {
          output: opts.output,
          title: opts.title,
          includeIssues: opts.issues,
          detail: opts.detail ?? false,
          severities,
          impactSeverities,
          softwareQualities,
          types,
        },
      );
      console.log(`Report generated: ${outputPath}`);
    } catch (err) {
      console.error('Failed to generate report:', (err as Error).message);
      process.exit(1);
    }
  });

program.parse();
