# @natsunaaa/export-sonarqube-report

Generate PDF reports from SonarQube Community Edition.

[English](#english) | [한국어](#한국어) | [中文](#中文)

---

## English

Community Edition doesn't include built-in reporting. This tool fills that gap by calling the SonarQube Web API and generating a PDF with quality gate status, metrics, and issues.

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

| Option                    | Description                                               |
| ------------------------- | --------------------------------------------------------- |
| `-u, --url <url>`         | SonarQube server URL (required)                           |
| `-t, --token <token>`     | Authentication token, or set `SONAR_TOKEN` env (required) |
| `-k, --project-key <key>` | SonarQube project key (required)                          |
| `-o, --output <path>`     | Output PDF file path                                      |
| `--title <title>`         | Custom report title                                       |
| `--no-issues`             | Exclude issues from report                                |
| `--detail`                | Include source snippets and rule descriptions             |
| `--severities <list>`     | Filter by severity: `BLOCKER,CRITICAL,MAJOR,MINOR,INFO`   |

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
    severities: ["BLOCKER", "CRITICAL"],
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
const { issues, total } = await client.getIssues({ severities: ["BLOCKER"] });
```

### Report Contents

- Quality Gate status (PASSED / FAILED)
- Metrics: bugs, vulnerabilities, code smells, coverage, duplications, lines of code, ratings
- Issues grouped by severity and type
- Issue details with file location

### Requirements

- Node.js >= 18
- SonarQube server with a valid user token

---

## 한국어

SonarQube Community Edition에는 리포트 기능이 없습니다. 이 도구는 SonarQube Web API를 호출하여 Quality Gate 상태, 메트릭, 이슈를 포함한 PDF 리포트를 생성합니다.

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

| 옵션                      | 설명                                               |
| ------------------------- | -------------------------------------------------- |
| `-u, --url <url>`         | SonarQube 서버 URL (필수)                          |
| `-t, --token <token>`     | 인증 토큰, 또는 `SONAR_TOKEN` 환경변수 사용 (필수) |
| `-k, --project-key <key>` | SonarQube 프로젝트 키 (필수)                       |
| `-o, --output <path>`     | 출력 PDF 파일 경로                                 |
| `--title <title>`         | 리포트 제목                                        |
| `--no-issues`             | 이슈 목록 제외                                     |
| `--detail`                | 소스코드 스니펫 및 룰 설명 포함                    |
| `--severities <list>`     | 심각도 필터: `BLOCKER,CRITICAL,MAJOR,MINOR,INFO`   |

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
    severities: ["BLOCKER", "CRITICAL"],
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
const { issues, total } = await client.getIssues({ severities: ["BLOCKER"] });
```

### 리포트 내용

- Quality Gate 상태 (PASSED / FAILED)
- 메트릭: 버그, 취약점, 코드 스멜, 커버리지, 중복률, 코드 라인 수, 등급
- 심각도/타입별 이슈 분류
- 이슈 상세 (파일 위치 포함)

### 요구사항

- Node.js >= 18
- 유효한 사용자 토큰이 있는 SonarQube 서버

---

## 中文

SonarQube Community Edition 不包含报告功能。本工具通过调用 SonarQube Web API，生成包含质量门状态、指标和问题的 PDF 报告。

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

| 选项                      | 说明                                                |
| ------------------------- | --------------------------------------------------- |
| `-u, --url <url>`         | SonarQube 服务器 URL（必填）                        |
| `-t, --token <token>`     | 认证令牌，或设置 `SONAR_TOKEN` 环境变量（必填）     |
| `-k, --project-key <key>` | SonarQube 项目键（必填）                            |
| `-o, --output <path>`     | 输出 PDF 文件路径                                   |
| `--title <title>`         | 报告标题                                            |
| `--no-issues`             | 不包含问题列表                                      |
| `--detail`                | 包含源代码片段和规则说明                            |
| `--severities <list>`     | 按严重程度过滤：`BLOCKER,CRITICAL,MAJOR,MINOR,INFO` |

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
    severities: ["BLOCKER", "CRITICAL"],
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
const { issues, total } = await client.getIssues({ severities: ["BLOCKER"] });
```

### 报告内容

- 质量门状态（PASSED / FAILED）
- 指标：缺陷、漏洞、代码异味、覆盖率、重复率、代码行数、评级
- 按严重程度和类型分组的问题
- 问题详情（包含文件位置）

### 系统要求

- Node.js >= 18
- 拥有有效用户令牌的 SonarQube 服务器

---

## License

MIT
