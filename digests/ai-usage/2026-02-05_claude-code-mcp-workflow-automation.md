# Claude Code와 MCP로 워크플로우 자동화 구축하기

## 메타 정보
- **출처**: [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp), [Model Context Protocol](https://modelcontextprotocol.io/)
- **저자**: Anthropic
- **작성일**: 2026-02-05
- **수집일**: 2026-02-05
- **카테고리**: AI 활용

---

## 한 줄 요약
> MCP(Model Context Protocol)는 AI 에이전트가 외부 도구, 데이터베이스, API와 연결되는 표준 프로토콜로, Claude Code를 통해 진정한 end-to-end 업무 자동화가 가능해진다.

---

## 핵심 내용 요약

### 문제 인식
- AI 모델들이 고립되어 외부 시스템과 연결되지 못하는 문제
- 각 도구마다 별도의 통합 작업이 필요한 파편화 문제
- "AI가 코드를 작성한다"를 넘어 "AI가 업무를 수행한다"로의 전환 필요

### 핵심 메시지
1. **MCP = USB-C for LLMs**: USB-C가 기기 연결의 표준이듯, MCP는 LLM과 외부 시스템 연결의 표준
2. **2026 Workflow Shift**: "AI writes code" → "AI runs work" 로의 패러다임 전환
3. **진정한 자동화**: MCP 서버 설정으로 Claude가 작업을 "말하는" 것이 아니라 실제로 "수행"
4. **생태계 확장**: 수백 개의 MCP 서버가 이미 존재하며 계속 증가 중

### 주요 개념/프레임워크

#### MCP 아키텍처
```
AI Application (Claude) ←→ MCP Protocol ←→ External Systems
                                              ├── 파일 시스템
                                              ├── 데이터베이스
                                              ├── API (GitHub, Sentry, etc.)
                                              └── 워크플로우 도구
```

#### MCP 서버 유형
| 유형 | 설명 | 사용 사례 |
|------|------|----------|
| HTTP | 클라우드 기반 원격 서버 | GitHub, Notion, Sentry |
| SSE | Server-Sent Events (deprecated) | 레거시 서비스 |
| stdio | 로컬 프로세스 | 파일시스템, 커스텀 스크립트 |

---

## 상세 내용

### MCP로 할 수 있는 것들

Claude Code에 MCP 서버를 연결하면 다음과 같은 요청이 가능해진다:

1. **이슈 트래커에서 기능 구현**
   > "JIRA issue ENG-4521에 설명된 기능을 추가하고 GitHub에 PR을 생성해줘"

2. **모니터링 데이터 분석**
   > "Sentry와 Statsig을 확인해서 ENG-4521 기능의 사용량을 체크해줘"

3. **데이터베이스 쿼리**
   > "PostgreSQL 데이터베이스에서 ENG-4521 기능을 사용한 무작위 사용자 10명의 이메일을 찾아줘"

4. **디자인 통합**
   > "Slack에 올라온 새 Figma 디자인을 기반으로 표준 이메일 템플릿을 업데이트해줘"

5. **워크플로우 자동화**
   > "이 10명의 사용자를 새 기능 피드백 세션에 초대하는 Gmail 초안을 만들어줘"

### MCP 서버 설치 방법

#### 1. 원격 HTTP 서버 추가 (권장)
```bash
# 기본 문법
claude mcp add --transport http <name> <url>

# 예시: Notion 연결
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Bearer 토큰 포함
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

#### 2. 로컬 stdio 서버 추가
```bash
# 기본 문법
claude mcp add [options] <name> -- <command> [args...]

# 예시: Airtable 서버 추가
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server
```

### 실용적 예시: Sentry로 에러 모니터링

```bash
# 1. Sentry MCP 서버 추가
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# 2. /mcp로 인증
> /mcp

# 3. 프로덕션 이슈 디버깅
> "지난 24시간 동안 가장 흔한 에러가 뭐야?"
> "에러 ID abc123의 스택 트레이스를 보여줘"
> "어느 배포에서 이 새 에러들이 발생했어?"
```

### 인기 MCP 서버 목록

| 서버 | 용도 |
|------|------|
| GitHub | 코드 리뷰, PR, 이슈 관리 |
| Sentry | 에러 모니터링, 디버깅 |
| Notion | 문서 관리 |
| PostgreSQL | 데이터베이스 쿼리 |
| Slack | 메시지, 알림 |
| Figma | 디자인 파일 접근 |
| Gmail | 이메일 자동화 |

### MCP Scope 관리

| Scope | 설명 | 사용 사례 |
|-------|------|----------|
| local | 현재 프로젝트에서만 사용 | 개인 개발 서버, 실험적 설정 |
| project | 팀 전체 공유 (.mcp.json) | 팀 공통 도구 |
| user | 모든 프로젝트에서 사용 | 개인 유틸리티 |

---

## 활용 사례

### 원문 사례
- **Issue → PR 자동화**: JIRA 이슈 읽기 → 코드 구현 → GitHub PR 생성의 전 과정 자동화
- **에러 분석**: Sentry 에러 → 원인 분석 → 수정 코드 제안의 워크플로우
- **데이터 기반 의사결정**: 데이터베이스 쿼리 → 분석 → 이메일 작성의 연결

### 적용 아이디어
- **운영 팀 맥락에서**:
  - Slack 알림 → 이슈 분석 → 대응 가이드 생성 자동화
  - 운영 데이터베이스 쿼리 → 일일 리포트 자동 생성
  - 고객 피드백 수집 → 패턴 분석 → 개선안 제안

- **개인 생산성**:
  - GitHub 이슈 → 코드 구현 → PR 생성의 전체 워크플로우
  - 미팅 노트(Notion) → 액션 아이템 추출 → 태스크 생성

---

## 실천 포인트

### 즉시 적용 (5분)
- Claude Code에서 `/mcp` 명령어로 현재 연결된 MCP 서버 확인
- `claude mcp list`로 설치된 서버 목록 점검

### 단기 적용 (이번 주)
- 가장 자주 사용하는 서비스(GitHub, Notion 등) MCP 서버 1개 연결
- 반복적으로 수행하는 작업 1가지를 MCP 기반으로 자동화 시도
  ```bash
  # 예시: GitHub 연결
  claude mcp add --transport http github https://api.githubcopilot.com/mcp/
  ```

### 장기 고려
- 팀 전체가 사용할 MCP 서버 목록 정의 및 `.mcp.json`으로 공유
- 커스텀 MCP 서버 개발 검토 (내부 시스템 연동용)
- MCP 기반 워크플로우 표준화 및 문서화

---

## 관련 키워드
`#MCP` `#ClaudeCode` `#워크플로우자동화` `#AIAgent` `#Anthropic` `#ModelContextProtocol`

---

## 원문 링크
- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol - Introduction](https://modelcontextprotocol.io/introduction)
- [GitHub MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
