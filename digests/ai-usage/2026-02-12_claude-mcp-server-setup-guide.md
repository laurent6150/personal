# Claude MCP 서버 완벽 가이드: AI를 외부 세계와 연결하기

## 메타 정보
- **출처**: [Claude Code Docs - MCP](https://code.claude.com/docs/en/mcp), [Model Context Protocol](https://modelcontextprotocol.io/docs/develop/build-server)
- **저자**: Anthropic
- **작성일**: 2026-01 (지속 업데이트)
- **수집일**: 2026-02-12
- **카테고리**: AI 활용

---

## 한 줄 요약
> MCP(Model Context Protocol)는 Claude를 실시간 도구, 데이터베이스, API와 연결하는 개방형 표준으로, 2026년 Desktop Extensions로 설치가 브라우저 확장 프로그램처럼 쉬워졌다

---

## 핵심 내용 요약

### 문제 인식
- AI 어시스턴트는 학습 데이터에 갇혀 실시간 정보에 접근 불가
- 외부 도구와 연결하려면 복잡한 API 통합 필요
- 각 도구마다 다른 인증, 포맷, 프로토콜 → 통합 비용 증가

### 핵심 메시지
1. **MCP는 AI의 USB 포트**: 표준화된 방식으로 수백 개의 외부 도구 연결 가능
2. **클라이언트-서버 구조**: Claude(클라이언트)가 MCP 서버(게이트키퍼)를 통해 도구에 접근
3. **2026년: Desktop Extensions 도입**: 한 번의 클릭으로 MCP 서버 설치 가능

### 주요 개념/프레임워크

#### MCP 아키텍처
```
[Claude] ←→ [MCP Server] ←→ [외부 도구/API/DB]
 클라이언트     게이트키퍼        실제 데이터
```

| 구성요소 | 역할 |
|----------|------|
| **MCP Client** | AI 앱 (Claude)이 정보를 요청하거나 작업 수행 |
| **MCP Server** | 도구 연결, 인증 처리, 데이터 포맷팅, 깔끔한 응답 반환 |

#### 연결 방식
| 방식 | 용도 | 특징 |
|------|------|------|
| **HTTP** | 원격/클라우드 서버 | 권장 옵션, 가장 널리 지원 |
| **stdio** | 로컬 서버 | 로컬 파일/도구 접근 |
| **Desktop Extensions** | 간편 설치 | 2026년 신규, 원클릭 설치 |

---

## 상세 내용

### Claude Code에서 MCP 사용하기

**기본 명령어:**
```bash
# 서버 추가
claude mcp add [name] --scope user

# 서버 목록 확인
claude mcp list

# 서버 제거
claude mcp remove [name]
```

**설정 파일 위치:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Desktop Extensions (2026년 신기능)

기존 방식의 문제:
- JSON 파일 수동 편집 필요
- 의존성 관리 복잡
- 기술적 지식 요구

**새로운 방식:**
1. Claude Desktop → Settings → Extensions
2. "Browse extensions" 클릭
3. Anthropic이 검토한 도구 중 선택 → 원클릭 설치

→ **브라우저 확장 프로그램처럼 쉬운 설치**

### 인기 MCP 서버 예시

| 서버 | 기능 |
|------|------|
| **Filesystem** | 로컬 파일 읽기/쓰기 |
| **GitHub** | 레포, 이슈, PR 관리 |
| **Slack** | 메시지 전송, 채널 관리 |
| **Google Drive** | 문서 접근 및 편집 |
| **Salesforce** | CRM 데이터 조회/수정 |
| **Database** | SQL 쿼리 실행 |

### 보안 고려사항

MCP 서버는 강력한 접근 권한을 가지므로:
- 신뢰할 수 있는 서버만 설치
- 필요한 최소 권한만 부여
- Anthropic 검토 서버 우선 사용

---

## 활용 사례

### 원문 사례
- **Salesforce MCP**: DX MCP Server로 CRM 데이터 직접 조회
- **A2A Protocol**: MCP와 Agent-to-Agent 프로토콜 연결로 에이전트 간 협업

### 적용 아이디어
- **운영 자동화**: Slack MCP로 일일 리포트 자동 전송
- **데이터 분석**: Database MCP로 운영 지표 실시간 조회
- **문서 관리**: Google Drive MCP로 팀 문서 검색 및 요약
- **GitHub 연동**: PR 리뷰, 이슈 관리를 Claude로 처리

---

## 실천 포인트

### 즉시 적용 (5분)
- Claude Desktop에서 Settings → Extensions 확인
- 현재 설치된 MCP 서버 목록 확인: `claude mcp list`

### 단기 적용 (이번 주)
- Filesystem MCP 설치하여 로컬 파일 작업 테스트
- 자주 쓰는 도구 중 MCP 서버가 있는지 검색

### 장기 고려
- 팀에서 공통으로 사용할 MCP 서버 세트 정의
- 커스텀 MCP 서버 개발 검토 (내부 API 연동)
- MCP 보안 가이드라인 수립

---

## 관련 키워드
`#MCP` `#ModelContextProtocol` `#ClaudeCode` `#AI통합` `#자동화`

---

## 원문 링크
- [Claude Code Docs - MCP](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol - Build Server](https://modelcontextprotocol.io/docs/develop/build-server)
- [Claude Help - Getting Started with MCP](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop)
