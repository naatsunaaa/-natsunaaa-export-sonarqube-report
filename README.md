# @natsunaaa/export-sonarqube-report

Generate PDF reports from SonarQube Community Edition.

[English](#english) | [한국어](#한국어) | [中文](#中文)

---

## English

Community Edition doesn't include built-in reporting. This tool fills that gap by calling the SonarQube Web API and generating a PDF with quality gate status, metrics, and issues.

### Examples

```bash
# Basic report (all issues included)
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 \
  -t <your-sonarqube-token> \
  -k my-project-key \
  -o report.pdf

# SonarQube 10+: filter by Software Quality (matches console categories)
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --software-qualities RELIABILITY -o reliability-report.pdf

# SonarQube 10+: filter by impact severity
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --impact-severities HIGH,MEDIUM -o high-medium-report.pdf

# Legacy: filter by type (BUG only)
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --types BUG -o bugs-report.pdf

# Detailed report with source snippets and rule descriptions
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --software-qualities RELIABILITY --impact-severities HIGH \
  --detail -o critical-reliability.pdf

# Metrics + Quality Gate only (no issues)
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --no-issues -o summary.pdf

# Using SONAR_TOKEN env variable
SONAR_TOKEN=your-token npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t -k my-project -o report.pdf
```

### Installation

```bash
npm i @natsunaaa/export-sonarqube-report
```

### CLI Usage

```bash
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 \
  -t <your-sonarqube-token> \
  -k my-project-key \
  -o report.pdf
```

#### Options

| Option                          | Description                                                            |
| ------------------------------- | ---------------------------------------------------------------------- |
| `-u, --url <url>`               | SonarQube server URL (required)                                        |
| `-t, --token <token>`           | Authentication token, or set `SONAR_TOKEN` env (required)              |
| `-k, --project-key <key>`       | SonarQube project key (required)                                       |
| `-o, --output <path>`           | Output PDF file path                                                   |
| `--title <title>`               | Custom report title                                                    |
| `--no-issues`                   | Exclude issues from report                                             |
| `--detail`                      | Include source snippets and rule descriptions                          |
| `--severities <list>`           | Filter by legacy severity: `BLOCKER,CRITICAL,MAJOR,MINOR,INFO`         |
| `--impact-severities <list>`    | Filter by impact severity (SonarQube 10+): `HIGH,MEDIUM,LOW,INFO`      |
| `--software-qualities <list>`   | Filter by software quality (SonarQube 10+): `SECURITY,RELIABILITY,MAINTAINABILITY` |
| `--types <list>`                | Filter by issue type: `BUG,VULNERABILITY,CODE_SMELL`                   |

#### SonarQube 10+ vs Legacy Filtering

SonarQube 10+ introduced a new classification system based on **Software Quality** and **Impact Severity**, which differs from the legacy system.

| Console Category  | New Filter (`--software-qualities`) | Legacy Filter (`--types`) |
| ----------------- | ----------------------------------- | ------------------------- |
| Security          | `SECURITY`                          | `VULNERABILITY`           |
| Reliability       | `RELIABILITY`                       | `BUG`                     |
| Maintainability   | `MAINTAINABILITY`                   | `CODE_SMELL`              |

| Console Severity | New Filter (`--impact-severities`) | Legacy Filter (`--severities`)        |
| ---------------- | ---------------------------------- | ------------------------------------- |
| High             | `HIGH`                             | `BLOCKER,CRITICAL`                    |
| Medium           | `MEDIUM`                           | `MAJOR`                               |
| Low              | `LOW`                              | `MINOR`                               |
| Info             | `INFO`                             | `INFO`                                |

> **Tip:** To match the numbers shown in SonarQube 10+ console, use `--software-qualities` and `--impact-severities` instead of `--types` and `--severities`.

### Library Usage

```typescript
import { generateReport } from "@natsunaaa/export-sonarqube-report";

const outputPath = await generateReport(
  {
    baseUrl: "http://localhost:9000",
    token: process.env.SONAR_TOKEN!,
    projectKey: "my-project",
  },
  {
    output: "report.pdf",
    title: "Sprint Report",
    softwareQualities: ["RELIABILITY"],
    impactSeverities: ["HIGH", "MEDIUM"],
  },
);
```

#### Using the client directly

```typescript
import { SonarQubeClient } from "@natsunaaa/export-sonarqube-report";

const client = new SonarQubeClient({
  baseUrl: "http://localhost:9000",
  token: process.env.SONAR_TOKEN!,
  projectKey: "my-project",
});

const metrics = await client.getMetrics();
const qualityGate = await client.getQualityGateStatus();
const { issues, total } = await client.getIssues({
  impactSeverities: ["HIGH"],
  softwareQualities: ["RELIABILITY"],
});
```

### Report Contents

- Quality Gate status (PASSED / FAILED)
- Metrics: bugs, vulnerabilities, code smells, coverage, duplications, lines of code, ratings
- Issues grouped by Software Quality and impact severity (SonarQube 10+)
- Issue details with file location, source snippets, and rule descriptions

### Requirements

- Node.js >= 18
- SonarQube server with a valid user token

---

## 한국어

SonarQube Community Edition에는 리포트 기능이 없습니다. 이 도구는 SonarQube Web API를 호출하여 Quality Gate 상태, 메트릭, 이슈를 포함한 PDF 리포트를 생성합니다.

### 예시

```bash
# 기본 리포트 (전체 이슈 포함)
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 \
  -t <소나큐브-토큰> \
  -k my-project-key \
  -o report.pdf

# SonarQube 10+: Software Quality 기준 필터 (콘솔 카테고리와 동일)
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --software-qualities RELIABILITY -o reliability-report.pdf

# SonarQube 10+: impact severity 기준 필터
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --impact-severities HIGH,MEDIUM -o high-medium-report.pdf

# 레거시: 타입 기준 필터 (BUG만)
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --types BUG -o bugs-report.pdf

# 소스코드 스니펫 + 룰 설명 포함 상세 리포트
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --software-qualities RELIABILITY --impact-severities HIGH \
  --detail -o critical-reliability.pdf

# 메트릭 + Quality Gate만 (이슈 제외)
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --no-issues -o summary.pdf

# SONAR_TOKEN 환경변수 사용
SONAR_TOKEN=your-token npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t -k my-project -o report.pdf
```

### 설치

```bash
npm i @natsunaaa/export-sonarqube-report
```

### CLI 사용법

```bash
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 \
  -t <소나큐브-토큰> \
  -k my-project-key \
  -o report.pdf
```

#### 옵션

| 옵션                            | 설명                                                              |
| ------------------------------- | ----------------------------------------------------------------- |
| `-u, --url <url>`               | SonarQube 서버 URL (필수)                                         |
| `-t, --token <token>`           | 인증 토큰, 또는 `SONAR_TOKEN` 환경변수 사용 (필수)                |
| `-k, --project-key <key>`       | SonarQube 프로젝트 키 (필수)                                      |
| `-o, --output <path>`           | 출력 PDF 파일 경로                                                |
| `--title <title>`               | 리포트 제목                                                       |
| `--no-issues`                   | 이슈 목록 제외                                                    |
| `--detail`                      | 소스코드 스니펫 및 룰 설명 포함                                   |
| `--severities <list>`           | 레거시 심각도 필터: `BLOCKER,CRITICAL,MAJOR,MINOR,INFO`            |
| `--impact-severities <list>`    | Impact 심각도 필터 (SonarQube 10+): `HIGH,MEDIUM,LOW,INFO`        |
| `--software-qualities <list>`   | Software Quality 필터 (SonarQube 10+): `SECURITY,RELIABILITY,MAINTAINABILITY` |
| `--types <list>`                | 이슈 타입 필터: `BUG,VULNERABILITY,CODE_SMELL`                    |

#### SonarQube 10+ vs 레거시 필터링

SonarQube 10+에서는 **Software Quality**와 **Impact Severity** 기반의 새로운 분류 체계를 도입했습니다. 콘솔에 보이는 숫자와 동일한 결과를 얻으려면 새 필터를 사용하세요.

| 콘솔 카테고리     | 새 필터 (`--software-qualities`)    | 레거시 필터 (`--types`)   |
| ----------------- | ----------------------------------- | ------------------------- |
| Security          | `SECURITY`                          | `VULNERABILITY`           |
| Reliability       | `RELIABILITY`                       | `BUG`                     |
| Maintainability   | `MAINTAINABILITY`                   | `CODE_SMELL`              |

| 콘솔 심각도 | 새 필터 (`--impact-severities`)    | 레거시 필터 (`--severities`)          |
| ----------- | ---------------------------------- | ------------------------------------- |
| High        | `HIGH`                             | `BLOCKER,CRITICAL`                    |
| Medium      | `MEDIUM`                           | `MAJOR`                               |
| Low         | `LOW`                              | `MINOR`                               |
| Info        | `INFO`                             | `INFO`                                |

> **팁:** SonarQube 10+ 콘솔에 표시되는 숫자와 일치시키려면 `--types`/`--severities` 대신 `--software-qualities`/`--impact-severities`를 사용하세요.

### 라이브러리 사용법

```typescript
import { generateReport } from "@natsunaaa/export-sonarqube-report";

const outputPath = await generateReport(
  {
    baseUrl: "http://localhost:9000",
    token: process.env.SONAR_TOKEN!,
    projectKey: "my-project",
  },
  {
    output: "report.pdf",
    title: "스프린트 리포트",
    softwareQualities: ["RELIABILITY"],
    impactSeverities: ["HIGH", "MEDIUM"],
  },
);
```

#### 클라이언트 직접 사용

```typescript
import { SonarQubeClient } from "@natsunaaa/export-sonarqube-report";

const client = new SonarQubeClient({
  baseUrl: "http://localhost:9000",
  token: process.env.SONAR_TOKEN!,
  projectKey: "my-project",
});

const metrics = await client.getMetrics();
const qualityGate = await client.getQualityGateStatus();
const { issues, total } = await client.getIssues({
  impactSeverities: ["HIGH"],
  softwareQualities: ["RELIABILITY"],
});
```

### 리포트 내용

- Quality Gate 상태 (PASSED / FAILED)
- 메트릭: 버그, 취약점, 코드 스멜, 커버리지, 중복률, 코드 라인 수, 등급
- Software Quality 및 Impact Severity 기준 이슈 분류 (SonarQube 10+)
- 이슈 상세 (파일 위치, 소스코드 스니펫, 룰 설명)

### 요구사항

- Node.js >= 18
- 유효한 사용자 토큰이 있는 SonarQube 서버

---

## 中文

SonarQube Community Edition 不包含报告功能。本工具通过调用 SonarQube Web API，生成包含质量门状态、指标和问题的 PDF 报告。

### 示例

```bash
# 基本报告（包含所有问题）
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 \
  -t <你的SonarQube令牌> \
  -k my-project-key \
  -o report.pdf

# SonarQube 10+：按软件质量过滤（与控制台分类一致）
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --software-qualities RELIABILITY -o reliability-report.pdf

# SonarQube 10+：按影响严重程度过滤
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --impact-severities HIGH,MEDIUM -o high-medium-report.pdf

# 旧版：按类型过滤（仅 BUG）
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --types BUG -o bugs-report.pdf

# 包含源代码片段和规则说明的详细报告
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --software-qualities RELIABILITY --impact-severities HIGH \
  --detail -o critical-reliability.pdf

# 仅指标 + 质量门（不含问题）
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t <token> -k my-project \
  --no-issues -o summary.pdf

# 使用 SONAR_TOKEN 环境变量
SONAR_TOKEN=your-token npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 -t -k my-project -o report.pdf
```

### 安装

```bash
npm i @natsunaaa/export-sonarqube-report
```

### CLI 使用方法

```bash
npx @natsunaaa/export-sonarqube-report \
  -u http://localhost:9000 \
  -t <你的SonarQube令牌> \
  -k my-project-key \
  -o report.pdf
```

#### 选项

| 选项                            | 说明                                                               |
| ------------------------------- | ------------------------------------------------------------------ |
| `-u, --url <url>`               | SonarQube 服务器 URL（必填）                                       |
| `-t, --token <token>`           | 认证令牌，或设置 `SONAR_TOKEN` 环境变量（必填）                    |
| `-k, --project-key <key>`       | SonarQube 项目键（必填）                                           |
| `-o, --output <path>`           | 输出 PDF 文件路径                                                  |
| `--title <title>`               | 报告标题                                                           |
| `--no-issues`                   | 不包含问题列表                                                     |
| `--detail`                      | 包含源代码片段和规则说明                                           |
| `--severities <list>`           | 按旧版严重程度过滤：`BLOCKER,CRITICAL,MAJOR,MINOR,INFO`            |
| `--impact-severities <list>`    | 按影响严重程度过滤（SonarQube 10+）：`HIGH,MEDIUM,LOW,INFO`        |
| `--software-qualities <list>`   | 按软件质量过滤（SonarQube 10+）：`SECURITY,RELIABILITY,MAINTAINABILITY` |
| `--types <list>`                | 按问题类型过滤：`BUG,VULNERABILITY,CODE_SMELL`                     |

#### SonarQube 10+ 与旧版过滤对比

SonarQube 10+ 引入了基于**软件质量**和**影响严重程度**的新分类系统。要获得与控制台一致的数字，请使用新过滤器。

| 控制台分类        | 新过滤器 (`--software-qualities`)   | 旧版过滤器 (`--types`)    |
| ----------------- | ----------------------------------- | ------------------------- |
| Security          | `SECURITY`                          | `VULNERABILITY`           |
| Reliability       | `RELIABILITY`                       | `BUG`                     |
| Maintainability   | `MAINTAINABILITY`                   | `CODE_SMELL`              |

| 控制台严重程度 | 新过滤器 (`--impact-severities`)   | 旧版过滤器 (`--severities`)           |
| -------------- | ---------------------------------- | ------------------------------------- |
| High           | `HIGH`                             | `BLOCKER,CRITICAL`                    |
| Medium         | `MEDIUM`                           | `MAJOR`                               |
| Low            | `LOW`                              | `MINOR`                               |
| Info           | `INFO`                             | `INFO`                                |

> **提示：** 要匹配 SonarQube 10+ 控制台显示的数字，请使用 `--software-qualities`/`--impact-severities` 代替 `--types`/`--severities`。

### 作为库使用

```typescript
import { generateReport } from "@natsunaaa/export-sonarqube-report";

const outputPath = await generateReport(
  {
    baseUrl: "http://localhost:9000",
    token: process.env.SONAR_TOKEN!,
    projectKey: "my-project",
  },
  {
    output: "report.pdf",
    title: "Sprint 报告",
    softwareQualities: ["RELIABILITY"],
    impactSeverities: ["HIGH", "MEDIUM"],
  },
);
```

#### 直接使用客户端

```typescript
import { SonarQubeClient } from "@natsunaaa/export-sonarqube-report";

const client = new SonarQubeClient({
  baseUrl: "http://localhost:9000",
  token: process.env.SONAR_TOKEN!,
  projectKey: "my-project",
});

const metrics = await client.getMetrics();
const qualityGate = await client.getQualityGateStatus();
const { issues, total } = await client.getIssues({
  impactSeverities: ["HIGH"],
  softwareQualities: ["RELIABILITY"],
});
```

### 报告内容

- 质量门状态（PASSED / FAILED）
- 指标：缺陷、漏洞、代码异味、覆盖率、重复率、代码行数、评级
- 按软件质量和影响严重程度分组的问题（SonarQube 10+）
- 问题详情（包含文件位置、源代码片段、规则说明）

### 系统要求

- Node.js >= 18
- 拥有有效用户令牌的 SonarQube 服务器

---

## License

MIT
