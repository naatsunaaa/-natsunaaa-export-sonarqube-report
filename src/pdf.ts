import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { Issue, Metric, ProjectStatus, Impact } from './types';

interface PdfReportData {
  title: string;
  projectKey: string;
  generatedAt: Date;
  qualityGate: ProjectStatus;
  metrics: Metric[];
  issues: Issue[];
}

const COLORS = {
  primary: '#1a73e8',
  success: '#34a853',
  error: '#ea4335',
  warning: '#fbbc04',
  text: '#202124',
  muted: '#5f6368',
  border: '#dadce0',
  codeBg: '#f8f9fa',
} as const;

const SEVERITY_COLORS: Record<string, string> = {
  BLOCKER: '#ea4335',
  CRITICAL: '#ea4335',
  MAJOR: '#fbbc04',
  MINOR: '#5f6368',
  INFO: '#1a73e8',
};

const IMPACT_SEVERITY_COLORS: Record<string, string> = {
  HIGH: '#ea4335',
  MEDIUM: '#fbbc04',
  LOW: '#5f6368',
  INFO: '#1a73e8',
};

const SOFTWARE_QUALITY_LABELS: Record<string, string> = {
  SECURITY: 'Security',
  RELIABILITY: 'Reliability',
  MAINTAINABILITY: 'Maintainability',
};

const METRIC_LABELS: Record<string, string> = {
  bugs: 'Bugs',
  vulnerabilities: 'Vulnerabilities',
  code_smells: 'Code Smells',
  coverage: 'Coverage (%)',
  duplicated_lines_density: 'Duplications (%)',
  ncloc: 'Lines of Code',
  reliability_rating: 'Reliability Rating',
  security_rating: 'Security Rating',
  sqale_rating: 'Maintainability Rating',
};

function ratingLabel(value: string): string {
  const map: Record<string, string> = { '1.0': 'A', '2.0': 'B', '3.0': 'C', '4.0': 'D', '5.0': 'E' };
  return map[value] ?? value;
}

function isRatingMetric(key: string): boolean {
  return key.endsWith('_rating');
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > 750) {
    doc.addPage();
  }
}

export async function generatePdf(data: PdfReportData, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = createWriteStream(outputPath);
    doc.pipe(stream);

    // Title
    doc.fontSize(24).fillColor(COLORS.primary).text(data.title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(COLORS.muted).text(`Project: ${data.projectKey}`, { align: 'center' });
    doc.text(`Generated: ${data.generatedAt.toISOString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // Quality Gate
    const gateColor = data.qualityGate.status === 'OK' ? COLORS.success : COLORS.error;
    doc.fontSize(16).fillColor(COLORS.text).text('Quality Gate');
    doc.moveDown(0.3);
    doc.fontSize(14).fillColor(gateColor).text(data.qualityGate.status === 'OK' ? 'PASSED' : 'FAILED');

    if (data.qualityGate.conditions.length > 0) {
      doc.moveDown(0.5);
      for (const cond of data.qualityGate.conditions) {
        const condColor = cond.status === 'OK' ? COLORS.success : COLORS.error;
        doc.fontSize(9).fillColor(condColor).text(
          `  ${cond.status === 'OK' ? '✓' : '✗'} ${cond.metricKey}: ${cond.actualValue} (threshold: ${cond.comparator} ${cond.errorThreshold})`
        );
      }
    }
    doc.moveDown(1);

    // Metrics
    doc.fontSize(16).fillColor(COLORS.text).text('Metrics');
    doc.moveDown(0.5);

    for (const metric of data.metrics) {
      const label = METRIC_LABELS[metric.key] ?? metric.key;
      const displayValue = isRatingMetric(metric.key) ? ratingLabel(metric.value) : metric.value;
      doc.fontSize(11).fillColor(COLORS.text).text(`${label}: `, { continued: true });
      doc.fillColor(COLORS.primary).text(displayValue);
    }
    doc.moveDown(1.5);

    // Issues Summary
    if (data.issues.length > 0) {
      doc.fontSize(16).fillColor(COLORS.text).text(`Issues (${data.issues.length} open)`);
      doc.moveDown(0.5);

      // Software Quality breakdown (new SonarQube 10+ style)
      const hasImpacts = data.issues.some((i) => i.impacts && i.impacts.length > 0);
      if (hasImpacts) {
        doc.fontSize(13).fillColor(COLORS.text).text('Software Quality');
        doc.moveDown(0.3);
        const byQuality = groupByImpactQuality(data.issues);
        for (const [quality, count] of Object.entries(byQuality)) {
          doc.fontSize(11).fillColor(COLORS.text).text(`  ${SOFTWARE_QUALITY_LABELS[quality] ?? quality}: ${count}`);
        }
        doc.moveDown(0.5);

        doc.fontSize(13).fillColor(COLORS.text).text('Severity');
        doc.moveDown(0.3);
        const byImpactSeverity = groupByImpactSeverity(data.issues);
        for (const [severity, count] of Object.entries(byImpactSeverity)) {
          doc.fontSize(11).fillColor(IMPACT_SEVERITY_COLORS[severity] ?? COLORS.text).text(`  ${severity}: ${count}`);
        }
        doc.moveDown(0.5);
      } else {
        const bySeverity = groupBy(data.issues, (i) => i.severity);
        for (const [severity, issues] of Object.entries(bySeverity)) {
          doc.fontSize(12).fillColor(SEVERITY_COLORS[severity] ?? COLORS.text).text(`${severity}: ${issues.length}`);
        }
        doc.moveDown(0.5);
      }

      const byType = groupBy(data.issues, (i) => i.type);
      for (const [type, issues] of Object.entries(byType)) {
        doc.fontSize(12).fillColor(COLORS.text).text(`${type}: ${issues.length}`);
      }
      doc.moveDown(1.5);

      // Issue Details
      doc.addPage();
      doc.fontSize(18).fillColor(COLORS.primary).text('Issue Details', { align: 'center' });
      doc.moveDown(1);

      for (const issue of data.issues) {
        ensureSpace(doc, 120);

        // Issue header
        const impactLabel = issue.impacts?.length
          ? issue.impacts.map((imp) => `${imp.severity}/${SOFTWARE_QUALITY_LABELS[imp.softwareQuality] ?? imp.softwareQuality}`).join(' ')
          : issue.severity;
        const color = issue.impacts?.length
          ? (IMPACT_SEVERITY_COLORS[issue.impacts[0].severity] ?? COLORS.text)
          : (SEVERITY_COLORS[issue.severity] ?? COLORS.text);
        doc.fontSize(10).fillColor(color).text(`[${impactLabel}] [${issue.type}]`, { continued: true });
        doc.fillColor(COLORS.text).text(` ${issue.message}`);

        // File location
        const componentShort = issue.component.split(':').pop() ?? issue.component;
        doc.fontSize(8).fillColor(COLORS.muted).text(`  ${componentShort}${issue.line ? `:${issue.line}` : ''} | Rule: ${issue.rule}`);

        // Source code snippet
        if (issue.snippet && issue.snippet.length > 0) {
          doc.moveDown(0.3);
          const snippetX = doc.x + 10;
          const snippetWidth = 470;

          doc.save();
          doc.rect(snippetX - 5, doc.y - 2, snippetWidth, issue.snippet.length * 11 + 6)
            .fill(COLORS.codeBg);
          doc.restore();

          for (const line of issue.snippet) {
            ensureSpace(doc, 12);
            const lineNum = String(line.line).padStart(4, ' ');
            const code = line.code.replace(/\t/g, '  ');
            doc.font('Courier').fontSize(7).fillColor(COLORS.muted).text(`${lineNum} | `, snippetX, doc.y, { continued: true });
            doc.fillColor(COLORS.text).text(code.slice(0, 100), { width: snippetWidth - 50 });
          }
          doc.font('Helvetica');
        }

        // Rule description
        if (issue.ruleDescription) {
          doc.moveDown(0.2);
          doc.fontSize(8).fillColor(COLORS.primary).text(`Rule: ${issue.ruleDescription.name}`);
          const desc = stripHtml(issue.ruleDescription.htmlDesc);
          const truncated = desc.length > 300 ? desc.slice(0, 300) + '...' : desc;
          doc.fontSize(7).fillColor(COLORS.muted).text(truncated, { width: 470 });
        }

        doc.moveDown(0.8);

        // Separator line
        doc.save();
        doc.moveTo(doc.x, doc.y).lineTo(doc.x + 495, doc.y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
        doc.restore();
        doc.moveDown(0.5);
      }
    }

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = fn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}

function groupByImpactQuality(issues: Issue[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const issue of issues) {
    if (issue.impacts) {
      for (const impact of issue.impacts) {
        result[impact.softwareQuality] = (result[impact.softwareQuality] ?? 0) + 1;
      }
    }
  }
  return result;
}

function groupByImpactSeverity(issues: Issue[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const issue of issues) {
    if (issue.impacts) {
      for (const impact of issue.impacts) {
        result[impact.severity] = (result[impact.severity] ?? 0) + 1;
      }
    }
  }
  return result;
}
